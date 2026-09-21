import { formatDate } from "@/lib/format";
import type { FieldDef } from "@/shared/recordTypes";

/**
 * A stored `data` value as display text, by the field's kind. Returns null
 * for "no value" so the caller can show a dash.
 */
export const formatFieldValue = (field: FieldDef, value: unknown): string | null => {
  if (value === null || value === undefined || value === "") return null;

  switch (field.kind) {
    case "boolean":
      return value ? "Yes" : "No";
    case "date":
      return formatDate(String(value));
    case "number":
      return field.unit ? `${value} ${field.unit}` : String(value);
    case "select":
      return field.options?.find((option) => option.value === value)?.label ?? String(value);
    default:
      return String(value);
  }
};
