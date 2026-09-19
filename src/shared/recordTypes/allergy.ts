import { defineRecordType } from "./defineRecordType";

export const allergy = defineRecordType({
  key: "allergy",
  label: "Allergy",
  pluralLabel: "Allergies",
  description: "A known allergy or sensitivity. Has no due date; it is a standing fact about the pet.",
  fields: {
    allergen: { kind: "text", label: "Allergen", required: true, placeholder: "e.g. Chicken, penicillin" },
    reaction: { kind: "text", label: "Reaction", placeholder: "e.g. Hives, vomiting" },
    severity: {
      kind: "select",
      label: "Severity",
      required: true,
      options: [
        { value: "mild", label: "Mild" },
        { value: "moderate", label: "Moderate" },
        { value: "severe", label: "Severe" },
      ],
    },
  },
  summary: (data) => `${data.allergen} (${data.severity})`,
});
