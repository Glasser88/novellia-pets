import { defineRecordType } from "./defineRecordType";

export const weightCheck = defineRecordType({
  key: "weight_check",
  label: "Weight check",
  pluralLabel: "Weight checks",
  description: "A weigh-in. Numeric data that can be charted over time.",
  fields: {
    weightKg: { kind: "number", label: "Weight", required: true, min: 0, max: 500, unit: "kg" },
  },
  summary: (data) => `${data.weightKg} kg`,
});
