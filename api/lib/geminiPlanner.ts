import { GoogleGenAI, ThinkingLevel } from '@google/genai';

export interface PlannerRequestPayload {
  destination: string;
  startingLocation: string;
  durationMode: 'dates' | 'days';
  startDate?: string;
  endDate?: string;
  numberOfDays: number;
  travelers: number;
  totalBudget: number;
  currency: string;
  travelStyle: string;
  interests: string[];
  pace: string;
  accommodationPreference?: string;
  dietaryPreference?: string;
  additionalInstructions?: string;
  regenerate?: boolean;
  variationSeed?: number;
}

export interface GeminiDayActivity {
  timeRange: string;
  title: string;
  place: string;
  description: string;
  estimatedCost: number;
}

export interface GeminiItineraryDay {
  day: number;
  date?: string;
  title: string;
  morning: GeminiDayActivity[];
  afternoon: GeminiDayActivity[];
  evening: GeminiDayActivity[];
  recommendedAttractions: string[];
  foodRecommendations: string[];
  transportation: string[];
  estimatedCost: number;
}

export interface GeminiAccommodationSuggestion {
  tier: 'Budget' | 'Mid-Range' | 'Boutique & Luxury';
  propertyType: string;
  area: string;
  description: string;
  estimatedNightlyRate: number;
}

export interface GeminiLocalFoodItem {
  name: string;
  dishType: string;
  neighborhood: string;
  note: string;
  estimatedCost: number;
}

export interface GeminiPackingItem {
  item: string;
  category: 'Essentials' | 'Clothing' | 'Gear & Tech' | 'Local Extras';
}

export interface GeminiItineraryResponse {
  tripTitle: string;
  destination: string;
  country: string;
  summary: string;
  duration: number;
  travelStyle: string;
  estimatedBudget: {
    currency: string;
    accommodation: number;
    food: number;
    transportation: number;
    activities: number;
    shopping: number;
    miscellaneous: number;
    total: number;
  };
  days: GeminiItineraryDay[];
  placesToVisit: { name: string; highlight: string }[];
  localFood: GeminiLocalFoodItem[];
  accommodationSuggestions: GeminiAccommodationSuggestion[];
  generalTransportation: {
    category: string;
    title: string;
    details: string;
    estimatedCostLabel: string;
  }[];
  packingChecklist: GeminiPackingItem[];
  travelTips: string[];
}

export class PlannerApiError extends Error {
  statusCode: number;
  code: string;
  retryable: boolean;

  constructor(message: string, statusCode: number, code: string, retryable = false) {
    super(message);
    this.name = 'PlannerApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.retryable = retryable;
  }
}

const VALID_CURRENCIES = new Set(['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD']);
const VALID_PACKING_CATEGORIES = new Set(['Essentials', 'Clothing', 'Gear & Tech', 'Local Extras']);
const VALID_TIERS = new Set(['Budget', 'Mid-Range', 'Boutique & Luxury']);
const MODEL_NAME = 'gemini-4-hydrogen';
const REQUEST_TIMEOUT_MS = 55_000;

