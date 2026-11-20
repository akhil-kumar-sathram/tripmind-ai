export type TravelStyle =
  | 'Adventure'
  | 'Relaxation'
  | 'Luxury'
  | 'Budget'
  | 'Cultural'
  | 'Romantic'
  | 'Family'
  | 'Solo';

export type TravelInterest =
  | 'Nature'
  | 'Food'
  | 'History'
  | 'Shopping'
  | 'Beaches'
  | 'Mountains'
  | 'Photography'
  | 'Nightlife'
  | 'Architecture'
  | 'Local experiences';

export type TravelPace = 'Relaxed' | 'Balanced' | 'Packed itinerary';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'AUD' | 'CAD';

export type DurationMode = 'dates' | 'days';

export type AccommodationPreference =
  | 'Boutique Hotel'
  | 'Luxury Resort'
  | 'Cozy Apartment / Villa'
  | 'Budget Guesthouse / Hostel'
  | 'Eco-Lodge & Nature Stay'
  | 'No preference';

export type DietaryPreference =
  | 'No specific restrictions'
  | 'Vegetarian'
  | 'Vegan'
  | 'Halal'
  | 'Kosher'
  | 'Gluten-Free'
  | 'Local Street Food Lover';

export interface TripFormValues {
  destination: string;
  startingLocation: string;
  durationMode: DurationMode;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  travelers: number;
  totalBudget: number;
  currency: CurrencyCode;
  travelStyle: TravelStyle;
  interests: TravelInterest[];
  pace: TravelPace;
  accommodationPreference: AccommodationPreference;
  dietaryPreference: DietaryPreference;
  additionalInstructions: string;
}

export type TimeSlot = 'Morning' | 'Afternoon' | 'Evening';

export interface TimelineActivity {
  id: string;
  slot: TimeSlot;
  timeRange: string;
  title: string;
  place: string;
  description: string;
  foodRecommendation?: string;
  estimatedCost: number;
}

export interface ItineraryDay {
  dayNumber: number;
  dateLabel?: string;
  theme: string;
  estimatedDailyCost: number;
  activities: TimelineActivity[];
  recommendedAttractions?: string[];
  dayFoodRecommendations?: string[];
  dayTransportation?: string[];
}

export interface AccommodationSuggestion {
  tier: 'Budget' | 'Mid-Range' | 'Boutique & Luxury';
  name: string;
  neighborhood: string;
  description: string;
  estimatedNightlyRate: number;
}

export interface FoodRecommendation {
  name: string;
  dishType: string;
  neighborhood: string;
  note: string;
  estimatedCost: number;
}

export interface TransportSuggestion {
  category: string;
  title: string;
  details: string;
  estimatedCostLabel: string;
}

export interface PackingItem {
  id: string;
  item: string;
  category: 'Essentials' | 'Clothing' | 'Gear & Tech' | 'Local Extras';
  checked: boolean;
}

export interface BudgetBreakdown {
  accommodation: number;
  food: number;
  activities: number;
  transportation: number;
  shopping?: number;
  miscellaneous?: number;
}

export interface Itinerary {
  id: string;
  tripTitle?: string;
  destination: string;
  country: string;
  startingLocation: string;
  heroImage: string;
  heroImageAlt: string;
  dateRangeLabel: string;
  numberOfDays: number;
  travelers: number;
  currency: CurrencyCode;
  totalBudget: number;
  estimatedTotalCost: number;
  travelStyle: TravelStyle;
  pace: TravelPace;
  interests: TravelInterest[];
  accommodationPreference: AccommodationPreference;
  dietaryPreference: DietaryPreference;
  additionalInstructions: string;
  summary: string;
  budgetBreakdown: BudgetBreakdown;
  days: ItineraryDay[];
  placesToVisit: { name: string; highlight: string }[];
  foodRecommendations: FoodRecommendation[];
  accommodations: AccommodationSuggestion[];
  transportation: TransportSuggestion[];
  travelTips: string[];
  packingChecklist: PackingItem[];
  createdAt: string;
  /** Distinguishes live Gemini AI itineraries from curated Explore sample previews */
  dataSource: 'gemini-ai' | 'sample-preview';
  sourceFormValues?: TripFormValues;
}

