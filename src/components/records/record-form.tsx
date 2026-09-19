"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/form-field";
import { RecordFieldInput, type FieldValue } from "@/components/records/record-field-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError, fieldErrorsFrom } from "@/lib/api";
import { todayIso } from "@/lib/format";
import { getRecordType, listRecordTypes, type RecordType } from "@/shared/recordTypes";
import { recordInputSchema, type RecordDto } from "@/shared/schemas/record";

interface RecordFormProps {
  petId: string;
  /** When set, the form edits this record; otherwise it creates one. */
  record?: RecordDto;
}

const recordTypes = listRecordTypes();

/** Initial `data` inputs for a type: the record's values, or blanks. */
function initialDataValues(
  type: RecordType,
  data?: Record<string, unknown>,
): Record<string, FieldValue> {
  const values: Record<string, FieldValue> = {};
  for (const [name, field] of Object.entries(type.fields)) {
    const existing = data?.[name];
    values[name] =
      field.kind === "boolean" ? Boolean(existing) : existing == null ? "" : String(existing);
  }
  return values;
}

/** Turn raw input values into the JSON the API expects for `data`. */
function dataFromValues(
  type: RecordType,
  values: Record<string, FieldValue>,
): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const [name, field] of Object.entries(type.fields)) {
    const value = values[name];
    if (field.kind === "number") {
      data[name] = value === "" ? undefined : Number(value);
    } else {
      data[name] = value;
    }
  }
  return data;
}

export function RecordForm({ petId, record }: RecordFormProps) {
  const router = useRouter();
  const [typeKey, setTypeKey] = useState(record?.type ?? recordTypes[0].key);
  const type = getRecordType(typeKey);

  const [title, setTitle] = useState(record?.title ?? "");
  const [date, setDate] = useState(record?.date ?? todayIso());
  const [notes, setNotes] = useState(record?.notes ?? "");
  const [dataValues, setDataValues] = useState(() => initialDataValues(type, record?.data));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function changeType(nextKey: string) {
    setTypeKey(nextKey);
    setDataValues(initialDataValues(getRecordType(nextKey)));
    setErrors({});
  }

  function setDataValue(name: string, value: FieldValue) {
    setDataValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    // Validate the shared fields and the type-specific `data` with the same
    // schemas the server uses. Errors are keyed by field name at both levels.
    const base = recordInputSchema.safeParse({ type: typeKey, title, date, notes, data: {} });
    const data = type.schema.safeParse(dataFromValues(type, dataValues));
    if (!base.success || !data.success) {
      setErrors({
        ...(base.success ? {} : fieldErrorsFrom(base.error.issues)),
        ...(data.success ? {} : fieldErrorsFrom(data.error.issues)),
      });
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const body = {
        title: base.data.title,
        date: base.data.date,
        notes: base.data.notes,
        data: data.data,
      };
      if (record) {
        await api(`/api/pets/${petId}/records/${record.id}`, { method: "PATCH", body });
      } else {
        await api(`/api/pets/${petId}/records`, {
          method: "POST",
          body: { type: typeKey, ...body },
        });
      }
      router.push(`/pets/${petId}`);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.issues.length ? error.fieldErrors() : { form: error.message });
      } else {
        setErrors({ form: "Something went wrong. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-lg flex-col gap-4">
      <FormField
        id="type"
        label="Record type"
        required
        hint={record ? "The type of an existing record cannot be changed." : type.description}
      >
        <NativeSelect
          id="type"
          value={typeKey}
          onChange={(e) => changeType(e.target.value)}
          disabled={Boolean(record)}
        >
          {recordTypes.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </NativeSelect>
      </FormField>

      <FormField id="title" label="Title" required error={errors.title}>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={Boolean(errors.title)}
          autoFocus
        />
      </FormField>

      <FormField id="date" label="Date" required error={errors.date}>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-invalid={Boolean(errors.date)}
        />
      </FormField>

      {/* Type-specific fields, rendered from the registry definition. */}
      {Object.entries(type.fields).map(([name, field]) => (
        <RecordFieldInput
          key={`${typeKey}-${name}`}
          name={name}
          field={field}
          value={dataValues[name] ?? ""}
          error={errors[name]}
          onChange={(value) => setDataValue(name, value)}
        />
      ))}

      <FormField id="notes" label="Notes" error={errors.notes}>
        <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </FormField>

      {errors.form && <p className="text-destructive text-sm">{errors.form}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : record ? "Save changes" : "Add record"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