function sanitizeString(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function calculateDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function validatePlannerRequest(raw: unknown): PlannerRequestPayload {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new PlannerApiError('Invalid request body. Expected a JSON object.', 400, 'INVALID_INPUT');
  }

  const body = raw as Record<string, unknown>;
  const destination = sanitizeString(body.destination, 120);
  if (destination.length < 2) {
    throw new PlannerApiError('Please provide a valid destination (at least 2 characters).', 400, 'INVALID_DESTINATION');
  }

  const startingLocation = sanitizeString(body.startingLocation, 120);
  if (startingLocation.length < 2) {
    throw new PlannerApiError('Please provide your starting location.', 400, 'INVALID_ORIGIN');
  }

  const durationMode = body.durationMode === 'dates' ? 'dates' : 'days';
  const startDate = sanitizeString(body.startDate, 20);
  const endDate = sanitizeString(body.endDate, 20);

  let numberOfDays = Number(body.numberOfDays);
  if (durationMode === 'dates') {
    if (!startDate || !endDate) {
      throw new PlannerApiError('Both start date and end date are required when selecting exact dates.', 400, 'INVALID_DATES');
    }
    const diff = calculateDaysBetween(startDate, endDate);
    if (diff < 1 || diff > 21) {
      throw new PlannerApiError('Travel dates must span between 1 and 21 days, with the end date on or after the start date.', 400, 'INVALID_DATES');
    }
    numberOfDays = diff;
  } else {
    if (!Number.isFinite(numberOfDays) || numberOfDays < 1 || numberOfDays > 21) {
      throw new PlannerApiError('Trip duration must be between 1 and 21 days.', 400, 'INVALID_DURATION');
    }
    numberOfDays = Math.round(numberOfDays);
  }

  const travelers = Number(body.travelers);
  if (!Number.isFinite(travelers) || travelers < 1 || travelers > 20) {
    throw new PlannerApiError('Number of travelers must be between 1 and 20.', 400, 'INVALID_TRAVELERS');
  }

  const totalBudget = Number(body.totalBudget);
  if (!Number.isFinite(totalBudget) || totalBudget < 50 || totalBudget > 10_000_000) {
    throw new PlannerApiError('Please enter a realistic total trip budget (at least 50).', 400, 'INVALID_BUDGET');
  }

  const currency = sanitizeString(body.currency, 8).toUpperCase();
  if (!VALID_CURRENCIES.has(currency)) {
    throw new PlannerApiError('Unsupported currency selected.', 400, 'INVALID_CURRENCY');
  }

  const travelStyle = sanitizeString(body.travelStyle, 40) || 'Cultural';
  const pace = sanitizeString(body.pace, 40) || 'Balanced';

  const interestsRaw = Array.isArray(body.interests) ? body.interests : [];
  const interests = interestsRaw
    .map((item) => sanitizeString(item, 40))
    .filter(Boolean)
    .slice(0, 12);

  if (interests.length === 0) {
    throw new PlannerApiError('Please select at least one travel interest.', 400, 'INVALID_INTERESTS');
  }

  const accommodationPreference = sanitizeString(body.accommodationPreference, 80) || 'No preference';
  const dietaryPreference = sanitizeString(body.dietaryPreference, 80) || 'No specific restrictions';
  const additionalInstructions = sanitizeString(body.additionalInstructions, 600);
  const regenerate = Boolean(body.regenerate);
  const variationSeed = Number.isFinite(Number(body.variationSeed)) ? Math.floor(Number(body.variationSeed)) : undefined;

  return {
    destination,
    startingLocation,
    durationMode,
    startDate: durationMode === 'dates' ? startDate : undefined,
    endDate: durationMode === 'dates' ? endDate : undefined,
    numberOfDays,
    travelers: Math.round(travelers),
    totalBudget: Math.round(totalBudget),
    currency,
    travelStyle,
    interests,
    pace,
    accommodationPreference,
    dietaryPreference,
    additionalInstructions,
    regenerate,
    variationSeed,
  };
}

