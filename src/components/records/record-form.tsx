"use client";

import Link from "next/link";
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
import { getRecordType, listRecordTypes, type AnyRecordType } from "@/shared/recordTypes";
import { recordInputSchema, type MedicalRecord } from "@/shared/schemas/record";

interface RecordFormProps {
  petId: string;
  /** When set, the form edits this record; otherwise it creates one. */
  record?: MedicalRecord;
  /** Where Cancel goes, and where an edit returns to after saving (a new item opens its own page). */
  returnTo: string;
}

const recordTypes = listRecordTypes();

/** Initial `data` inputs for a type: the record's values, or blanks. */
const initialDataValues = (
  type: AnyRecordType,
  data?: Record<string, unknown>,
): Record<string, FieldValue> => {
  const values: Record<string, FieldValue> = {};
  for (const field of type.fields) {
    const existing = data?.[field.name];
    if (field.kind === "boolean") {
      values[field.name] = Boolean(existing);
    } else {
      values[field.name] = existing == null ? "" : String(existing);
    }
  }
  return values;
};

/** Turn raw input values into the JSON the API expects for `data`. */
const dataFromValues = (
  type: AnyRecordType,
  values: Record<string, FieldValue>,
): Record<string, unknown> => {
  const data: Record<string, unknown> = {};
  for (const field of type.fields) {
    const value = values[field.name];
    if (field.kind === "number") {
      data[field.name] = value === "" ? null : Number(value);
    } else {
      data[field.name] = value;
    }
  }
  return data;
};

export const RecordForm = ({ petId, record, returnTo }: RecordFormProps) => {
  const router = useRouter();
  const [typeKey, setTypeKey] = useState(record?.type ?? recordTypes[0].key);
  const type = getRecordType(typeKey);

  const [title, setTitle] = useState(record?.title ?? "");
  const [date, setDate] = useState(record?.date ?? todayIso());
  const [notes, setNotes] = useState(record?.notes ?? "");
  const [dataValues, setDataValues] = useState(() => initialDataValues(type, record?.data));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const changeType = (nextKey: string) => {
    setTypeKey(nextKey);
    setDataValues(initialDataValues(getRecordType(nextKey)));
    setErrors({});
  };

  const setDataValue = (name: string, value: FieldValue) => {
    setDataValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // Validate the shared fields and the type-specific `data` with the same
    // schemas the server uses. Errors are keyed by field name at both levels.
    const base = recordInputSchema.safeParse({ type: typeKey, title, date, notes, data: {} });
    const data = type.schema.safeParse(dataFromValues(type, dataValues));
    if (!base.success || !data.success) {
      const fieldErrors: Record<string, string> = {};
      if (!base.success) Object.assign(fieldErrors, fieldErrorsFrom(base.error.issues));
      if (!data.success) Object.assign(fieldErrors, fieldErrorsFrom(data.error.issues));
      setErrors(fieldErrors);
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
      const saved = record
        ? await api<MedicalRecord>(`/api/pets/${petId}/records/${record.id}`, {
            method: "PATCH",
            body,
          })
        : await api<MedicalRecord>(`/api/pets/${petId}/records`, {
            method: "POST",
            body: { type: typeKey, ...body },
          });
      // A new record goes to its own page; an edited one returns to where the user came from.
      router.push(record ? returnTo : `/pets/${petId}/records/${saved.id}`);
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
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormField
        id="type"
        label="Record type"
        required
        hint={record ? "The type of an existing record cannot be changed." : type.description}
      >
        <NativeSelect
          id="type"
          value={typeKey}
          onChange={(event) => changeType(event.target.value)}
          disabled={Boolean(record)}
        >
          {recordTypes.map((recordType) => (
            <option key={recordType.key} value={recordType.key}>
              {recordType.label}
            </option>
          ))}
        </NativeSelect>
      </FormField>

      <FormField id="title" label="Title" required error={errors.title}>
        <Input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={Boolean(errors.title)}
          autoFocus
        />
      </FormField>

      <FormField id="date" label="Date" required error={errors.date}>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          aria-invalid={Boolean(errors.date)}
        />
      </FormField>

      {/* Type-specific fields, rendered from the registry definition. */}
      {type.fields.map((field) => (
        <RecordFieldInput
          key={`${typeKey}-${field.name}`}
          field={field}
          value={dataValues[field.name] ?? ""}
          error={errors[field.name]}
          onChange={(value) => setDataValue(field.name, value)}
        />
      ))}

      <FormField id="notes" label="Notes" error={errors.notes}>
        <Textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </FormField>

      {errors.form && <p className="text-destructive text-sm">{errors.form}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : record ? "Save changes" : "Add record"}
        </Button>
        <Button variant="ghost" nativeButton={false} render={<Link href={returnTo} />}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
