import { apiService, type TripCardItem } from './api';

export function sanitizeTripId(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  if (!normalized || normalized.toLowerCase() === 'undefined' || normalized.toLowerCase() === 'null') {
    return null;
  }

  return normalized;
}

function parseTripDateLabel(label: string): number {
  const currentYear = new Date().getFullYear();
  const parsed = new Date(`${label} ${currentYear}`);
  return Number.isNaN(parsed.getTime()) ? Number.POSITIVE_INFINITY : parsed.getTime();
}

export function pickNearestTrip(trips: TripCardItem[]): TripCardItem | null {
  if (trips.length === 0) {
    return null;
  }

  return [...trips].sort((left, right) => parseTripDateLabel(left.startDate) - parseTripDateLabel(right.startDate))[0] || null;
}

export async function resolvePreferredTrip(): Promise<TripCardItem | null> {
  try {
    const upcomingTrips = await apiService.getTrips('upcoming');
    const upcomingTrip = pickNearestTrip(upcomingTrips.items);
    if (upcomingTrip) {
      return upcomingTrip;
    }

    const allTrips = await apiService.getTrips();
    return pickNearestTrip(allTrips.items);
  } catch {
    return null;
  }
}