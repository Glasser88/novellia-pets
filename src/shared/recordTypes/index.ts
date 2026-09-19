import type { RecordType } from "./defineRecordType";
import { allergy } from "./allergy";
import { medication } from "./medication";
import { vaccination } from "./vaccination";
import { vetVisit } from "./vetVisit";
import { weightCheck } from "./weightCheck";

export type { FieldDef, FieldKind, RecordType } from "./defineRecordType";
export { defineRecordType } from "./defineRecordType";

/**
 * The record-type registry. To add a record type:
 *   1. create `<type>.ts` next to this file using `defineRecordType`
 *   2. add it to this list
 * No migration, route, or component changes are needed.
 *
 * Order here is the display order in the UI.
 */
const ALL_RECORD_TYPES = [vaccination, medication, vetVisit, allergy, weightCheck] as const;

export const recordTypes: ReadonlyMap<string, RecordType> = new Map(
  ALL_RECORD_TYPES.map((t) => [t.key, t as RecordType]),
);

export const recordTypeKeys = ALL_RECORD_TYPES.map((t) => t.key) as [string, ...string[]];

export function getRecordType(key: string): RecordType {
  const type = recordTypes.get(key);
  if (!type) throw new UnknownRecordTypeError(key);
  return type;
}

export function listRecordTypes(): RecordType[] {
  return [...recordTypes.values()];
}

export class UnknownRecordTypeError extends Error {
  constructor(key: string) {
    super(`Unknown record type "${key}". Known types: ${recordTypeKeys.join(", ")}`);
    this.name = "UnknownRecordTypeError";
  }
}

/**
 * Validate `data` against its type's schema and derive the due date.
 * This is the one place the registry is applied to incoming data; the
 * server calls it on create and update.
 */
export function parseRecordData(
  typeKey: string,
  data: unknown,
  recordDate: string,
): { data: Record<string, unknown>; dueDate: string | null } {
  const type = getRecordType(typeKey);
  const parsed = type.schema.parse(data ?? {});
  const dueDate = type.dueDate ? type.dueDate(parsed, recordDate) : null;
  return { data: parsed, dueDate };
}

/**
 * One-line summary of a stored record's `data` for list views, or undefined
 * when the type defines none. `data` came through parseRecordData on the way
 * in, so it matches the type's shape.
 */
export function summarizeRecordData(
  typeKey: string,
  data: Record<string, unknown>,
): string | undefined {
  const type = getRecordType(typeKey);
  return type.summary?.(data as Parameters<NonNullable<typeof type.summary>>[0]);
}
