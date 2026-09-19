import { z } from "zod";

/** Calendar date as ISO "YYYY-MM-DD". Used for DOB, record dates, due dates. */
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

/** Optional text input: empty strings from forms become `undefined`. */
export const optionalText = (max = 500) =>
  z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.string().trim().max(max).optional(),
  );

/** Optional ISO date input with the same empty-string handling. */
export const optionalIsoDate = z.preprocess(
  (v) => (v === "" || v === null ? undefined : v),
  isoDate.optional(),
);

export const uuid = z.string().uuid();
