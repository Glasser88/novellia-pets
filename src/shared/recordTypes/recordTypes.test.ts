import { describe, expect, it } from "vitest";
import { defineRecordType, getRecordType, listRecordTypes, recordTypeKeys, UnknownRecordTypeError } from ".";
import { medication } from "./medication";
import { vaccination } from "./vaccination";

describe("registry", () => {
  it("has unique, stable keys", () => {
    expect(new Set(recordTypeKeys).size).toBe(recordTypeKeys.length);
    expect(recordTypeKeys).toEqual(["vaccination", "medication", "vet_visit", "allergy", "weight_check"]);
  });

  it("looks up types by key and rejects unknown keys", () => {
    expect(getRecordType("vaccination")).toBe(vaccination);
    expect(() => getRecordType("bloodwork")).toThrow(UnknownRecordTypeError);
  });

  it("every type has a label, description and at least one field", () => {
    for (const type of listRecordTypes()) {
      expect(type.label).toBeTruthy();
      expect(type.description).toBeTruthy();
      expect(Object.keys(type.fields).length).toBeGreaterThan(0);
    }
  });
});

describe("derived schemas", () => {
  it("accepts valid data and strips nothing", () => {
    const result = vaccination.schema.safeParse({ vaccine: "Rabies", nextDueDate: "2027-03-01" });
    expect(result.success).toBe(true);
  });

  it("requires required fields", () => {
    const result = vaccination.schema.safeParse({ nextDueDate: "2027-03-01" });
    expect(result.success).toBe(false);
  });

  it("treats empty strings from forms as absent for optional fields", () => {
    const result = vaccination.schema.safeParse({ vaccine: "Rabies", manufacturer: "", nextDueDate: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.nextDueDate).toBeUndefined();
  });

  it("rejects unknown keys so typos do not silently persist", () => {
    const result = vaccination.schema.safeParse({ vaccine: "Rabies", vacine: "typo" });
    expect(result.success).toBe(false);
  });

  it("validates date format and select options", () => {
    expect(vaccination.schema.safeParse({ vaccine: "Rabies", nextDueDate: "03/01/2027" }).success).toBe(false);
    expect(medication.schema.safeParse({ name: "Apoquel", frequency: "hourly" }).success).toBe(false);
  });

  it("runs cross-field refinements", () => {
    const result = medication.schema.safeParse({
      name: "Apoquel",
      frequency: "daily",
      endDate: "2026-10-01",
      refillDueDate: "2026-11-01",
    });
    expect(result.success).toBe(false);
  });
});

describe("dueDate", () => {
  it("is derived from the type's own rule", () => {
    expect(vaccination.dueDate?.({ vaccine: "Rabies", nextDueDate: "2027-03-01" }, "2026-03-01")).toBe("2027-03-01");
    expect(vaccination.dueDate?.({ vaccine: "Rabies" }, "2026-03-01")).toBeNull();
  });

  it("is absent for types with no follow-up", () => {
    expect(getRecordType("allergy").dueDate).toBeUndefined();
  });
});

describe("defineRecordType", () => {
  it("lets a new type be declared with only field definitions", () => {
    const bloodwork = defineRecordType({
      key: "bloodwork",
      label: "Bloodwork",
      pluralLabel: "Bloodwork",
      description: "Lab panel results",
      fields: {
        panel: { kind: "text", label: "Panel", required: true },
        abnormal: { kind: "boolean", label: "Abnormal results" },
      },
    });
    const parsed = bloodwork.schema.parse({ panel: "CBC" });
    expect(parsed).toEqual({ panel: "CBC", abnormal: false });
  });
});
