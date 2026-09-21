import { PillIcon } from "lucide-react";
import { z } from "zod";
import { optionalIsoDate, optionalText } from "@/shared/schemas/common";
import { defineRecordType } from "./defineRecordType";

const FREQUENCIES = [
  { value: "once", label: "Once" },
  { value: "daily", label: "Daily" },
  { value: "twice_daily", label: "Twice daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "as_needed", label: "As needed" },
];

export const medication = defineRecordType({
  key: "medication",
  label: "Medication",
  pluralLabel: "Medications",
  description: "An ongoing or completed course of medication.",
  icon: PillIcon,

  schema: z
    .strictObject({
      name: z.string().trim().min(1, "Required"),
      dosage: optionalText(),
      frequency: z.enum(FREQUENCIES.map((frequency) => frequency.value)),
      endDate: optionalIsoDate,
      refillDueDate: optionalIsoDate,
    })
    // Cross-field rule: plain Zod, nothing custom.
    .superRefine((data, ctx) => {
      if (data.endDate && data.refillDueDate && data.refillDueDate > data.endDate) {
        ctx.addIssue({
          code: "custom",
          path: ["refillDueDate"],
          message: "Refill cannot be due after the end date",
        });
      }
    }),

  fields: [
    {
      name: "name",
      label: "Medication",
      kind: "text",
      required: true,
      placeholder: "e.g. Apoquel",
    },
    { name: "dosage", label: "Dosage", kind: "text", placeholder: "e.g. 16 mg" },
    { name: "frequency", label: "Frequency", kind: "select", required: true, options: FREQUENCIES },
    { name: "endDate", label: "End date", kind: "date" },
    { name: "refillDueDate", label: "Refill due", kind: "date" },
  ],

  dueDate: (data) => data.refillDueDate ?? null,
  summary: (data) => [data.name, data.dosage].filter(Boolean).join(" · "),
});
