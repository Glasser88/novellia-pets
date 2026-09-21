import { ShieldAlertIcon } from "lucide-react";
import { z } from "zod";
import { optionalText } from "@/shared/schemas/common";
import { defineRecordType } from "./defineRecordType";

const SEVERITIES = [
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
];

export const allergy = defineRecordType({
  key: "allergy",
  label: "Allergy",
  pluralLabel: "Allergies",
  description:
    "A known allergy or sensitivity. Has no due date; it is a standing fact about the pet.",
  icon: ShieldAlertIcon,

  schema: z.strictObject({
    allergen: z.string().trim().min(1, "Required"),
    reaction: optionalText(),
    severity: z.enum(SEVERITIES.map((severity) => severity.value)),
  }),

  fields: [
    {
      name: "allergen",
      label: "Allergen",
      kind: "text",
      required: true,
      placeholder: "e.g. Chicken, penicillin",
    },
    { name: "reaction", label: "Reaction", kind: "text", placeholder: "e.g. Hives, vomiting" },
    { name: "severity", label: "Severity", kind: "select", required: true, options: SEVERITIES },
  ],

  summary: (data) => `${data.allergen} (${data.severity})`,
});
