"use client";

import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { FieldDef } from "@/shared/recordTypes";

/** Form values for a record's `data` are kept as the raw input values. */
export type FieldValue = string | boolean;

interface RecordFieldInputProps {
  field: FieldDef;
  value: FieldValue;
  error?: string;
  onChange: (value: FieldValue) => void;
}

/**
 * Renders one registry field by its `kind`. This is the only place the UI
 * knows about field kinds, so a new record type needs no new components.
 */
export const RecordFieldInput = ({ field, value, error, onChange }: RecordFieldInputProps) => {
  const id = `data-${field.name}`;
  const invalid = Boolean(error);

  if (field.kind === "boolean") {
    return (
      <label htmlFor={id} className="flex items-center gap-2 text-sm">
        <input
          id={id}
          type="checkbox"
          className="size-4"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
        />
        {field.label}
      </label>
    );
  }

  const label = field.unit ? `${field.label} (${field.unit})` : field.label;
  const text = String(value);

  let control;
  switch (field.kind) {
    case "textarea":
      control = (
        <Textarea
          id={id}
          rows={3}
          value={text}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid}
        />
      );
      break;
    case "select":
      control = (
        <NativeSelect
          id={id}
          value={text}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid}
        >
          <option value="">Select…</option>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelect>
      );
      break;
    case "number":
      control = (
        <Input
          id={id}
          type="number"
          step="any"
          value={text}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid}
        />
      );
      break;
    case "date":
      control = (
        <Input
          id={id}
          type="date"
          value={text}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid}
        />
      );
      break;
    default: // "text"
      control = (
        <Input
          id={id}
          value={text}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid}
        />
      );
  }

  return (
    <FormField id={id} label={label} required={field.required} error={error}>
      {control}
    </FormField>
  );
};
