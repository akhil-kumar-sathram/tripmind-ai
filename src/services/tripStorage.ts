import { Itinerary } from '../types/trip';

const STORAGE_KEY = 'tripmind_saved_trips_v1';

export interface StorageResult<T> {
  data: T;
  error: string | null;
}

export function getSavedTrips(): StorageResult<Itinerary[]> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { data: [], error: null };
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return { data: [], error: 'Saved trips data had an unexpected format and was reset.' };
    }
    return { data: parsed as Itinerary[], error: null };
  } catch {
    return {
      data: [],
      error: 'Unable to read saved trips from browser storage. Local storage may be disabled.',
    };
  }
}

export function saveTripToStorage(trip: Itinerary): StorageResult<Itinerary[]> {
  const existing = getSavedTrips();
  const filtered = existing.data.filter((item) => item.id !== trip.id);
  const updated = [trip, ...filtered];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { data: updated, error: null };
  } catch {
    return {
      data: existing.data,
      error: 'Could not save trip to local storage. Browser storage may be full or restricted.',
    };
  }
}

export function updateSavedTrip(trip: Itinerary): StorageResult<Itinerary[]> {
  const existing = getSavedTrips();
  const exists = existing.data.some((item) => item.id === trip.id);
  if (!exists) {
    return { data: existing.data, error: null };
  }
  const updated = existing.data.map((item) => (item.id === trip.id ? trip : item));
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { data: updated, error: null };
  } catch {
    return {
      data: existing.data,
      error: 'Could not update saved trip in browser storage.',
    };
  }
}

export function deleteTripFromStorage(tripId: string): StorageResult<Itinerary[]> {
  const existing = getSavedTrips();
  const updated = existing.data.filter((item) => item.id !== tripId);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { data: updated, error: null };
  } catch {
    return {
      data: existing.data,
      error: 'Could not delete trip from browser storage.',
    };
  }
}

export function getSavedTripById(tripId: string): Itinerary | undefined {
  return getSavedTrips().data.find((item) => item.id === tripId);
}
