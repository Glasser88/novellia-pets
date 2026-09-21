import type { RecordType } from "./defineRecordType";
import { allergy } from "./allergy";
import { medication } from "./medication";
import { vaccination } from "./vaccination";
import { vetVisit } from "./vetVisit";

export type { FieldDef, RecordType } from "./defineRecordType";
export { defineRecordType } from "./defineRecordType";

/**
 * The record-type registry. To add a record type:
 *   1. create `<type>.ts` next to this file (copy the closest existing one)
 *   2. add it to this list
 * No migration, route, or component changes are needed.
 *
 * Order here is the display order in the UI.
 */
const ALL_RECORD_TYPES = [vaccination, medication, vetVisit, allergy];

// The registry holds every type with its specific `data` shape erased. The
// only code that calls a type's `dueDate`/`summary` is below, and it passes
// data that came out of that same type's schema.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRecordType = RecordType<any>;

/** Lookup by key. Partial, because an unknown key (from the URL, say) has no entry. */
const recordTypesByKey: Partial<Record<string, AnyRecordType>> = Object.fromEntries(
  ALL_RECORD_TYPES.map((type) => [type.key, type]),
);

export const recordTypeKeys = ALL_RECORD_TYPES.map((type) => type.key) as [string, ...string[]];

export const isRecordTypeKey = (key: string): boolean => key in recordTypesByKey;

export class UnknownRecordTypeError extends Error {
  constructor(key: string) {
    super(`Unknown record type "${key}". Known types: ${recordTypeKeys.join(", ")}`);
    this.name = "UnknownRecordTypeError";
  }
}

export const getRecordType = (key: string): AnyRecordType => {
  const type = recordTypesByKey[key];

  if (!type) throw new UnknownRecordTypeError(key);

  return type;
};

/** Every type, in display order. */
export const listRecordTypes = (): AnyRecordType[] => [...ALL_RECORD_TYPES];

/**
 * Validate `data` against its type's schema and derive the due date. This is
 * the one place the registry is applied to incoming data; the server calls it
 * on create and update.
 */
export const parseRecordData = (
  typeKey: string,
  data: unknown,
  recordDate: string,
): { data: Record<string, unknown>; dueDate: string | null } => {
  const type = getRecordType(typeKey);
  const parsed = type.schema.parse(data ?? {});
  const dueDate = type.dueDate ? type.dueDate(parsed, recordDate) : null;

  return { data: parsed, dueDate };
};

/** One-line summary of a stored record's `data` for list views. */
export const summarizeRecordData = (
  typeKey: string,
  data: Record<string, unknown>,
): string | undefined => getRecordType(typeKey).summary?.(data);