function buildPrompt(input: PlannerRequestPayload): string {
  const dateInfo =
    input.durationMode === 'dates' && input.startDate && input.endDate
      ? `Exact travel dates: ${input.startDate} to ${input.endDate} (${input.numberOfDays} days). Consider the local season for these dates.`
      : `Flexible trip duration: ${input.numberOfDays} days.`;

  const variationLine = input.regenerate
    ? `\nREGENERATION REQUEST: Produce a distinctly different alternative itinerary from a typical first draft. Explore different neighborhoods, varied pacing sequences, alternative cultural or local stops, and fresh food experiences (variation token: ${input.variationSeed ?? Date.now()}).`
    : '';

  return `Create a complete, thoughtful ${input.numberOfDays}-day travel itinerary as a single JSON object for the following traveler brief:

- Destination: ${input.destination}
- Starting location: ${input.startingLocation}
- ${dateInfo}
- Number of travelers: ${input.travelers}
- Target total budget: ${input.totalBudget} ${input.currency} (across all travelers)
- Travel style: ${input.travelStyle}
- Interests: ${input.interests.join(', ')}
- Preferred itinerary pace: ${input.pace}
- Accommodation preference: ${input.accommodationPreference}
- Dietary preferences: ${input.dietaryPreference}
- Additional instructions: ${input.additionalInstructions || 'None provided'}
${variationLine}

Return ONLY valid JSON matching this exact structure (no markdown, no extra commentary):
{
  "tripTitle": "Inviting editorial title for the trip",
  "destination": "Primary destination city or region",
  "country": "Country name",
  "summary": "2-3 sentence tailored overview",
  "duration": ${input.numberOfDays},
  "travelStyle": "${input.travelStyle}",
  "estimatedBudget": {
    "currency": "${input.currency}",
    "accommodation": 0,
    "food": 0,
    "transportation": 0,
    "activities": 0,
    "shopping": 0,
    "miscellaneous": 0,
    "total": 0
  },
  "days": [
    {
      "day": 1,
      "date": "${input.durationMode === 'dates' && input.startDate ? input.startDate : ''}",
      "title": "Theme title for the day",
      "morning": [{ "timeRange": "09:00 - 11:30", "title": "Activity", "place": "Neighborhood/Landmark", "description": "1-2 sentences", "estimatedCost": 25 }],
      "afternoon": [{ "timeRange": "13:30 - 16:30", "title": "Activity", "place": "Neighborhood/Landmark", "description": "1-2 sentences", "estimatedCost": 35 }],
      "evening": [{ "timeRange": "18:30 - 21:00", "title": "Activity", "place": "Neighborhood/Landmark", "description": "1-2 sentences", "estimatedCost": 45 }],
      "recommendedAttractions": ["Attraction 1", "Attraction 2"],
      "foodRecommendations": ["Lunch idea", "Dinner idea"],
      "transportation": ["Practical local transit note for the day"],
      "estimatedCost": 105
    }
  ],
  "placesToVisit": [{ "name": "Place", "highlight": "Why it is worthwhile" }],
  "localFood": [{ "name": "Dish or experience", "dishType": "Category", "neighborhood": "Area", "note": "Dietary-aware note", "estimatedCost": 25 }],
  "accommodationSuggestions": [
    { "tier": "Budget", "propertyType": "Stay type (e.g., Central Guesthouse)", "area": "Recommended neighborhood", "description": "Why it fits", "estimatedNightlyRate": 80 },
    { "tier": "Mid-Range", "propertyType": "Stay type (e.g., Boutique Hotel)", "area": "Recommended neighborhood", "description": "Why it fits", "estimatedNightlyRate": 180 },
    { "tier": "Boutique & Luxury", "propertyType": "Stay type (e.g., Heritage Retreat)", "area": "Recommended neighborhood", "description": "Why it fits", "estimatedNightlyRate": 360 }
  ],
  "generalTransportation": [
    { "category": "Getting There", "title": "Main arrival route from ${input.startingLocation}", "details": "Practical overview", "estimatedCostLabel": "Approximate range in ${input.currency}" },
    { "category": "Getting Around", "title": "Local transit option", "details": "Practical overview", "estimatedCostLabel": "Approximate daily range in ${input.currency}" }
  ],
  "packingChecklist": [
    { "item": "Specific packing item", "category": "Essentials | Clothing | Gear & Tech | Local Extras" }
  ],
  "travelTips": ["Tip covering local transit, etiquette, safety, or budget management"]
}

CRITICAL GUIDELINES:
1. Generate EXACTLY ${input.numberOfDays} day objects in "days", numbered 1 through ${input.numberOfDays}.
2. Keep each day realistic and geographically grouped. Include 1-2 activities in morning, 1-2 in afternoon, and 1 in evening matched to "${input.pace}" pace.
3. Keep "estimatedBudget.total" aligned with or comfortably under ${input.totalBudget} ${input.currency}. All numbers are reasonable AI-generated estimates in ${input.currency}, not live quotes.
4. In "accommodationSuggestions", suggest lodging TYPES and areas only—never claim live hotel availability or invent booking URLs.
5. Respect dietary preference ("${input.dietaryPreference}") across daily food recommendations and "localFood" (3-4 items).
6. Include 4-5 "placesToVisit", 7-9 customized "packingChecklist" items (using exact categories: Essentials, Clothing, Gear & Tech, Local Extras), and 4-5 concise practical "travelTips".`;
}

function toSafeNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return fallback;
  return Math.round(num);
}

function normalizeActivities(raw: unknown, defaultTimeRange: string): GeminiDayActivity[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      timeRange: sanitizeString(item.timeRange, 40) || defaultTimeRange,
      title: sanitizeString(item.title, 140),
      place: sanitizeString(item.place, 120) || 'Local area',
      description: sanitizeString(item.description, 450),
      estimatedCost: toSafeNumber(item.estimatedCost, 0),
    }))
    .filter((item) => item.title.length > 0 && item.description.length > 0);
}

function normalizeStringList(raw: unknown, maxItems: number, maxLen = 220): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => sanitizeString(item, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

function stripJsonCodeFences(rawText: string): string {
  const trimmed = rawText.trim();
  if (trimmed.startsWith('```')) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
  }
  return trimmed;
}

export function parseAndValidateGeminiResponse(
  rawText: string | undefined,
  request: PlannerRequestPayload
): GeminiItineraryResponse {
  if (!rawText || !rawText.trim()) {
    throw new PlannerApiError(
      'Gemini returned an empty response. Please try generating your itinerary again.',
      502,
      'EMPTY_AI_RESPONSE',
      true
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonCodeFences(rawText));
  } catch {
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        parsed = JSON.parse(rawText.slice(firstBrace, lastBrace + 1));
      } catch {
        throw new PlannerApiError(
          'The AI returned malformed itinerary data. Please retry to generate a clean plan.',
          502,
          'INVALID_AI_JSON',
          true
        );
      }
    } else {
      throw new PlannerApiError(
        'The AI returned malformed itinerary data. Please retry to generate a clean plan.',
        502,
        'INVALID_AI_JSON',
        true
      );
    }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new PlannerApiError(
      'The AI returned an unexpected data format. Please try again.',
      502,
      'INVALID_AI_STRUCTURE',
      true
    );
  }

  const data = parsed as Record<string, unknown>;
  const rawDays = Array.isArray(data.days) ? data.days : [];
  if (rawDays.length === 0) {
    throw new PlannerApiError(
      'The generated itinerary was missing daily plans. Please retry.',
      502,
      'MISSING_DAYS',
      true
    );
  }

  const days: GeminiItineraryDay[] = rawDays
    .slice(0, request.numberOfDays)
    .filter((d): d is Record<string, unknown> => Boolean(d && typeof d === 'object'))
    .map((d, idx) => {
      const morning = normalizeActivities(d.morning, '09:00 – 12:00');
      const afternoon = normalizeActivities(d.afternoon, '13:30 – 17:00');
      const evening = normalizeActivities(d.evening, '18:30 – 21:00');
      const sumActivities = [...morning, ...afternoon, ...evening].reduce(
        (sum, act) => sum + act.estimatedCost,
        0
      );

      return {
        day: toSafeNumber(d.day, idx + 1) || idx + 1,
        date: sanitizeString(d.date, 40) || undefined,
        title: sanitizeString(d.title, 140) || `Day ${idx + 1} Exploration`,
        morning,
        afternoon,
        evening,
        recommendedAttractions: normalizeStringList(d.recommendedAttractions, 6, 120),
        foodRecommendations: normalizeStringList(d.foodRecommendations, 5, 180),
        transportation: normalizeStringList(d.transportation, 4, 200),
        estimatedCost: toSafeNumber(d.estimatedCost, sumActivities) || sumActivities,
      };
    });

  const hasValidActivities = days.some(
    (day) => day.morning.length > 0 || day.afternoon.length > 0 || day.evening.length > 0
  );
  if (!hasValidActivities) {
    throw new PlannerApiError(
      'The generated itinerary did not include complete daily activities. Please retry.',
      502,
      'INCOMPLETE_ACTIVITIES',
      true
    );
  }

  const rawBudget =
    data.estimatedBudget && typeof data.estimatedBudget === 'object'
      ? (data.estimatedBudget as Record<string, unknown>)
      : {};

  const accommodation = toSafeNumber(rawBudget.accommodation, 0);
  const food = toSafeNumber(rawBudget.food, 0);
  const transportation = toSafeNumber(rawBudget.transportation, 0);
  const activities = toSafeNumber(rawBudget.activities, 0);
  const shopping = toSafeNumber(rawBudget.shopping, 0);
  const miscellaneous = toSafeNumber(rawBudget.miscellaneous, 0);
  const computedTotal = accommodation + food + transportation + activities + shopping + miscellaneous;
  const total = toSafeNumber(rawBudget.total, computedTotal) || computedTotal;

  const placesToVisit = Array.isArray(data.placesToVisit)
    ? data.placesToVisit
        .filter((p): p is Record<string, unknown> => Boolean(p && typeof p === 'object'))
        .map((p) => ({
          name: sanitizeString(p.name, 100),
          highlight: sanitizeString(p.highlight, 220),
        }))
        .filter((p) => p.name.length > 0)
        .slice(0, 8)
    : [];

  const localFood: GeminiLocalFoodItem[] = Array.isArray(data.localFood)
    ? data.localFood
        .filter((f): f is Record<string, unknown> => Boolean(f && typeof f === 'object'))
        .map((f) => ({
          name: sanitizeString(f.name, 100),
          dishType: sanitizeString(f.dishType, 80) || 'Local Specialty',
          neighborhood: sanitizeString(f.neighborhood, 80) || 'Citywide',
          note: sanitizeString(f.note, 260),
          estimatedCost: toSafeNumber(f.estimatedCost, 0),
        }))
        .filter((f) => f.name.length > 0)
        .slice(0, 6)
    : [];

  const accommodationSuggestions: GeminiAccommodationSuggestion[] = Array.isArray(
    data.accommodationSuggestions
  )
    ? data.accommodationSuggestions
        .filter((a): a is Record<string, unknown> => Boolean(a && typeof a === 'object'))
        .map((a, idx) => {
          const rawTier = sanitizeString(a.tier, 30);
          const fallbackTiers: GeminiAccommodationSuggestion['tier'][] = [
            'Budget',
            'Mid-Range',
            'Boutique & Luxury',
          ];
          const tier = (
            VALID_TIERS.has(rawTier) ? rawTier : fallbackTiers[idx % 3]
          ) as GeminiAccommodationSuggestion['tier'];

          return {
            tier,
            propertyType: sanitizeString(a.propertyType, 120) || `${tier} Stay Option`,
            area: sanitizeString(a.area, 100) || 'Central District',
            description: sanitizeString(a.description, 280),
            estimatedNightlyRate: toSafeNumber(a.estimatedNightlyRate, 0),
          };
        })
        .slice(0, 4)
    : [];

  const generalTransportation = Array.isArray(data.generalTransportation)
    ? data.generalTransportation
        .filter((t): t is Record<string, unknown> => Boolean(t && typeof t === 'object'))
        .map((t) => ({
          category: sanitizeString(t.category, 60) || 'Local Transit',
          title: sanitizeString(t.title, 120),
          details: sanitizeString(t.details, 300),
          estimatedCostLabel: sanitizeString(t.estimatedCostLabel, 80) || 'Varies locally',
        }))
        .filter((t) => t.title.length > 0)
        .slice(0, 4)
    : [];

  const packingChecklist: GeminiPackingItem[] = Array.isArray(data.packingChecklist)
    ? data.packingChecklist
        .filter((p): p is Record<string, unknown> => Boolean(p && typeof p === 'object'))
        .map((p) => {
          const cat = sanitizeString(p.category, 30);
          return {
            item: sanitizeString(p.item, 140),
            category: (
              VALID_PACKING_CATEGORIES.has(cat) ? cat : 'Essentials'
            ) as GeminiPackingItem['category'],
          };
        })
        .filter((p) => p.item.length > 0)
        .slice(0, 16)
    : [];

  const travelTips = normalizeStringList(data.travelTips, 8, 280);

  return {
    tripTitle: sanitizeString(data.tripTitle, 140) || `${request.numberOfDays} Days in ${request.destination}`,
    destination: sanitizeString(data.destination, 120) || request.destination,
    country: sanitizeString(data.country, 80),
    summary:
      sanitizeString(data.summary, 600) ||
      `A ${request.numberOfDays}-day ${request.travelStyle.toLowerCase()} itinerary for ${request.destination}.`,
    duration: days.length,
    travelStyle: sanitizeString(data.travelStyle, 40) || request.travelStyle,
    estimatedBudget: {
      currency: request.currency,
      accommodation,
      food,
      transportation,
      activities,
      shopping,
      miscellaneous,
      total,
    },
    days,
    placesToVisit,
    localFood,
    accommodationSuggestions,
    generalTransportation,
    packingChecklist,
    travelTips,
  };
}

