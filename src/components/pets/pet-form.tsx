"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError, fieldErrorsFrom } from "@/lib/api";
import { petInputSchema, speciesLabels, speciesValues, type PetDto } from "@/shared/schemas/pet";

/** What the inputs hold: always strings, exactly as the user typed them. */
interface PetFormValues {
  name: string;
  species: string;
  breed: string;
  dateOfBirth: string;
  weightKg: string;
  notes: string;
}

function valuesFromPet(pet?: PetDto): PetFormValues {
  return {
    name: pet?.name ?? "",
    species: pet?.species ?? "DOG",
    breed: pet?.breed ?? "",
    dateOfBirth: pet?.dateOfBirth ?? "",
    weightKg: pet?.weightKg?.toString() ?? "",
    notes: pet?.notes ?? "",
  };
}

interface PetFormProps {
  /** When set, the form edits this pet; otherwise it creates one. */
  pet?: PetDto;
}

export function PetForm({ pet }: PetFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<PetFormValues>(() => valuesFromPet(pet));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function setValue(field: keyof PetFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    // Same schema the server uses, so errors appear before a round-trip.
    const parsed = petInputSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrorsFrom(parsed.error.issues));
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const saved = pet
        ? await api<PetDto>(`/api/pets/${pet.id}`, { method: "PATCH", body: parsed.data })
        : await api<PetDto>("/api/pets", { method: "POST", body: parsed.data });
      router.push(`/pets/${saved.id}`);
      router.refresh(); // re-run the server components that read this pet
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
      <FormField id="name" label="Name" required error={errors.name}>
        <Input
          id="name"
          value={values.name}
          onChange={(e) => setValue("name", e.target.value)}
          aria-invalid={Boolean(errors.name)}
          autoFocus
        />
      </FormField>

      <FormField id="species" label="Species" required error={errors.species}>
        <NativeSelect
          id="species"
          value={values.species}
          onChange={(e) => setValue("species", e.target.value)}
        >
          {speciesValues.map((species) => (
            <option key={species} value={species}>
              {speciesLabels[species]}
            </option>
          ))}
        </NativeSelect>
      </FormField>

      <FormField id="breed" label="Breed" error={errors.breed}>
        <Input
          id="breed"
          value={values.breed}
          onChange={(e) => setValue("breed", e.target.value)}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField id="dateOfBirth" label="Date of birth" error={errors.dateOfBirth}>
          <Input
            id="dateOfBirth"
            type="date"
            value={values.dateOfBirth}
            onChange={(e) => setValue("dateOfBirth", e.target.value)}
            aria-invalid={Boolean(errors.dateOfBirth)}
          />
        </FormField>

        <FormField id="weightKg" label="Weight (kg)" error={errors.weightKg}>
          <Input
            id="weightKg"
            type="number"
            step="0.1"
            min="0"
            value={values.weightKg}
            onChange={(e) => setValue("weightKg", e.target.value)}
            aria-invalid={Boolean(errors.weightKg)}
          />
        </FormField>
      </div>

      <FormField id="notes" label="Notes" error={errors.notes}>
        <Textarea
          id="notes"
          rows={3}
          value={values.notes}
          onChange={(e) => setValue("notes", e.target.value)}
        />
      </FormField>

      {errors.form && <p className="text-destructive text-sm">{errors.form}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : pet ? "Save changes" : "Add pet"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
