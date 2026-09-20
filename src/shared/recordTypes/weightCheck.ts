import { z } from "zod";
import { defineRecordType } from "./defineRecordType";

export const weightCheck = defineRecordType({
  key: "weight_check",
  label: "Weight check",
  pluralLabel: "Weight checks",
  description: "A weigh-in. Numeric data that can be charted over time.",

  schema: z.strictObject({
    weightKg: z.number().positive().max(500),
  }),

  fields: [{ name: "weightKg", label: "Weight", kind: "number", required: true, unit: "kg" }],

  summary: (data) => `${data.weightKg} kg`,
});
