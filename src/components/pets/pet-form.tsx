"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError, fieldErrorsFrom } from "@/lib/api";
import { petInputSchema, speciesLabels, speciesValues, type Pet } from "@/shared/schemas/pet";

/** What the inputs hold: always strings, exactly as the user typed them. */
interface PetFormValues {
  name: string;
  species: string;
  breed: string;
  dateOfBirth: string;
  weightKg: string;
  notes: string;
}

const valuesFromPet = (pet?: Pet): PetFormValues => ({
  name: pet?.name ?? "",
  species: pet?.species ?? "DOG",
  breed: pet?.breed ?? "",
  dateOfBirth: pet?.dateOfBirth ?? "",
  weightKg: pet?.weightKg?.toString() ?? "",
  notes: pet?.notes ?? "",
});

interface PetFormProps {
  /** When set, the form edits this pet; otherwise it creates one. */
  pet?: Pet;
  /** Where Cancel goes, and where an edit returns to after saving (a new item opens its own page). */
  returnTo: string;
}

export const PetForm = ({ pet, returnTo }: PetFormProps) => {
  const router = useRouter();
  const [values, setValues] = useState<PetFormValues>(() => valuesFromPet(pet));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const setValue = (field: keyof PetFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
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
        ? await api<Pet>(`/api/pets/${pet.id}`, { method: "PATCH", body: parsed.data })
        : await api<Pet>("/api/pets", { method: "POST", body: parsed.data });
      // A new pet goes to its own page; an edited one returns to where the user came from.
      router.push(pet ? returnTo : `/pets/${saved.id}`);
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
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormField id="name" label="Name" required error={errors.name}>
        <Input
          id="name"
          value={values.name}
          onChange={(event) => setValue("name", event.target.value)}
          aria-invalid={Boolean(errors.name)}
          autoFocus
        />
      </FormField>

      <FormField id="species" label="Species" required error={errors.species}>
        <NativeSelect
          id="species"
          value={values.species}
          onChange={(event) => setValue("species", event.target.value)}
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
          onChange={(event) => setValue("breed", event.target.value)}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField id="dateOfBirth" label="Date of birth" error={errors.dateOfBirth}>
          <Input
            id="dateOfBirth"
            type="date"
            value={values.dateOfBirth}
            onChange={(event) => setValue("dateOfBirth", event.target.value)}
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
            onChange={(event) => setValue("weightKg", event.target.value)}
            aria-invalid={Boolean(errors.weightKg)}
          />
        </FormField>
      </div>

      <FormField id="notes" label="Notes" error={errors.notes}>
        <Textarea
          id="notes"
          rows={3}
          value={values.notes}
          onChange={(event) => setValue("notes", event.target.value)}
        />
      </FormField>

      {errors.form && <p className="text-destructive text-sm">{errors.form}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : pet ? "Save changes" : "Add pet"}
        </Button>
        <Button variant="ghost" nativeButton={false} render={<Link href={returnTo} />}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
