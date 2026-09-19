/**
 * Helpers for @db.Date columns.
 *
 * Prisma returns DATE columns as JS Dates at UTC midnight. Formatting one of
 * those in a browser west of UTC would show the previous day, so the app
 * treats them as calendar-date strings ("YYYY-MM-DD") everywhere outside the
 * database layer, and these helpers do the conversion at that boundary.
 */

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function toIsoDateOrNull(date: Date | null): string | null {
  return date ? toIsoDate(date) : null;
}

export function fromIsoDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

export function fromIsoDateOrNull(isoDate: string | null | undefined): Date | null {
  return isoDate ? fromIsoDate(isoDate) : null;
}
