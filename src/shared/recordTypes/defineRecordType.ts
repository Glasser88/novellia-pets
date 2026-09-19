import { z } from "zod";

/**
 * Declarative field definitions. A record type lists its fields once; the Zod
 * schema (validation) and the form (presentation) are both derived from them,
 * so they cannot drift apart.
 */
export type FieldDef =
  | { kind: "text"; label: string; required?: boolean; placeholder?: string }
  | { kind: "textarea"; label: string; required?: boolean; placeholder?: string }
  | { kind: "number"; label: string; required?: boolean; min?: number; max?: number; unit?: string }
  | { kind: "date"; label: string; required?: boolean }
  | { kind: "boolean"; label: string }
  | {
      kind: "select";
      label: string;
      required?: boolean;
      options: readonly { value: string; label: string }[];
    };

export type FieldKind = FieldDef["kind"];

/** Calendar dates are stored as ISO "YYYY-MM-DD" strings inside `data`. */
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

type ValueOf<F extends FieldDef> = F["kind"] extends "number"
  ? number
  : F["kind"] extends "boolean"
    ? boolean
    : F["kind"] extends "select"
      ? F extends { options: readonly { value: infer V }[] }
        ? V
        : string
      : string;

/** The TypeScript shape of `data` for a set of field definitions. */
export type DataOf<Fields extends Record<string, FieldDef>> = {
  [
    K in keyof Fields as Fields[K] extends { required: true } | { kind: "boolean" } ? K : never
  ]: ValueOf<Fields[K]>;
} & {
  [
    K in keyof Fields as Fields[K] extends { required: true } | { kind: "boolean" } ? never : K
  ]?: ValueOf<Fields[K]>;
};

export interface RecordTypeConfig<Fields extends Record<string, FieldDef>> {
  /** Stable key stored in MedicalRecord.type. Never rename once data exists. */
  key: string;
  label: string;
  pluralLabel: string;
  description: string;
  fields: Fields;
  /**
   * Optional cross-field validation the field DSL cannot express
   * (e.g. "endDate must be after startDate").
   */
  refine?: (data: DataOf<Fields>, ctx: z.RefinementCtx) => void;
  /**
   * When this record implies future care, return the ISO date it is due.
   * The server stores the result in MedicalRecord.dueDate so the dashboard
   * can query it without unpacking JSON. Types with no follow-up omit this.
   */
  dueDate?: (data: DataOf<Fields>, recordDate: string) => string | null;
  /** One-line summary for list views, e.g. "Rabies · next due 2027-03-01". */
  summary?: (data: DataOf<Fields>) => string;
}

export interface RecordType<
  Fields extends Record<string, FieldDef> = Record<string, FieldDef>,
> extends RecordTypeConfig<Fields> {
  schema: z.ZodType<DataOf<Fields>>;
}

function fieldSchema(field: FieldDef): z.ZodTypeAny {
  let base: z.ZodTypeAny;
  switch (field.kind) {
    case "text":
    case "textarea":
      base = z.string().trim().max(2000);
      break;
    case "number": {
      let n = z.number().finite();
      if (field.min !== undefined) n = n.min(field.min);
      if (field.max !== undefined) n = n.max(field.max);
      base = n;
      break;
    }
    case "date":
      base = isoDate;
      break;
    case "boolean":
      return z.boolean().default(false);
    case "select":
      base = z.enum(field.options.map((o) => o.value) as [string, ...string[]]);
      break;
  }
  if ("required" in field && field.required) {
    return field.kind === "text" || field.kind === "textarea"
      ? (base as z.ZodString).min(1, "Required")
      : base;
  }
  // Optional fields: accept missing, null, or "" (from empty form inputs) as absent.
  return z.preprocess((v) => (v === "" || v === null ? undefined : v), base.optional());
}

export function defineRecordType<const Fields extends Record<string, FieldDef>>(
  config: RecordTypeConfig<Fields>,
): RecordType<Fields> {
  const shape = Object.fromEntries(
    Object.entries(config.fields).map(([name, field]) => [name, fieldSchema(field)]),
  );
  let schema: z.ZodTypeAny = z.object(shape).strict();
  if (config.refine) {
    const refine = config.refine;
    schema = schema.superRefine((data, ctx) => refine(data as DataOf<Fields>, ctx));
  }
  return { ...config, schema: schema as z.ZodType<DataOf<Fields>> };
}
