import { HERO_IMAGE, SAMPLE_DESTINATIONS } from '../data/sampleDestinations';
import {
  AccommodationSuggestion,
  BudgetBreakdown,
  GeminiApiItineraryPayload,
  Itinerary,
  ItineraryDay,
  PackingItem,
  TimelineActivity,
  TripFormValues,
} from '../types/trip';
import {
  calculateDaysBetween,
  formatDateShort,
  formatDayDate,
} from '../utils/formatters';

/**
 * TripMind AI Client Service
 * Communicates strictly with the server-side `/api/generate-itinerary` endpoint
 * (powered by Google Gemini). Never falls back silently to hardcoded itineraries.
 */

export class TripGenerationError extends Error {
  code: string;
  retryable: boolean;
  statusCode?: number;

  constructor(message: string, code: string, retryable = true, statusCode?: number) {
    super(message);
    this.name = 'TripGenerationError';
    this.code = code;
    this.retryable = retryable;
    this.statusCode = statusCode;
  }
}

const CLIENT_TIMEOUT_MS = 65_000;

function matchLocalHeroImage(destinationText: string): { src: string; alt: string } {
  const normalized = destinationText.trim().toLowerCase();
  for (const dest of SAMPLE_DESTINATIONS) {
    if (
      normalized.includes(dest.slug) ||
      normalized.includes(dest.name.toLowerCase()) ||
      normalized.includes(dest.country.toLowerCase())
    ) {
      return { src: dest.image, alt: dest.imageAlt };
    }
  }
  if (normalized.includes('swiss') || normalized.includes('alps')) {
    const zermatt = SAMPLE_DESTINATIONS.find((d) => d.slug === 'zermatt');
    if (zermatt) return { src: zermatt.image, alt: zermatt.imageAlt };
  }
  if (normalized.includes('bali')) {
    const ubud = SAMPLE_DESTINATIONS.find((d) => d.slug === 'ubud-bali');
    if (ubud) return { src: ubud.image, alt: ubud.imageAlt };
  }
  return {
    src: HERO_IMAGE.src,
    alt: `Scenic travel photography representing ${destinationText}`,
  };
}

