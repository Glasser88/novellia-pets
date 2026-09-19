import { defineRecordType } from "./defineRecordType";

export const vetVisit = defineRecordType({
  key: "vet_visit",
  label: "Vet visit",
  pluralLabel: "Vet visits",
  description: "An appointment, exam, or procedure at a clinic.",
  fields: {
    clinic: { kind: "text", label: "Clinic" },
    veterinarian: { kind: "text", label: "Veterinarian" },
    reason: { kind: "text", label: "Reason for visit", required: true },
    diagnosis: { kind: "textarea", label: "Diagnosis / findings" },
    followUpDate: { kind: "date", label: "Follow-up due" },
  },
  dueDate: (data) => data.followUpDate ?? null,
  summary: (data) => data.reason,
});
