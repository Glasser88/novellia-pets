import { SyringeIcon } from "lucide-react";
import { z } from "zod";
import { optionalIsoDate, optionalText } from "@/shared/schemas/common";
import { defineRecordType } from "./defineRecordType";

export const vaccination = defineRecordType({
  key: "vaccination",
  label: "Vaccination",
  pluralLabel: "Vaccinations",
  description: "A vaccine dose administered, with when the next one is due.",
  icon: SyringeIcon,

  schema: z.strictObject({
    vaccine: z.string().trim().min(1, "Required"),
    manufacturer: optionalText(),
    lotNumber: optionalText(),
    administeredBy: optionalText(),
    nextDueDate: optionalIsoDate,
  }),

  fields: [
    {
      name: "vaccine",
      label: "Vaccine",
      kind: "text",
      required: true,
      placeholder: "e.g. Rabies, DHPP",
    },
    { name: "manufacturer", label: "Manufacturer", kind: "text" },
    { name: "lotNumber", label: "Lot number", kind: "text" },
    {
      name: "administeredBy",
      label: "Administered by",
      kind: "text",
      placeholder: "Clinic or vet",
    },
    { name: "nextDueDate", label: "Next dose due", kind: "date" },
  ],

  dueDate: (data) => data.nextDueDate ?? null,
  summary: (data) => data.vaccine,
});
