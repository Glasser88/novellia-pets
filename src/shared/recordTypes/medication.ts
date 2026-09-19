import { defineRecordType } from "./defineRecordType";

export const medication = defineRecordType({
  key: "medication",
  label: "Medication",
  pluralLabel: "Medications",
  description: "An ongoing or completed course of medication.",
  fields: {
    name: { kind: "text", label: "Medication", required: true, placeholder: "e.g. Apoquel" },
    dosage: { kind: "text", label: "Dosage", placeholder: "e.g. 16 mg" },
    frequency: {
      kind: "select",
      label: "Frequency",
      required: true,
      options: [
        { value: "once", label: "Once" },
        { value: "daily", label: "Daily" },
        { value: "twice_daily", label: "Twice daily" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
        { value: "as_needed", label: "As needed" },
      ],
    },
    endDate: { kind: "date", label: "End date" },
    refillDueDate: { kind: "date", label: "Refill due" },
  },
  refine: (data, ctx) => {
    if (data.endDate && data.refillDueDate && data.refillDueDate > data.endDate) {
      ctx.addIssue({
        code: "custom",
        path: ["refillDueDate"],
        message: "Refill cannot be due after the end date",
      });
    }
  },
  dueDate: (data) => data.refillDueDate ?? null,
  summary: (data) => [data.name, data.dosage].filter(Boolean).join(" · "),
});
