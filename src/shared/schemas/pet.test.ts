import { describe, expect, it } from "vitest";
import { petInputSchema, petUpdateSchema } from "./pet";

describe("petInputSchema", () => {
  it("accepts a minimal pet", () => {
    const r = petInputSchema.safeParse({ name: "Milo", species: "DOG" });
    expect(r.success).toBe(true);
  });

  it("normalises empty form values to undefined", () => {
    const r = petInputSchema.parse({
      name: " Milo ",
      species: "CAT",
      breed: "",
      dateOfBirth: "",
      weightKg: "",
    });
    expect(r).toEqual({ name: "Milo", species: "CAT" });
  });

  it("coerces numeric strings for weight", () => {
    expect(petInputSchema.parse({ name: "Milo", species: "DOG", weightKg: "12.5" }).weightKg).toBe(
      12.5,
    );
  });

  it("rejects unknown species and bad dates", () => {
    expect(petInputSchema.safeParse({ name: "Milo", species: "DRAGON" }).success).toBe(false);
    expect(
      petInputSchema.safeParse({ name: "Milo", species: "DOG", dateOfBirth: "2020-1-1" }).success,
    ).toBe(false);
  });
});

describe("petUpdateSchema", () => {
  it("allows partial updates but not empty ones", () => {
    expect(petUpdateSchema.safeParse({ name: "Max" }).success).toBe(true);
    expect(petUpdateSchema.safeParse({}).success).toBe(false);
  });
});
