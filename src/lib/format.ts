/**
 * Display helpers for the ISO calendar-date strings ("YYYY-MM-DD") the API
 * uses. Parsing is done as UTC on purpose so a date never shifts by a day
 * depending on the viewer's timezone.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

const parseIsoDate = (isoDate: string): Date => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

/**
 * Today's calendar date in ISO form, in the runtime's time zone: the browser's
 * on the client, the process's (`TZ`) on the server. Not `toISOString()`,
 * which is UTC and would roll over to tomorrow in the evening for anyone
 * west of Greenwich.
 */
export const todayIso = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

/** "Mar 1, 2027". Locale is fixed so server and client render the same text. */
export const formatDate = (isoDate: string): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(parseIsoDate(isoDate));

/** The calendar date `days` after `isoDate` (negative moves backwards). */
export const addDays = (isoDate: string, days: number): string =>
  new Date(parseIsoDate(isoDate).getTime() + days * DAY_MS).toISOString().slice(0, 10);

/** Whole days from `fromIso` to `toIso`; negative when `toIso` is earlier. */
export const daysBetween = (fromIso: string, toIso: string): number =>
  Math.round((parseIsoDate(toIso).getTime() - parseIsoDate(fromIso).getTime()) / DAY_MS);

/**
 * "3 years" / "8 months" / "3 weeks" from a date of birth.
 *
 * Deliberately approximate (30-day months, 365-day years): it is a display
 * hint, not a dosing input. If exact calendar ages were ever needed, this is
 * the one place to swap in date-fns' differenceInYears/differenceInMonths.
 */
export const formatAge = (dateOfBirth: string, today = todayIso()): string => {
  const days = daysBetween(dateOfBirth, today);
  if (days < 0) return "not born yet";
  if (days < 30) return plural(Math.floor(days / 7), "week");
  if (days < 365) return plural(Math.floor(days / 30), "month");
  return plural(Math.floor(days / 365), "year");
};

export const plural = (count: number, noun: string): string =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;
