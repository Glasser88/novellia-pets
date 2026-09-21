import { z } from "zod";

/** One input in the "add record" form. */
export interface FieldDef {
  /** Key inside the record's `data` object. Must match a key in the schema. */
  name: string;
  label: string;
  kind: "text" | "textarea" | "number" | "date" | "select" | "boolean";
  required?: boolean;
  placeholder?: string;
  /** For kind "select". */
  options?: { value: string; label: string }[];
  /** For kind "number", shown in the label, e.g. "kg". */
  unit?: string;
}

/**
 * A record type. `schema` validates the record's `data`; `fields` says how to
 * render the form for it. A test checks that the two list the same keys.
 */
export interface RecordType<Schema extends z.ZodObject = z.ZodObject> {
  /** Stable key stored in MedicalRecord.type. Never rename once data exists. */
  key: string;
  label: string;
  pluralLabel: string;
  description: string;
  schema: Schema;
  fields: FieldDef[];
  /**
   * When this record implies future care, return the ISO date it is due. The
   * server stores the result in MedicalRecord.dueDate so the dashboard can
   * query it. Types with no follow-up omit this.
   */
  dueDate?: (data: z.infer<Schema>, recordDate: string) => string | null;
  /** One-line summary for list views, e.g. "Rabies". */
  summary?: (data: z.infer<Schema>) => string;
}

/**
 * Identity function: it only exists so TypeScript infers the schema type and
 * gives `dueDate` and `summary` a typed `data` argument.
 */
export const defineRecordType = <Schema extends z.ZodObject>(
  type: RecordType<Schema>,
): RecordType<Schema> => type;
