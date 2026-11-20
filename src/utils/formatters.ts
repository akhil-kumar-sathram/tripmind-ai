import { CURRENCY_OPTIONS, CurrencyCode, Itinerary } from '../types/trip';

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const safeAmount = Number.isFinite(amount) ? Math.round(amount) : 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(safeAmount);
  } catch {
    const fallback = CURRENCY_OPTIONS.find((c) => c.code === currency)?.symbol ?? '$';
    return `${fallback}${safeAmount.toLocaleString('en-US')}`;
  }
}

export function convertFromUSD(usdAmount: number, currency: CurrencyCode): number {
  const option = CURRENCY_OPTIONS.find((c) => c.code === currency);
  const rate = option ? option.rateFromUSD : 1;
  const raw = usdAmount * rate;
  if (currency === 'JPY' || currency === 'INR') {
    return Math.round(raw / 50) * 50;
  }
  return Math.max(5, Math.round(raw / 5) * 5);
}

export function calculateDaysBetween(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDayDate(startDate: string, dayOffset: number): string | undefined {
  if (!startDate) return undefined;
  const date = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  date.setDate(date.getDate() + dayOffset);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeSavedDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Recently saved';
  return `Saved ${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

export function buildPlainTextSummary(itinerary: Itinerary): string {
  const sourceHeader =
    itinerary.dataSource === 'gemini-ai'
      ? 'TripMind AI Itinerary (AI-Generated Estimate)'
      : 'TripMind AI Itinerary (Curated Sample Preview)';

  const lines: string[] = [
    sourceHeader,
    itinerary.tripTitle ? itinerary.tripTitle : '',
    `${itinerary.destination}${itinerary.country ? `, ${itinerary.country}` : ''}`,
    `Dates: ${itinerary.dateRangeLabel} (${itinerary.numberOfDays} ${itinerary.numberOfDays === 1 ? 'day' : 'days'})`,
    `Travelers: ${itinerary.travelers} | Style: ${itinerary.travelStyle} | Pace: ${itinerary.pace}`,
    `Target Budget: ${formatCurrency(itinerary.totalBudget, itinerary.currency)} (Est. ${formatCurrency(itinerary.estimatedTotalCost, itinerary.currency)})`,
    '',
    'Summary:',
    itinerary.summary,
    '',
    'Daily Plan:',
  ].filter((line, idx) => !(idx === 1 && line === ''));

  for (const day of itinerary.days) {
    lines.push(
      `Day ${day.dayNumber}${day.dateLabel ? ` (${day.dateLabel})` : ''} — ${day.theme} (Est. ${formatCurrency(day.estimatedDailyCost, itinerary.currency)})`
    );
    for (const act of day.activities) {
      lines.push(`  • ${act.slot} (${act.timeRange}): ${act.title} at ${act.place}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
