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
