"use client";

import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { FieldDef } from "@/shared/recordTypes";

/** Form values for a record's `data` are kept as the raw input values. */
export type FieldValue = string | boolean;

interface RecordFieldInputProps {
  name: string;
  field: FieldDef;
  value: FieldValue;
  error?: string;
  onChange: (value: FieldValue) => void;
}

/**
 * Renders one registry field by its `kind`. This is the only place the UI
 * knows about field kinds, so a new record type needs no new components.
 */
export function RecordFieldInput({ name, field, value, error, onChange }: RecordFieldInputProps) {
  const id = `data-${name}`;
  const required = "required" in field && field.required;
  const invalid = Boolean(error);

  switch (field.kind) {
    case "text":
      return (
        <FormField id={id} label={field.label} required={required} error={error}>
          <Input
            id={id}
            value={String(value)}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={invalid}
          />
        </FormField>
      );

    case "textarea":
      return (
        <FormField id={id} label={field.label} required={required} error={error}>
          <Textarea
            id={id}
            rows={3}
            value={String(value)}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={invalid}
          />
        </FormField>
      );

    case "number":
      return (
        <FormField
          id={id}
          label={field.unit ? `${field.label} (${field.unit})` : field.label}
          required={required}
          error={error}
        >
          <Input
            id={id}
            type="number"
            step="any"
            min={field.min}
            max={field.max}
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={invalid}
          />
        </FormField>
      );

    case "date":
      return (
        <FormField id={id} label={field.label} required={required} error={error}>
          <Input
            id={id}
            type="date"
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={invalid}
          />
        </FormField>
      );

    case "select":
      return (
        <FormField id={id} label={field.label} required={required} error={error}>
          <NativeSelect
            id={id}
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={invalid}
          >
            <option value="">Select…</option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </FormField>
      );

    case "boolean":
      return (
        <label htmlFor={id} className="flex items-center gap-2 text-sm">
          <input
            id={id}
            type="checkbox"
            className="size-4"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          {field.label}
        </label>
      );
  }
}
