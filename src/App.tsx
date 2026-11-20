/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DestinationModal } from './components/DestinationModal';
import { EmptyState } from './components/EmptyState';
import { Footer } from './components/Footer';
import { ItinerarySkeleton } from './components/ItinerarySkeleton';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/ToastContainer';
import { SAMPLE_DESTINATIONS } from './data/sampleDestinations';
import { useHashRouter } from './hooks/useHashRouter';
import { AboutPage } from './pages/AboutPage';
import { ExplorePage } from './pages/ExplorePage';
import { ItineraryPage } from './pages/ItineraryPage';
import { LandingPage } from './pages/LandingPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { TripPlannerPage } from './pages/TripPlannerPage';
import {
  generateAiItinerary,
  TripGenerationError,
} from './services/tripPlannerService';
import {
  deleteTripFromStorage,
  getSavedTrips,
  saveTripToStorage,
  updateSavedTrip,
} from './services/tripStorage';
import { Destination, Itinerary, ToastMessage, ToastType, TripFormValues } from './types/trip';

interface GenerationFailureState {
  message: string;
  code: string;
  retryable: boolean;
  lastValues: TripFormValues;
  wasRegenerate: boolean;
}

function deriveFormValuesFromItinerary(trip: Itinerary): TripFormValues {
  if (trip.sourceFormValues) {
    return { ...trip.sourceFormValues };
  }
  return {
    destination: trip.country ? `${trip.destination}, ${trip.country}` : trip.destination,
    startingLocation: trip.startingLocation || 'San Francisco, USA',
    durationMode: 'days',
    startDate: '',
    endDate: '',
    numberOfDays: trip.numberOfDays,
    travelers: trip.travelers,
    totalBudget: trip.totalBudget,
    currency: trip.currency,
    travelStyle: trip.travelStyle,
    interests: trip.interests.length > 0 ? trip.interests : ['Food', 'Local experiences'],
    pace: trip.pace,
    accommodationPreference: trip.accommodationPreference,
    dietaryPreference: trip.dietaryPreference,
    additionalInstructions: trip.additionalInstructions,
  };
}

function buildFormValuesForDestination(destination: Destination): TripFormValues {
  return {
    destination: `${destination.name}, ${destination.country}`,
    startingLocation: 'Major International Hub',
    durationMode: 'days',
    startDate: '',
    endDate: '',
    numberOfDays: destination.idealDays,
    travelers: destination.bestTravelStyle === 'Solo' ? 1 : destination.bestTravelStyle === 'Family' ? 4 : 2,
    totalBudget: destination.suggestedBudgetUSD,
    currency: 'USD',
    travelStyle: destination.bestTravelStyle,
    interests: destination.sampleInterests,
    pace: destination.bestTravelStyle === 'Relaxation' ? 'Relaxed' : 'Balanced',
    accommodationPreference:
      destination.bestTravelStyle === 'Budget'
        ? 'Budget Guesthouse / Hostel'
        : destination.bestTravelStyle === 'Luxury'
          ? 'Luxury Resort'
          : 'Boutique Hotel',
    dietaryPreference: 'No specific restrictions',
    additionalInstructions: '',
  };
}

