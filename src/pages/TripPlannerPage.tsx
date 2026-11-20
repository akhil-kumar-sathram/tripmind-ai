import { AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SAMPLE_DESTINATIONS } from '../data/sampleDestinations';
import {
  ACCOMMODATION_OPTIONS,
  CURRENCY_OPTIONS,
  DIETARY_OPTIONS,
  TRAVEL_INTERESTS,
  TRAVEL_PACES,
  TRAVEL_STYLES,
  TravelInterest,
  TripFormValues,
} from '../types/trip';
import { calculateDaysBetween, formatCurrency } from '../utils/formatters';

interface TripPlannerPageProps {
  initialValues?: Partial<TripFormValues> | null;
  isSubmitting?: boolean;
  onGenerateTrip: (values: TripFormValues) => void;
}

type FormErrors = Partial<Record<keyof TripFormValues | 'general', string>>;

function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDefaultFormValues(prefill?: Partial<TripFormValues> | null): TripFormValues {
  return {
    destination: prefill?.destination ?? '',
    startingLocation: prefill?.startingLocation ?? '',
    durationMode: prefill?.durationMode ?? 'days',
    startDate: prefill?.startDate ?? '',
    endDate: prefill?.endDate ?? '',
    numberOfDays: prefill?.numberOfDays ?? 5,
    travelers: prefill?.travelers ?? 2,
    totalBudget: prefill?.totalBudget ?? 2000,
    currency: prefill?.currency ?? 'USD',
    travelStyle: prefill?.travelStyle ?? 'Cultural',
    interests: prefill?.interests && prefill.interests.length > 0 ? prefill.interests : ['Food', 'Local experiences'],
    pace: prefill?.pace ?? 'Balanced',
    accommodationPreference: prefill?.accommodationPreference ?? 'Boutique Hotel',
    dietaryPreference: prefill?.dietaryPreference ?? 'No specific restrictions',
    additionalInstructions: prefill?.additionalInstructions ?? '',
  };
}