export interface GeminiApiDayActivity {
  timeRange: string;
  title: string;
  place: string;
  description: string;
  estimatedCost: number;
}

export interface GeminiApiDay {
  day: number;
  date?: string;
  title: string;
  morning: GeminiApiDayActivity[];
  afternoon: GeminiApiDayActivity[];
  evening: GeminiApiDayActivity[];
  recommendedAttractions?: string[];
  foodRecommendations?: string[];
  transportation?: string[];
  estimatedCost: number;
}

export interface GeminiApiItineraryPayload {
  tripTitle: string;
  destination: string;
  country?: string;
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
  days: GeminiApiDay[];
  placesToVisit?: { name: string; highlight: string }[];
  localFood?: FoodRecommendation[];
  accommodationSuggestions?: {
    tier: 'Budget' | 'Mid-Range' | 'Boutique & Luxury';
    propertyType: string;
    area: string;
    description: string;
    estimatedNightlyRate: number;
  }[];
  generalTransportation?: TransportSuggestion[];
  packingChecklist?: {
    item: string;
    category: 'Essentials' | 'Clothing' | 'Gear & Tech' | 'Local Extras';
  }[];
  travelTips?: string[];
}

export interface Destination {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: 'Europe' | 'Asia' | 'Africa' | 'South America';
  shortDescription: string;
  editorialTagline: string;
  bestTravelStyle: TravelStyle;
  secondaryStyles: TravelStyle[];
  idealDays: number;
  suggestedBudgetUSD: number;
  bestSeason: string;
  image: string;
  imageAlt: string;
  highlights: string[];
  sampleInterests: TravelInterest[];
  featured?: boolean;
}

export interface TravelInspiration {
  id: string;
  title: string;
  subtitle: string;
  regionLabel: string;
  durationLabel: string;
  style: TravelStyle;
  destinationSlug: string;
  image: string;
  imageAlt: string;
}

export type ToastType = 'success' | 'info' | 'error';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

export const TRAVEL_STYLES: TravelStyle[] = [
  'Adventure',
  'Relaxation',
  'Luxury',
  'Budget',
  'Cultural',
  'Romantic',
  'Family',
  'Solo',
];

export const TRAVEL_INTERESTS: TravelInterest[] = [
  'Nature',
  'Food',
  'History',
  'Shopping',
  'Beaches',
  'Mountains',
  'Photography',
  'Nightlife',
  'Architecture',
  'Local experiences',
];

export const TRAVEL_PACES: { value: TravelPace; description: string }[] = [
  { value: 'Relaxed', description: 'Unrushed mornings, long meals, and open afternoons' },
  { value: 'Balanced', description: 'Key sights paired with restorative local pauses' },
  { value: 'Packed itinerary', description: 'Full days designed to see as much as possible' },
];

export const CURRENCY_OPTIONS: { code: CurrencyCode; symbol: string; name: string; rateFromUSD: number }[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rateFromUSD: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro', rateFromUSD: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateFromUSD: 0.79 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromUSD: 84 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateFromUSD: 152 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateFromUSD: 1.52 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateFromUSD: 1.38 },
];

export const ACCOMMODATION_OPTIONS: AccommodationPreference[] = [
  'Boutique Hotel',
  'Luxury Resort',
  'Cozy Apartment / Villa',
  'Budget Guesthouse / Hostel',
  'Eco-Lodge & Nature Stay',
  'No preference',
];

export const DIETARY_OPTIONS: DietaryPreference[] = [
  'No specific restrictions',
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'Gluten-Free',
  'Local Street Food Lover',
];