function classifyGeminiError(err: unknown): PlannerApiError {
  if (err instanceof PlannerApiError) return err;

  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();
  const status =
    typeof err === 'object' && err !== null && 'status' in err
      ? Number((err as { status?: unknown }).status)
      : undefined;

  console.error('[TripMind Gemini API Error]', { status: status ?? 'unknown', type: err instanceof Error ? err.name : typeof err });

  if (status === 429 || lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('quota') || lower.includes('rate limit')) {
    return new PlannerApiError(
      'Gemini API rate limit reached. Please wait a moment and retry your request.',
      429,
      'RATE_LIMITED',
      true
    );
  }

  if (status === 401 || status === 403 || lower.includes('api_key_invalid') || lower.includes('permission_denied') || lower.includes('api key')) {
    return new PlannerApiError(
      'Gemini API authentication failed. Verify that GEMINI_API_KEY is properly configured on the server.',
      503,
      'API_AUTH_ERROR',
      false
    );
  }

  if (lower.includes('timeout') || lower.includes('aborted') || lower.includes('etimedout')) {
    return new PlannerApiError(
      'The itinerary request timed out while waiting for Gemini. Please try again.',
      504,
      'REQUEST_TIMEOUT',
      true
    );
  }

  if (lower.includes('fetch failed') || lower.includes('enotfound') || lower.includes('network')) {
    return new PlannerApiError(
      'Could not reach the Gemini API due to a network error. Please try again shortly.',
      503,
      'NETWORK_ERROR',
      true
    );
  }

  return new PlannerApiError(
    'Unable to generate your travel itinerary right now. Please try again.',
    502,
    'GEMINI_UPSTREAM_ERROR',
    true
  );
}

