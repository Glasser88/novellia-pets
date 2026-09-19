import { z } from "zod";

/** Calendar date as ISO "YYYY-MM-DD". Used for DOB, record dates, due dates. */
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

/**
 * HTML inputs submit "" when left blank. Two ways to treat that:
 *
 * - emptyToUndefined: blank means "absent". Used inside a record's `data`,
 *   which is always replaced as a whole, so absent keys simply are not stored.
 * - emptyToNull: blank means "clear this field". Used for nullable columns on
 *   pets and records, so that an edit form can empty a field: `null` clears
 *   it, while a key that is not sent at all (`undefined`) leaves it unchanged.
 */
export function emptyToUndefined(value: unknown): unknown {
  return value === "" || value === null ? undefined : value;
}

export function emptyToNull(value: unknown): unknown {
  return value === "" ? null : value;
}

/** Optional, clearable free text column. */
export function optionalText(maxLength = 500) {
  return z.preprocess(emptyToNull, z.string().trim().max(maxLength).nullable().optional());
}

/** Optional, clearable ISO date column. */
export const optionalIsoDate = z.preprocess(emptyToNull, isoDate.nullable().optional());