export function TripPlannerPage({
  initialValues,
  isSubmitting = false,
  onGenerateTrip,
}: TripPlannerPageProps) {
  const [values, setValues] = useState<TripFormValues>(() => getDefaultFormValues(initialValues));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submittedOnce, setSubmittedOnce] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setValues(getDefaultFormValues(initialValues));
      setErrors({});
    }
  }, [initialValues]);

  const effectiveDays = useMemo(() => {
    if (values.durationMode === 'dates') {
      const diff = calculateDaysBetween(values.startDate, values.endDate);
      return diff > 0 ? diff : 0;
    }
    return values.numberOfDays > 0 ? values.numberOfDays : 0;
  }, [values.durationMode, values.startDate, values.endDate, values.numberOfDays]);

  const perDayBudget = effectiveDays > 0 && values.totalBudget > 0 ? values.totalBudget / effectiveDays : 0;
  const perPersonBudget = values.travelers > 0 && values.totalBudget > 0 ? values.totalBudget / values.travelers : 0;

  const updateField = <K extends keyof TripFormValues>(field: K, value: TripFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (submittedOnce) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleInterest = (interest: TravelInterest) => {
    setValues((prev) => {
      const exists = prev.interests.includes(interest);
      const next = exists
        ? prev.interests.filter((item) => item !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: next };
    });
    if (submittedOnce) {
      setErrors((prev) => ({ ...prev, interests: undefined }));
    }
  };

  const validate = (form: TripFormValues): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!form.destination.trim()) {
      nextErrors.destination = 'Please enter a destination city or region.';
    } else if (form.destination.trim().length < 2) {
      nextErrors.destination = 'Destination name must be at least 2 characters.';
    }

    if (!form.startingLocation.trim()) {
      nextErrors.startingLocation = 'Please enter your starting city or departure hub.';
    }

    if (form.durationMode === 'dates') {
      if (!form.startDate) {
        nextErrors.startDate = 'Select a travel start date.';
      }
      if (!form.endDate) {
        nextErrors.endDate = 'Select a travel end date.';
      }
      if (form.startDate && form.endDate) {
        const diff = calculateDaysBetween(form.startDate, form.endDate);
        if (diff <= 0) {
          nextErrors.endDate = 'End date must be on or after your start date.';
        } else if (diff > 21) {
          nextErrors.endDate = 'Please select a trip duration of 21 days or fewer.';
        }
      }
    } else {
      if (!Number.isFinite(form.numberOfDays) || form.numberOfDays < 1 || form.numberOfDays > 21) {
        nextErrors.numberOfDays = 'Enter a trip length between 1 and 21 days.';
      }
    }

    if (!Number.isFinite(form.travelers) || form.travelers < 1 || form.travelers > 20) {
      nextErrors.travelers = 'Enter between 1 and 20 travelers.';
    }

    if (!Number.isFinite(form.totalBudget) || form.totalBudget < 50) {
      nextErrors.totalBudget = 'Please enter a valid total trip budget of at least 50.';
    }

    if (form.interests.length === 0) {
      nextErrors.interests = 'Select at least one travel interest to shape your itinerary.';
    }

    return nextErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmittedOnce(true);
    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstErrorField = document.querySelector('[aria-invalid="true"]') as HTMLElement | null;
      firstErrorField?.focus();
      return;
    }

    onGenerateTrip(values);
  };

  const handleReset = () => {
    setValues(getDefaultFormValues(null));
    setErrors({});
    setSubmittedOnce(false);
  };

  const errorList = Object.values(errors).filter(Boolean) as string[];

  return (
    <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="max-w-3xl space-y-3 mb-10">
        <p className="text-sm font-medium text-[#C86D3B]">Trip Planning Studio</p>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold text-[#1E201D] leading-tight">
          Tell us about your upcoming trip
        </h1>
        <p className="text-base text-[#575B54] leading-relaxed">
          Provide your destination, timing, budget, and travel preferences below. TripMind AI will generate a personalized day-by-day itinerary, estimated budget breakdown, local food guide, and custom packing checklist using the Gemini API.
        </p>
      </div>

      {errorList.length > 0 && (
        <div
          role="alert"
          className="mb-8 bg-[#FDF6F4] border border-[#E5BFB8] rounded-xl p-5 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-[#A63A2B] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#7F271B]">
              Please review {errorList.length} {errorList.length === 1 ? 'field' : 'fields'} before continuing:
            </p>
            <ul className="text-sm text-[#7F271B]/90 list-disc list-inside space-y-0.5">
              {errorList.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-8 space-y-8">
          {/* Section 1: Destination & Timing */}
          <section className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#EFECE4] pb-4">
              <h2 className="font-serif text-2xl font-semibold text-[#1E201D]">
                01. Destination & Dates
              </h2>
              <p className="text-sm text-[#575B54] mt-1">
                Where are you traveling from, where are you headed, and how long will you stay?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="destination" className="block text-sm font-medium text-[#1E201D]">
                  Destination <span className="text-[#A63A2B]">*</span>
                </label>
                <input
                  id="destination"
                  type="text"
                  list="suggested-destinations"
                  placeholder="e.g., Kyoto, Lisbon, Rome"
                  value={values.destination}
                  onChange={(e) => updateField('destination', e.target.value)}
                  aria-invalid={Boolean(errors.destination)}
                  aria-describedby={errors.destination ? 'destination-error' : undefined}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-md text-[#1E201D] placeholder:text-[#959890] focus:border-[#1B4332] min-h-[42px] ${
                    errors.destination ? 'border-[#A63A2B]' : 'border-[#D8D1C4]'
                  }`}
                />
                <datalist id="suggested-destinations">
                  {SAMPLE_DESTINATIONS.map((dest) => (
                    <option key={dest.id} value={`${dest.name}, ${dest.country}`} />
                  ))}
                </datalist>
                {errors.destination && (
                  <p id="destination-error" className="text-xs text-[#A63A2B]">
                    {errors.destination}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="startingLocation" className="block text-sm font-medium text-[#1E201D]">
                  Starting location <span className="text-[#A63A2B]">*</span>
                </label>
                <input
                  id="startingLocation"
                  type="text"
                  placeholder="e.g., New York, Mumbai, London"
                  value={values.startingLocation}
                  onChange={(e) => updateField('startingLocation', e.target.value)}
                  aria-invalid={Boolean(errors.startingLocation)}
                  aria-describedby={errors.startingLocation ? 'startingLocation-error' : undefined}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-md text-[#1E201D] placeholder:text-[#959890] focus:border-[#1B4332] min-h-[42px] ${
                    errors.startingLocation ? 'border-[#A63A2B]' : 'border-[#D8D1C4]'
                  }`}
                />
                {errors.startingLocation && (
                  <p id="startingLocation-error" className="text-xs text-[#A63A2B]">
                    {errors.startingLocation}
                  </p>
                )}
              </div>
            </div>

            {/* Quick destination fill shortcuts */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#575B54]">
              <span>Quick picks:</span>
              {SAMPLE_DESTINATIONS.slice(0, 5).map((dest) => (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => updateField('destination', `${dest.name}, ${dest.country}`)}
                  className="px-2.5 py-1.5 rounded bg-[#EFECE4] hover:bg-[#E4DEC8] text-[#1E201D] transition-colors cursor-pointer"
                >
                  {dest.name}
                </button>
              ))}
            </div>

            {/* Duration Mode Segmented Toggle */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-medium text-[#1E201D]">
                  Trip duration <span className="text-[#A63A2B]">*</span>
                </span>
                <div
                  role="group"
                  aria-label="Duration selection mode"
                  className="inline-flex p-1 bg-[#EFECE4] rounded-md"
                >
                  <button
                    type="button"
                    onClick={() => updateField('durationMode', 'days')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                      values.durationMode === 'days'
                        ? 'bg-[#FDFBF7] text-[#1B4332] shadow-xs'
                        : 'text-[#575B54] hover:text-[#1E201D]'
                    }`}
                  >
                    Number of Days
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('durationMode', 'dates')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                      values.durationMode === 'dates'
                        ? 'bg-[#FDFBF7] text-[#1B4332] shadow-xs'
                        : 'text-[#575B54] hover:text-[#1E201D]'
                    }`}
                  >
                    Exact Travel Dates
                  </button>
                </div>
              </div>

              {values.durationMode === 'dates' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="startDate" className="block text-sm text-[#575B54]">
                      Travel start date
                    </label>
                    <input
                      id="startDate"
                      type="date"
                      min={getTodayISO()}
                      value={values.startDate}
                      onChange={(e) => updateField('startDate', e.target.value)}
                      aria-invalid={Boolean(errors.startDate)}
                      className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-md text-[#1E201D] min-h-[42px] tabular-nums ${
                        errors.startDate ? 'border-[#A63A2B]' : 'border-[#D8D1C4]'
                      }`}
                    />
                    {errors.startDate && <p className="text-xs text-[#A63A2B]">{errors.startDate}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="endDate" className="block text-sm text-[#575B54]">
                      Travel end date
                    </label>
                    <input
                      id="endDate"
                      type="date"
                      min={values.startDate || getTodayISO()}
                      value={values.endDate}
                      onChange={(e) => updateField('endDate', e.target.value)}
                      aria-invalid={Boolean(errors.endDate)}
                      className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-md text-[#1E201D] min-h-[42px] tabular-nums ${
                        errors.endDate ? 'border-[#A63A2B]' : 'border-[#D8D1C4]'
                      }`}
                    />
                    {errors.endDate && <p className="text-xs text-[#A63A2B]">{errors.endDate}</p>}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="numberOfDays" className="block text-sm text-[#575B54]">
                      Number of days (1–21)
                    </label>
                    <input
                      id="numberOfDays"
                      type="number"
                      min={1}
                      max={21}
                      value={values.numberOfDays}
                      onChange={(e) => updateField('numberOfDays', Number(e.target.value))}
                      aria-invalid={Boolean(errors.numberOfDays)}
                      className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-md text-[#1E201D] min-h-[42px] tabular-nums ${
                        errors.numberOfDays ? 'border-[#A63A2B]' : 'border-[#D8D1C4]'
                      }`}
                    />
                    {errors.numberOfDays && (
                      <p className="text-xs text-[#A63A2B]">{errors.numberOfDays}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="travelers" className="block text-sm text-[#575B54]">
                      Number of travelers <span className="text-[#A63A2B]">*</span>
                    </label>
                    <input
                      id="travelers"
                      type="number"
                      min={1}
                      max={20}
                      value={values.travelers}
                      onChange={(e) => updateField('travelers', Number(e.target.value))}
                      aria-invalid={Boolean(errors.travelers)}
                      className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-md text-[#1E201D] min-h-[42px] tabular-nums ${
                        errors.travelers ? 'border-[#A63A2B]' : 'border-[#D8D1C4]'
                      }`}
                    />
                    {errors.travelers && <p className="text-xs text-[#A63A2B]">{errors.travelers}</p>}
                  </div>
                </div>
              )}

              {values.durationMode === 'dates' && (
                <div className="max-w-xs space-y-1.5 pt-1">
                  <label htmlFor="travelers-dates" className="block text-sm text-[#575B54]">
                    Number of travelers <span className="text-[#A63A2B]">*</span>
                  </label>
                  <input
                    id="travelers-dates"
                    type="number"
                    min={1}
                    max={20}
                    value={values.travelers}
                    onChange={(e) => updateField('travelers', Number(e.target.value))}
                    aria-invalid={Boolean(errors.travelers)}
                    className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-md text-[#1E201D] min-h-[42px] tabular-nums ${
                      errors.travelers ? 'border-[#A63A2B]' : 'border-[#D8D1C4]'
                    }`}
                  />
                  {errors.travelers && <p className="text-xs text-[#A63A2B]">{errors.travelers}</p>}
                </div>
              )}
            </div>
          </section>

          {/* Section 2: Budget & Currency */}
          <section className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#EFECE4] pb-4">
              <h2 className="font-serif text-2xl font-semibold text-[#1E201D]">
                02. Budget & Currency
              </h2>
              <p className="text-sm text-[#575B54] mt-1">
                Set your total trip budget across all travelers so recommendations stay realistic.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
              <div className="sm:col-span-5 space-y-2">
                <label htmlFor="currency" className="block text-sm font-medium text-[#1E201D]">
                  Currency
                </label>
                <select
                  id="currency"
                  value={values.currency}
                  onChange={(e) => updateField('currency', e.target.value as TripFormValues['currency'])}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D1C4] rounded-md text-[#1E201D] min-h-[42px]"
                >
                  {CURRENCY_OPTIONS.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} ({curr.symbol}) — {curr.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-7 space-y-2">
                <label htmlFor="totalBudget" className="block text-sm font-medium text-[#1E201D]">
                  Total budget ({values.currency}) <span className="text-[#A63A2B]">*</span>
                </label>
                <input
                  id="totalBudget"
                  type="number"
                  min={50}
                  step={50}
                  value={values.totalBudget}
                  onChange={(e) => updateField('totalBudget', Number(e.target.value))}
                  aria-invalid={Boolean(errors.totalBudget)}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-md text-[#1E201D] min-h-[42px] tabular-nums ${
                    errors.totalBudget ? 'border-[#A63A2B]' : 'border-[#D8D1C4]'
                  }`}
                />
                {errors.totalBudget && (
                  <p className="text-xs text-[#A63A2B]">{errors.totalBudget}</p>
                )}
              </div>
            </div>
          </section>

          {/* Section 3: Travel Style, Pace & Interests */}
          <section className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl p-6 sm:p-8 space-y-7">
            <div className="border-b border-[#EFECE4] pb-4">
              <h2 className="font-serif text-2xl font-semibold text-[#1E201D]">
                03. Style, Pace & Interests
              </h2>
              <p className="text-sm text-[#575B54] mt-1">
                Choose the atmosphere, tempo, and themes that matter most to your group.
              </p>
            </div>

            {/* Travel Style */}
            <div className="space-y-3">
              <span className="block text-sm font-medium text-[#1E201D]">Travel style</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" role="radiogroup" aria-label="Travel style">
                {TRAVEL_STYLES.map((style) => {
                  const selected = values.travelStyle === style;
                  return (
                    <button
                      key={style}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => updateField('travelStyle', style)}
                      className={`px-3.5 py-2.5 text-sm font-medium rounded-md border transition-colors cursor-pointer min-h-[42px] whitespace-nowrap ${
                        selected
                          ? 'bg-[#1B4332] text-[#FDFBF7] border-[#1B4332]'
                          : 'bg-white text-[#1E201D] border-[#D8D1C4] hover:border-[#1B4332]/60'
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-[#1E201D]">
                  Interests <span className="text-[#A63A2B]">*</span>
                </span>
                <span className="text-xs text-[#787C74] tabular-nums">
                  {values.interests.length} selected
                </span>
              </div>
              <div
                className="flex flex-wrap gap-2.5"
                role="group"
                aria-label="Travel interests"
                aria-invalid={Boolean(errors.interests)}
              >
                {TRAVEL_INTERESTS.map((interest) => {
                  const active = values.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3.5 py-2 text-sm font-medium rounded-md border transition-colors cursor-pointer min-h-[40px] whitespace-nowrap ${
                        active
                          ? 'bg-[#C86D3B] text-[#FDFBF7] border-[#C86D3B]'
                          : 'bg-white text-[#1E201D] border-[#D8D1C4] hover:border-[#C86D3B]'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
              {errors.interests && <p className="text-xs text-[#A63A2B]">{errors.interests}</p>}
            </div>

            {/* Preferred Pace */}
            <div className="space-y-3">
              <span className="block text-sm font-medium text-[#1E201D]">Preferred pace</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Preferred pace">
                {TRAVEL_PACES.map((option) => {
                  const selected = values.pace === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => updateField('pace', option.value)}
                      className={`text-left p-4 rounded-lg border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#1B4332]/8 border-[#1B4332]'
                          : 'bg-white border-[#D8D1C4] hover:border-[#1B4332]/50'
                      }`}
                    >
                      <p className={`text-sm font-semibold ${selected ? 'text-[#1B4332]' : 'text-[#1E201D]'}`}>
                        {option.value}
                      </p>
                      <p className="text-xs text-[#575B54] mt-1 leading-relaxed">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Section 4: Personal Preferences */}
          <section className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#EFECE4] pb-4">
              <h2 className="font-serif text-2xl font-semibold text-[#1E201D]">
                04. Stay, Dining & Notes
              </h2>
              <p className="text-sm text-[#575B54] mt-1">
                Optional details that help shape lodging suggestions, food picks, and packing notes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="accommodationPreference" className="block text-sm font-medium text-[#1E201D]">
                  Accommodation preference
                </label>
                <select
                  id="accommodationPreference"
                  value={values.accommodationPreference}
                  onChange={(e) =>
                    updateField(
                      'accommodationPreference',
                      e.target.value as TripFormValues['accommodationPreference']
                    )
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D1C4] rounded-md text-[#1E201D] min-h-[42px]"
                >
                  {ACCOMMODATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="dietaryPreference" className="block text-sm font-medium text-[#1E201D]">
                  Dietary preferences
                </label>
                <select
                  id="dietaryPreference"
                  value={values.dietaryPreference}
                  onChange={(e) =>
                    updateField(
                      'dietaryPreference',
                      e.target.value as TripFormValues['dietaryPreference']
                    )
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D1C4] rounded-md text-[#1E201D] min-h-[42px]"
                >
                  {DIETARY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="additionalInstructions" className="block text-sm font-medium text-[#1E201D]">
                Additional instructions
              </label>
              <textarea
                id="additionalInstructions"
                rows={4}
                placeholder="Share accessibility needs, anniversary plans, favorite coffee styles, or places you already intend to visit..."
                value={values.additionalInstructions}
                onChange={(e) => updateField('additionalInstructions', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D1C4] rounded-md text-[#1E201D] placeholder:text-[#959890] focus:border-[#1B4332]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#EFECE4]">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#575B54] hover:text-[#1E201D] disabled:opacity-50 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed min-h-[42px]"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                Reset Form
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm sm:text-base font-medium text-[#FDFBF7] bg-[#1B4332] hover:bg-[#143326] disabled:opacity-60 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed min-h-[46px] whitespace-nowrap"
              >
                {isSubmitting ? 'Planning your adventure...' : 'Generate AI Itinerary'}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </section>
        </form>

        {/* Sticky Editorial Summary Sidebar */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl p-6 space-y-5">
            <div className="border-b border-[#EFECE4] pb-3.5">
              <h2 className="font-serif text-xl font-semibold text-[#1E201D]">Trip Brief Summary</h2>
              <p className="text-xs text-[#787C74] mt-1">Updates live as you configure your plan</p>
            </div>

            <dl className="space-y-3.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#575B54]">Destination</dt>
                <dd className="font-medium text-[#1E201D] text-right truncate">
                  {values.destination.trim() || 'Not specified'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#575B54]">Departing from</dt>
                <dd className="font-medium text-[#1E201D] text-right truncate">
                  {values.startingLocation.trim() || 'Not specified'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#575B54]">Duration</dt>
                <dd className="font-medium text-[#1E201D] tabular-nums">
                  {effectiveDays > 0 ? `${effectiveDays} ${effectiveDays === 1 ? 'day' : 'days'}` : 'Select dates'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#575B54]">Travelers</dt>
                <dd className="font-medium text-[#1E201D] tabular-nums">
                  {values.travelers} {values.travelers === 1 ? 'person' : 'people'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#575B54]">Style & Pace</dt>
                <dd className="font-medium text-[#1E201D] text-right">
                  {values.travelStyle} · {values.pace}
                </dd>
              </div>
              <div className="flex justify-between gap-4 pt-3 border-t border-[#EFECE4]">
                <dt className="text-[#575B54]">Total budget</dt>
                <dd className="font-semibold text-[#1B4332] tabular-nums">
                  {formatCurrency(values.totalBudget, values.currency)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#575B54]">Est. per day</dt>
                <dd className="font-medium text-[#1E201D] tabular-nums">
                  {perDayBudget > 0 ? formatCurrency(perDayBudget, values.currency) : '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#575B54]">Est. per traveler</dt>
                <dd className="font-medium text-[#1E201D] tabular-nums">
                  {perPersonBudget > 0 ? formatCurrency(perPersonBudget, values.currency) : '—'}
                </dd>
              </div>
            </dl>

            <div className="pt-4 border-t border-[#EFECE4] text-xs text-[#575B54] leading-relaxed">
              <p className="font-medium text-[#1E201D] mb-1">Powered by Gemini AI</p>
              <p>
                Your trip brief is processed securely on the server to craft a personalized itinerary. All costs and lodging suggestions are AI-generated estimates rather than live quotes.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