export default function App() {
  const { route, navigate } = useHashRouter();

  const [savedTrips, setSavedTrips] = useState<Itinerary[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [sessionItineraries, setSessionItineraries] = useState<Record<string, Itinerary>>({});
  const [plannerPrefill, setPlannerPrefill] = useState<Partial<TripFormValues> | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [generatingDestination, setGeneratingDestination] = useState<string>('');
  const [generationFailure, setGenerationFailure] = useState<GenerationFailureState | null>(null);

  const inFlightRef = useRef(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, title: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-2), { id, type, title, description }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    const result = getSavedTrips();
    setSavedTrips(result.data);
    setStorageError(result.error);
  }, []);

  useEffect(() => {
    if (route.page !== 'plan' && route.page !== 'itinerary') {
      setGenerationFailure(null);
    }
  }, [route]);

  const runAiGeneration = useCallback(
    async (values: TripFormValues, options?: { regenerate?: boolean }) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      const regenerate = Boolean(options?.regenerate);
      setSelectedDestination(null);
      setGenerationFailure(null);
      setGeneratingDestination(values.destination.trim());
      setIsGenerating(true);
      setIsRegenerating(regenerate);

      try {
        const aiItinerary = await generateAiItinerary(values, { regenerate });
        setSessionItineraries((prev) => ({ ...prev, [aiItinerary.id]: aiItinerary }));
        navigate({ page: 'itinerary', id: aiItinerary.id });
        addToast(
          'success',
          regenerate ? 'Fresh itinerary generated' : 'Itinerary ready',
          `Your ${aiItinerary.numberOfDays}-day plan for ${aiItinerary.destination} is ready to explore.`
        );
      } catch (err) {
        const message =
          err instanceof TripGenerationError
            ? err.message
            : 'We could not generate your trip right now. Please try again.';
        const code = err instanceof TripGenerationError ? err.code : 'UNKNOWN_ERROR';
        const retryable = err instanceof TripGenerationError ? err.retryable : true;

        setGenerationFailure({
          message,
          code,
          retryable,
          lastValues: { ...values },
          wasRegenerate: regenerate,
        });
        addToast('error', 'Generation failed', message);
      } finally {
        inFlightRef.current = false;
        setIsGenerating(false);
        setIsRegenerating(false);
        setGeneratingDestination('');
      }
    },
    [navigate, addToast]
  );

  const handleGenerateTrip = useCallback(
    (values: TripFormValues) => {
      void runAiGeneration(values, { regenerate: false });
    },
    [runAiGeneration]
  );

  const handleRegenerateTrip = useCallback(
    (trip: Itinerary) => {
      const formValues = deriveFormValuesFromItinerary(trip);
      void runAiGeneration(formValues, { regenerate: true });
    },
    [runAiGeneration]
  );

  const handleRetryGeneration = useCallback(() => {
    if (!generationFailure) return;
    void runAiGeneration(generationFailure.lastValues, {
      regenerate: generationFailure.wasRegenerate,
    });
  }, [generationFailure, runAiGeneration]);

  const handleModifyAfterFailure = useCallback(() => {
    if (!generationFailure) return;
    setPlannerPrefill(generationFailure.lastValues);
    setGenerationFailure(null);
    navigate({ page: 'plan' });
  }, [generationFailure, navigate]);

  const handleExploreDestination = useCallback(
    (slug: string) => {
      const found = SAMPLE_DESTINATIONS.find((dest) => dest.slug === slug);
      if (found) {
        setSelectedDestination(found);
      } else {
        addToast('error', 'Destination not found', 'Please pick another destination from Explore.');
      }
    },
    [addToast]
  );

  const handleGenerateFromDestination = useCallback(
    (destination: Destination) => {
      void runAiGeneration(buildFormValuesForDestination(destination), { regenerate: false });
    },
    [runAiGeneration]
  );

  const handlePlanForDestination = useCallback(
    (destination: Destination) => {
      setSelectedDestination(null);
      setGenerationFailure(null);
      setPlannerPrefill({
        destination: `${destination.name}, ${destination.country}`,
        numberOfDays: destination.idealDays,
        durationMode: 'days',
        totalBudget: destination.suggestedBudgetUSD,
        currency: 'USD',
        travelStyle: destination.bestTravelStyle,
        interests: destination.sampleInterests,
      });
      navigate({ page: 'plan' });
    },
    [navigate]
  );

  const handleSaveTrip = useCallback(
    (trip: Itinerary) => {
      const alreadySaved = savedTrips.some((item) => item.id === trip.id);
      if (alreadySaved) {
        const result = updateSavedTrip(trip);
        setSavedTrips(result.data);
        setStorageError(result.error);
        if (result.error) {
          addToast('error', 'Could not update trip', result.error);
        } else {
          addToast('info', 'Already in My Trips', 'Latest checklist changes are synced locally.');
        }
        return;
      }

      const result = saveTripToStorage(trip);
      setSavedTrips(result.data);
      setStorageError(result.error);
      if (result.error) {
        addToast('error', 'Save failed', result.error);
      } else {
        addToast('success', 'Trip saved', `"${trip.destination}" was added to My Trips.`);
      }
    },
    [savedTrips, addToast]
  );

  const handleUpdateItinerary = useCallback(
    (updated: Itinerary) => {
      setSessionItineraries((prev) => ({ ...prev, [updated.id]: updated }));
      if (savedTrips.some((item) => item.id === updated.id)) {
        const result = updateSavedTrip(updated);
        setSavedTrips(result.data);
        if (result.error) setStorageError(result.error);
      }
    },
    [savedTrips]
  );

  const handleDeleteTrip = useCallback(
    (tripId: string) => {
      const target = savedTrips.find((item) => item.id === tripId);
      const result = deleteTripFromStorage(tripId);
      setSavedTrips(result.data);
      setStorageError(result.error);
      if (result.error) {
        addToast('error', 'Delete failed', result.error);
      } else {
        addToast(
          'success',
          'Trip removed',
          target ? `"${target.destination}" was deleted from My Trips.` : 'Trip deleted.'
        );
      }
    },
    [savedTrips, addToast]
  );

  const handleEditTrip = useCallback(
    (trip: Itinerary) => {
      setGenerationFailure(null);
      setPlannerPrefill(deriveFormValuesFromItinerary(trip));
      navigate({ page: 'plan' });
    },
    [navigate]
  );

  const activeItinerary = useMemo<Itinerary | null>(() => {
    if (route.page !== 'itinerary') return null;
    const fromSaved = savedTrips.find((item) => item.id === route.id);
    if (fromSaved) return fromSaved;
    return sessionItineraries[route.id] ?? null;
  }, [route, savedTrips, sessionItineraries]);

  const isActiveTripSaved = activeItinerary
    ? savedTrips.some((item) => item.id === activeItinerary.id)
    : false;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4EE] text-[#1E201D]">
      <Navbar
        currentRoute={route}
        onNavigate={(next) => {
          setGenerationFailure(null);
          setSelectedDestination(null);
          if (next.page === 'plan') {
            setPlannerPrefill(null);
          }
          navigate(next);
        }}
        savedTripsCount={savedTrips.length}
      />

      <div className="flex-1">
        {isGenerating ? (
          <ItinerarySkeleton
            destinationLabel={generatingDestination}
            isRegenerating={isRegenerating}
          />
        ) : generationFailure ? (
          <main className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
            <EmptyState
              variant="error"
              title="We couldn't generate your itinerary"
              description={generationFailure.message}
              primaryActionLabel={generationFailure.retryable ? 'Retry Generation' : 'Modify Preferences'}
              onPrimaryAction={
                generationFailure.retryable ? handleRetryGeneration : handleModifyAfterFailure
              }
              secondaryActionLabel={generationFailure.retryable ? 'Modify Preferences' : 'Retry Anyway'}
              onSecondaryAction={
                generationFailure.retryable ? handleModifyAfterFailure : handleRetryGeneration
              }
            />
          </main>
        ) : route.page === 'home' ? (
          <LandingPage
            onNavigate={navigate}
            onExploreDestination={handleExploreDestination}
            onPlanForDestination={handlePlanForDestination}
          />
        ) : route.page === 'plan' ? (
          <TripPlannerPage
            initialValues={plannerPrefill}
            isSubmitting={isGenerating}
            onGenerateTrip={handleGenerateTrip}
          />
        ) : route.page === 'explore' ? (
          <ExplorePage
            onExploreDestination={handleExploreDestination}
            onPlanForDestination={handlePlanForDestination}
          />
        ) : route.page === 'my-trips' ? (
          <MyTripsPage
            savedTrips={savedTrips}
            storageError={storageError}
            onOpenTrip={(trip) => navigate({ page: 'itinerary', id: trip.id })}
            onDeleteTrip={handleDeleteTrip}
            onNavigate={navigate}
          />
        ) : route.page === 'about' ? (
          <AboutPage onNavigate={navigate} />
        ) : activeItinerary ? (
          <ItineraryPage
            itinerary={activeItinerary}
            isSaved={isActiveTripSaved}
            isRegenerating={isRegenerating}
            onSaveTrip={handleSaveTrip}
            onUpdateItinerary={handleUpdateItinerary}
            onEditTrip={handleEditTrip}
            onRegenerateTrip={handleRegenerateTrip}
            onBack={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                navigate({ page: 'explore' });
              }
            }}
            onNotify={addToast}
          />
        ) : (
          <main className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
            <EmptyState
              variant="error"
              title="Itinerary not found"
              description="This itinerary link may have expired or was removed from local browser storage. Generate a new trip in the planner or explore curated destinations."
              primaryActionLabel="Plan My Trip"
              onPrimaryAction={() => navigate({ page: 'plan' })}
              secondaryActionLabel="Explore Destinations"
              onSecondaryAction={() => navigate({ page: 'explore' })}
            />
          </main>
        )}
      </div>

      <Footer onNavigate={navigate} />
      <DestinationModal
        destination={selectedDestination}
        isGenerating={isGenerating}
        onClose={() => setSelectedDestination(null)}
        onGenerateAiTrip={handleGenerateFromDestination}
        onCustomizeTrip={handlePlanForDestination}
      />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
