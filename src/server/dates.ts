/**
 * Helpers for @db.Date columns.
 *
 * Prisma returns DATE columns as JS Dates at UTC midnight. Formatting one of
 * those in a browser west of UTC would show the previous day, so the app
 * treats them as calendar-date strings ("YYYY-MM-DD") everywhere outside the
 * database layer, and these helpers do the conversion at that boundary.
 */

export const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

export const toIsoDateOrNull = (date: Date | null): string | null =>
  date ? toIsoDate(date) : null;

export const fromIsoDate = (isoDate: string): Date => new Date(`${isoDate}T00:00:00.000Z`);

export const fromIsoDateOrNull = (isoDate: string | null | undefined): Date | null =>
  isoDate ? fromIsoDate(isoDate) : null;