export async function generateItineraryWithGemini(
  rawBody: unknown
): Promise<GeminiItineraryResponse> {
  const input = validatePlannerRequest(rawBody);

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new PlannerApiError(
      'Server configuration error: GEMINI_API_KEY is not configured. Add GEMINI_API_KEY to your server environment variables.',
      503,
      'MISSING_API_KEY',
      false
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const responsePromise = ai.models.generateContent({
      model: MODEL_NAME,
      contents: buildPrompt(input),
      config: {
        abortSignal: controller.signal,
        systemInstruction:
          'You are TripMind AI, an editorial travel planner that designs realistic, culturally respectful, budget-conscious itineraries. Always respond with valid JSON matching the exact schema requested. All prices are reasonable estimates, never real-time quotes. Never invent hotel booking links or claim live availability.',
        responseMimeType: 'application/json',
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
        ...(input.variationSeed !== undefined ? { seed: input.variationSeed } : {}),
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      controller.signal.addEventListener('abort', () => {
        reject(new PlannerApiError('The AI request timed out. Please try again.', 504, 'REQUEST_TIMEOUT', true));
      });
    });

    const response = await Promise.race([responsePromise, timeoutPromise]);
    return parseAndValidateGeminiResponse(response.text, input);
  } catch (err) {
    throw classifyGeminiError(err);
  } finally {
    clearTimeout(timeoutHandle);
  }
}
