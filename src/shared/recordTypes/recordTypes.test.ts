import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  defineRecordType,
  getRecordType,
  listRecordTypes,
  parseRecordData,
  recordTypeKeys,
  summarizeRecordData,
  UnknownRecordTypeError,
} from ".";
import { medication } from "./medication";
import { vaccination } from "./vaccination";

describe("registry", () => {
  it("has unique, stable keys", () => {
    expect(new Set(recordTypeKeys).size).toBe(recordTypeKeys.length);
    expect(recordTypeKeys).toEqual([
      "vaccination",
      "medication",
      "vet_visit",
      "allergy",
      "weight_check",
    ]);
  });

  it("looks up types by key and rejects unknown keys", () => {
    expect(getRecordType("vaccination")).toBe(vaccination);
    expect(() => getRecordType("bloodwork")).toThrow(UnknownRecordTypeError);
  });

  it("every type's form fields match its schema keys exactly", () => {
    for (const type of listRecordTypes()) {
      const schemaKeys = Object.keys(type.schema.shape).sort();
      const fieldNames = type.fields.map((field) => field.name).sort();
      expect(fieldNames, type.key).toEqual(schemaKeys);
    }
  });

  it("select fields declare their options", () => {
    for (const type of listRecordTypes()) {
      for (const field of type.fields) {
        if (field.kind === "select")
          expect(field.options?.length, `${type.key}.${field.name}`).toBeGreaterThan(0);
      }
    }
  });
});

describe("schemas", () => {
  it("accept valid data", () => {
    expect(
      vaccination.schema.safeParse({ vaccine: "Rabies", nextDueDate: "2027-03-01" }).success,
    ).toBe(true);
  });

  it("require required fields", () => {
    expect(vaccination.schema.safeParse({ nextDueDate: "2027-03-01" }).success).toBe(false);
  });

  it("store blank inputs as null", () => {
    const parsed = vaccination.schema.parse({
      vaccine: "Rabies",
      manufacturer: "",
      nextDueDate: "",
    });
    expect(parsed.manufacturer).toBeNull();
    expect(parsed.nextDueDate).toBeNull();
  });

  it("reject unknown keys so typos do not silently persist", () => {
    expect(vaccination.schema.safeParse({ vaccine: "Rabies", vacine: "typo" }).success).toBe(false);
  });

  it("validate date format and select options", () => {
    expect(
      vaccination.schema.safeParse({ vaccine: "Rabies", nextDueDate: "03/01/2027" }).success,
    ).toBe(false);
    expect(medication.schema.safeParse({ name: "Apoquel", frequency: "hourly" }).success).toBe(
      false,
    );
  });

  it("run cross-field rules", () => {
    const result = medication.schema.safeParse({
      name: "Apoquel",
      frequency: "daily",
      endDate: "2026-10-01",
      refillDueDate: "2026-11-01",
    });
    expect(result.success).toBe(false);
  });
});

describe("parseRecordData", () => {
  it("validates against the type and derives dueDate", () => {
    const r = parseRecordData(
      "vaccination",
      { vaccine: "Rabies", nextDueDate: "2027-03-01" },
      "2026-03-01",
    );
    expect(r.data).toEqual({ vaccine: "Rabies", nextDueDate: "2027-03-01" });
    expect(r.dueDate).toBe("2027-03-01");
  });

  it("returns null dueDate when the rule has nothing or the type has no rule", () => {
    expect(parseRecordData("vaccination", { vaccine: "Rabies" }, "2026-03-01").dueDate).toBeNull();
    expect(
      parseRecordData("allergy", { allergen: "Chicken", severity: "mild" }, "2026-03-01").dueDate,
    ).toBeNull();
  });

  it("throws for unknown types and invalid data", () => {
    expect(() => parseRecordData("bloodwork", {}, "2026-03-01")).toThrow(UnknownRecordTypeError);
    expect(() => parseRecordData("vaccination", {}, "2026-03-01")).toThrow();
  });
});

describe("summarizeRecordData", () => {
  it("uses the type's summary when it has one", () => {
    expect(summarizeRecordData("allergy", { allergen: "Chicken", severity: "mild" })).toBe(
      "Chicken (mild)",
    );
  });
});

describe("defineRecordType", () => {
  it("is just a schema plus form fields", () => {
    const bloodwork = defineRecordType({
      key: "bloodwork",
      label: "Bloodwork",
      pluralLabel: "Bloodwork",
      description: "Lab panel results",
      schema: z.strictObject({ panel: z.string().min(1), abnormal: z.boolean().default(false) }),
      fields: [
        { name: "panel", label: "Panel", kind: "text", required: true },
        { name: "abnormal", label: "Abnormal results", kind: "boolean" },
      ],
      summary: (data) => data.panel,
    });
    expect(bloodwork.schema.parse({ panel: "CBC" })).toEqual({ panel: "CBC", abnormal: false });
    expect(bloodwork.summary?.({ panel: "CBC", abnormal: false })).toBe("CBC");
  });
});
