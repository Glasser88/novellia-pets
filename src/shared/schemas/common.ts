import { z } from "zod";

/** Calendar date as ISO "YYYY-MM-DD". Used for DOB, record dates, due dates. */
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

/**
 * One rule for blank inputs everywhere: HTML inputs submit "" when left
 * empty, and we store that as null ("no value"). In an update, a key that is
 * not sent at all (undefined) means "leave it unchanged".
 */
export const emptyToNull = (value: unknown): unknown => (value === "" ? null : value);

export const optionalText = (maxLength = 500) =>
  z.preprocess(emptyToNull, z.string().trim().max(maxLength).nullable().optional());

export const optionalIsoDate = z.preprocess(emptyToNull, isoDate.nullable().optional());

/** For a record type's "number" field: the form sends null when it is left blank. */
export const optionalNumber = (min?: number, max?: number) => {
  let number = z.number();
  if (min !== undefined) number = number.min(min);
  if (max !== undefined) number = number.max(max);
  return z.preprocess(emptyToNull, number.nullable().optional());
};
