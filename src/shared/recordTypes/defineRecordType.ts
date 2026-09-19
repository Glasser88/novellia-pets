import { z } from "zod";
import { emptyToUndefined, isoDate } from "@/shared/schemas/common";

/**
 * A field of a record type's `data` object. Each record type lists its fields
 * once; the Zod validation schema and (later) the form UI are both built from
 * this list, so validation and presentation cannot drift apart.
 */
export type FieldDef =
  | { kind: "text"; label: string; required?: boolean; placeholder?: string }
  | { kind: "textarea"; label: string; required?: boolean; placeholder?: string }
  | { kind: "number"; label: string; required?: boolean; min?: number; max?: number; unit?: string }
  | { kind: "date"; label: string; required?: boolean }
  | { kind: "boolean"; label: string }
  | { kind: "select"; label: string; required?: boolean; options: readonly SelectOption[] };

export interface SelectOption {
  value: string;
  label: string;
}

export type FieldKind = FieldDef["kind"];

/** The runtime value a field kind holds inside `data`. */
type FieldValue<F extends FieldDef> = F["kind"] extends "number"
  ? number
  : F["kind"] extends "boolean"
    ? boolean
    : string; // text, textarea, date (ISO string) and select all hold strings

/**
 * The TypeScript type of `data` for a given set of fields, so that `dueDate`,
 * `summary` and `refine` callbacks get proper autocomplete.
 *
 * In words: required fields (and booleans, which default to false) are
 * present; every other field is optional.
 */
export type DataOf<Fields extends Record<string, FieldDef>> = {
  [K in RequiredKeys<Fields>]: FieldValue<Fields[K]>;
} & {
  [K in OptionalKeys<Fields>]?: FieldValue<Fields[K]>;
};

type RequiredKeys<Fields extends Record<string, FieldDef>> = {
  [K in keyof Fields]: Fields[K] extends { required: true } | { kind: "boolean" } ? K : never;
}[keyof Fields];

type OptionalKeys<Fields extends Record<string, FieldDef>> = Exclude<
  keyof Fields,
  RequiredKeys<Fields>
>;

export interface RecordTypeConfig<Fields extends Record<string, FieldDef>> {
  /** Stable key stored in MedicalRecord.type. Never rename once data exists. */
  key: string;
  label: string;
  pluralLabel: string;
  description: string;
  fields: Fields;
  /**
   * Optional cross-field validation the field definitions cannot express
   * (e.g. "endDate must be after startDate").
   */
  refine?: (data: DataOf<Fields>, ctx: z.RefinementCtx) => void;
  /**
   * When this record implies future care, return the ISO date it is due.
   * The server stores the result in MedicalRecord.dueDate so the dashboard
   * can query it without unpacking JSON. Types with no follow-up omit this.
   */
  dueDate?: (data: DataOf<Fields>, recordDate: string) => string | null;
  /** One-line summary for list views, e.g. "Rabies". */
  summary?: (data: DataOf<Fields>) => string;
}

/** A registered record type: the config plus the Zod schema derived from its fields. */
export interface RecordType<
  Fields extends Record<string, FieldDef> = Record<string, FieldDef>,
> extends RecordTypeConfig<Fields> {
  schema: z.ZodType<DataOf<Fields>>;
}

/** Build the Zod validator for one field. */
function fieldSchema(field: FieldDef): z.ZodTypeAny {
  // Booleans are never "missing": an unchecked checkbox is false.
  if (field.kind === "boolean") {
    return z.boolean().default(false);
  }

  let schema: z.ZodTypeAny;
  switch (field.kind) {
    case "text":
    case "textarea":
      schema = field.required
        ? z.string().trim().min(1, "Required").max(2000)
        : z.string().trim().max(2000);
      break;
    case "number":
      schema = z.number().finite();
      if (field.min !== undefined) schema = (schema as z.ZodNumber).min(field.min);
      if (field.max !== undefined) schema = (schema as z.ZodNumber).max(field.max);
      break;
    case "date":
      schema = isoDate;
      break;
    case "select":
      schema = z.enum(field.options.map((option) => option.value) as [string, ...string[]]);
      break;
  }

  if (field.required) {
    return schema;
  }
  return z.preprocess(emptyToUndefined, schema.optional());
}

/**
 * Declare a record type. Builds a strict object schema from `fields` (unknown
 * keys are rejected so typos never persist) and attaches the optional
 * cross-field `refine`.
 */
export function defineRecordType<const Fields extends Record<string, FieldDef>>(
  config: RecordTypeConfig<Fields>,
): RecordType<Fields> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [name, field] of Object.entries(config.fields)) {
    shape[name] = fieldSchema(field);
  }

  let schema: z.ZodTypeAny = z.object(shape).strict();
  if (config.refine) {
    const refine = config.refine;
    schema = schema.superRefine((data, ctx) => refine(data as DataOf<Fields>, ctx));
  }

  return { ...config, schema: schema as z.ZodType<DataOf<Fields>> };
}