function mapGeminiPayloadToItinerary(
  payload: GeminiApiItineraryPayload,
  input: TripFormValues
): Itinerary {
  if (!payload || !Array.isArray(payload.days) || payload.days.length === 0) {
    throw new TripGenerationError(
      'The AI returned an incomplete itinerary without daily plans. Please retry.',
      'INVALID_AI_RESPONSE',
      true
    );
  }

  const computedDays =
    input.durationMode === 'dates' && input.startDate && input.endDate
      ? Math.min(21, Math.max(1, calculateDaysBetween(input.startDate, input.endDate)))
      : Math.min(21, Math.max(1, Math.round(input.numberOfDays || payload.duration || 4)));

  const dateRangeLabel =
    input.durationMode === 'dates' && input.startDate && input.endDate
      ? `${formatDateShort(input.startDate)} – ${formatDateShort(input.endDate)}`
      : `${payload.days.length} Flexible ${payload.days.length === 1 ? 'Day' : 'Days'}`;

  const hero = matchLocalHeroImage(`${payload.destination || input.destination} ${payload.country || ''}`);

  const days: ItineraryDay[] = payload.days.map((dayObj, index) => {
    const dayNumber = Number.isFinite(dayObj.day) && dayObj.day > 0 ? dayObj.day : index + 1;
    const activities: TimelineActivity[] = [];

    const appendSlot = (
      slot: TimelineActivity['slot'],
      list: GeminiApiItineraryPayload['days'][number]['morning']
    ) => {
      if (!Array.isArray(list)) return;
      list.forEach((act, idx) => {
        activities.push({
          id: `day-${dayNumber}-${slot.toLowerCase()}-${idx + 1}`,
          slot,
          timeRange: act.timeRange || slot,
          title: act.title,
          place: act.place || payload.destination,
          description: act.description,
          estimatedCost: Math.max(0, Math.round(Number(act.estimatedCost) || 0)),
        });
      });
    };

    appendSlot('Morning', dayObj.morning);
    appendSlot('Afternoon', dayObj.afternoon);
    appendSlot('Evening', dayObj.evening);

    const fallbackDateLabel =
      input.durationMode === 'dates' && input.startDate
        ? formatDayDate(input.startDate, index)
        : undefined;

    const activityCostSum = activities.reduce((sum, a) => sum + a.estimatedCost, 0);

    return {
      dayNumber,
      dateLabel: dayObj.date?.trim() || fallbackDateLabel,
      theme: dayObj.title || `Day ${dayNumber} in ${payload.destination}`,
      estimatedDailyCost: Math.max(0, Math.round(Number(dayObj.estimatedCost) || activityCostSum)),
      activities,
      recommendedAttractions: Array.isArray(dayObj.recommendedAttractions)
        ? dayObj.recommendedAttractions.filter(Boolean)
        : [],
      dayFoodRecommendations: Array.isArray(dayObj.foodRecommendations)
        ? dayObj.foodRecommendations.filter(Boolean)
        : [],
      dayTransportation: Array.isArray(dayObj.transportation)
        ? dayObj.transportation.filter(Boolean)
        : [],
    };
  });

  const eb = payload.estimatedBudget;
  const budgetBreakdown: BudgetBreakdown = {
    accommodation: Math.max(0, Math.round(Number(eb?.accommodation) || 0)),
    food: Math.max(0, Math.round(Number(eb?.food) || 0)),
    transportation: Math.max(0, Math.round(Number(eb?.transportation) || 0)),
    activities: Math.max(0, Math.round(Number(eb?.activities) || 0)),
    shopping: Math.max(0, Math.round(Number(eb?.shopping) || 0)),
    miscellaneous: Math.max(0, Math.round(Number(eb?.miscellaneous) || 0)),
  };

  const sumBreakdown =
    budgetBreakdown.accommodation +
    budgetBreakdown.food +
    budgetBreakdown.transportation +
    budgetBreakdown.activities +
    (budgetBreakdown.shopping ?? 0) +
    (budgetBreakdown.miscellaneous ?? 0);

  const estimatedTotalCost = Math.max(0, Math.round(Number(eb?.total) || sumBreakdown));

  const accommodations: AccommodationSuggestion[] = Array.isArray(payload.accommodationSuggestions)
    ? payload.accommodationSuggestions.map((acc) => ({
        tier: acc.tier,
        name: acc.propertyType,
        neighborhood: acc.area,
        description: acc.description,
        estimatedNightlyRate: Math.max(0, Math.round(Number(acc.estimatedNightlyRate) || 0)),
      }))
    : [];

  const packingChecklist: PackingItem[] = Array.isArray(payload.packingChecklist)
    ? payload.packingChecklist.map((entry, idx) => ({
        id: `ai-pack-${idx + 1}`,
        item: entry.item,
        category: entry.category,
        checked: false,
      }))
    : [];

  return {
    id: `ai-trip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tripTitle: payload.tripTitle?.trim() || `${computedDays} Days in ${payload.destination}`,
    destination: payload.destination?.trim() || input.destination.trim(),
    country: payload.country?.trim() || '',
    startingLocation: input.startingLocation.trim(),
    heroImage: hero.src,
    heroImageAlt: hero.alt,
    dateRangeLabel,
    numberOfDays: days.length,
    travelers: input.travelers,
    currency: input.currency,
    totalBudget: input.totalBudget,
    estimatedTotalCost,
    travelStyle: input.travelStyle,
    pace: input.pace,
    interests: input.interests,
    accommodationPreference: input.accommodationPreference,
    dietaryPreference: input.dietaryPreference,
    additionalInstructions: input.additionalInstructions.trim(),
    summary: payload.summary,
    budgetBreakdown,
    days,
    placesToVisit: Array.isArray(payload.placesToVisit) ? payload.placesToVisit : [],
    foodRecommendations: Array.isArray(payload.localFood) ? payload.localFood : [],
    accommodations,
    transportation: Array.isArray(payload.generalTransportation) ? payload.generalTransportation : [],
    travelTips: Array.isArray(payload.travelTips) ? payload.travelTips : [],
    packingChecklist,
    createdAt: new Date().toISOString(),
    dataSource: 'gemini-ai',
    sourceFormValues: { ...input },
  };
}

export async function generateAiItinerary(
  input: TripFormValues,
  options?: { regenerate?: boolean }
): Promise<Itinerary> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new TripGenerationError(
      'No internet connection detected. Please reconnect to the internet and try again.',
      'OFFLINE',
      true
    );
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

  try {
    const response = await fetch('/api/generate-itinerary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        ...input,
        regenerate: Boolean(options?.regenerate),
        variationSeed: options?.regenerate ? Math.floor(Math.random() * 1_000_000) : undefined,
      }),
    });

    let body: {
      data?: GeminiApiItineraryPayload;
      error?: { code?: string; message?: string; retryable?: boolean };
    } | null = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (!response.ok) {
      const errCode = body?.error?.code || `HTTP_${response.status}`;
      const errMessage =
        body?.error?.message ||
        (response.status === 429
          ? 'Gemini API rate limit reached. Please wait a few seconds and try again.'
          : response.status >= 500
            ? 'Our itinerary service encountered a server error. Please try again.'
            : 'Unable to generate your itinerary with the provided inputs.');
      const retryable = body?.error?.retryable ?? response.status >= 429;
      throw new TripGenerationError(errMessage, errCode, retryable, response.status);
    }

    if (!body?.data) {
      throw new TripGenerationError(
        'Received an empty response from the itinerary service. Please retry.',
        'EMPTY_RESPONSE',
        true,
        response.status
      );
    }

    return mapGeminiPayloadToItinerary(body.data, input);
  } catch (err) {
    if (err instanceof TripGenerationError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new TripGenerationError(
        'The request timed out while waiting for Gemini AI to finish your itinerary. Please try again.',
        'CLIENT_TIMEOUT',
        true
      );
    }
    throw new TripGenerationError(
      'Network error while connecting to the itinerary service. Check your connection and try again.',
      'NETWORK_ERROR',
      true
    );
  } finally {
    window.clearTimeout(timeoutId);
  }
}
