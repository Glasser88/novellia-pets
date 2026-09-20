import { z } from "zod";
import { optionalIsoDate, optionalText } from "@/shared/schemas/common";
import { defineRecordType } from "./defineRecordType";

export const vetVisit = defineRecordType({
  key: "vet_visit",
  label: "Vet visit",
  pluralLabel: "Vet visits",
  description: "An appointment, exam, or procedure at a clinic.",

  schema: z.strictObject({
    clinic: optionalText(),
    veterinarian: optionalText(),
    reason: z.string().trim().min(1, "Required"),
    diagnosis: optionalText(2000),
    followUpDate: optionalIsoDate,
  }),

  fields: [
    { name: "clinic", label: "Clinic", kind: "text" },
    { name: "veterinarian", label: "Veterinarian", kind: "text" },
    { name: "reason", label: "Reason for visit", kind: "text", required: true },
    { name: "diagnosis", label: "Diagnosis / findings", kind: "textarea" },
    { name: "followUpDate", label: "Follow-up due", kind: "date" },
  ],

  dueDate: (data) => data.followUpDate ?? null,
  summary: (data) => data.reason,
});
