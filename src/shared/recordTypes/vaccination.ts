import { defineRecordType } from "./defineRecordType";

export const vaccination = defineRecordType({
  key: "vaccination",
  label: "Vaccination",
  pluralLabel: "Vaccinations",
  description: "A vaccine dose administered, with when the next one is due.",
  fields: {
    vaccine: { kind: "text", label: "Vaccine", required: true, placeholder: "e.g. Rabies, DHPP" },
    manufacturer: { kind: "text", label: "Manufacturer" },
    lotNumber: { kind: "text", label: "Lot number" },
    administeredBy: { kind: "text", label: "Administered by", placeholder: "Clinic or vet" },
    nextDueDate: { kind: "date", label: "Next dose due" },
  },
  dueDate: (data) => data.nextDueDate ?? null,
  summary: (data) => data.vaccine,
});
