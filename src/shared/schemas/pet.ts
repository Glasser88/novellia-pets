import { z } from "zod";
import { Species } from "@/generated/prisma/enums";
import { optionalIsoDate, optionalText } from "./common";

export const speciesValues = Object.values(Species) as [Species, ...Species[]];

export const speciesLabels: Record<Species, string> = {
  DOG: "Dog",
  CAT: "Cat",
  BIRD: "Bird",
  RABBIT: "Rabbit",
  REPTILE: "Reptile",
  OTHER: "Other",
};

export const petInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  species: z.enum(speciesValues),
  breed: optionalText(100),
  dateOfBirth: optionalIsoDate,
  weightKg: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().positive().max(500).optional(),
  ),
  notes: optionalText(2000),
});

export type PetInput = z.infer<typeof petInputSchema>;

/** Partial update: any subset of fields, but at least one. */
export const petUpdateSchema = petInputSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, "No fields to update");

export type PetUpdate = z.infer<typeof petUpdateSchema>;

/** What the API returns. Dates are ISO strings so the shape is JSON-safe. */
export interface PetDto {
  id: string;
  name: string;
  species: Species;
  breed: string | null;
  dateOfBirth: string | null;
  weightKg: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
