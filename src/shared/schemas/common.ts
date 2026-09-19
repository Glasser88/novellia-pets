import { z } from "zod";

/** Calendar date as ISO "YYYY-MM-DD". Used for DOB, record dates, due dates. */
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

/**
 * HTML inputs submit "" when left blank, and some clients send null. For
 * optional fields we treat both as "not provided" so they validate as absent
 * instead of failing as an empty string.
 */
export function emptyToUndefined(value: unknown): unknown {
  return value === "" || value === null ? undefined : value;
}

/** Optional free text with blank-input handling. */
export function optionalText(maxLength = 500) {
  return z.preprocess(emptyToUndefined, z.string().trim().max(maxLength).optional());
}

/** Optional ISO date with blank-input handling. */
export const optionalIsoDate = z.preprocess(emptyToUndefined, isoDate.optional());
