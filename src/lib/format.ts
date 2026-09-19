/**
 * Display helpers for the ISO calendar-date strings ("YYYY-MM-DD") the API
 * uses. Parsing is done as UTC on purpose so a date never shifts by a day
 * depending on the viewer's timezone.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Today's calendar date in ISO form. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** "Mar 1, 2027". Locale is fixed so server and client render the same text. */
export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(parseIsoDate(isoDate));
}

/** Whole days from `fromIso` to `toIso`; negative when `toIso` is earlier. */
export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((parseIsoDate(toIso).getTime() - parseIsoDate(fromIso).getTime()) / DAY_MS);
}

/** "3 years" / "8 months" / "3 weeks" from a date of birth. */
export function formatAge(dateOfBirth: string, today = todayIso()): string {
  const days = daysBetween(dateOfBirth, today);
  if (days < 0) return "not born yet";
  if (days < 30) return plural(Math.floor(days / 7), "week");
  if (days < 365) return plural(Math.floor(days / 30), "month");
  return plural(Math.floor(days / 365), "year");
}

export function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
