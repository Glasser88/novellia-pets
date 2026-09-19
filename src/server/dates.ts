/**
 * Helpers for @db.Date columns. Prisma returns them as JS Dates at UTC
 * midnight; the app treats them as calendar dates ("YYYY-MM-DD") everywhere
 * else so no timezone shifts creep in.
 */
export function toIsoDate(d: Date | null | undefined): string | null {
  return d ? d.toISOString().slice(0, 10) : null;
}

export function fromIsoDate(s: string | null | undefined): Date | null {
  return s ? new Date(`${s}T00:00:00.000Z`) : null;
}
