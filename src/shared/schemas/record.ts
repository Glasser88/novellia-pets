import { z } from "zod";
import { recordTypeKeys } from "@/shared/recordTypes";
import { isoDate, optionalText } from "./common";

/**
 * Fields every record shares. `data` is only checked to be an object here;
 * the record-type registry validates its contents in the service layer,
 * because which schema applies depends on `type`.
 */
export const recordInputSchema = z.object({
  type: z.enum(recordTypeKeys),
  title: z.string().trim().min(1, "Title is required").max(200),
  date: isoDate,
  notes: optionalText(5000),
  data: z.record(z.string(), z.unknown()).default({}),
});

export type RecordInput = z.infer<typeof recordInputSchema>;

/**
 * `type` is immutable: changing it would orphan `data`. `data`, when
 * present, replaces the whole object so it is always validated as a whole.
 */
export const recordUpdateSchema = recordInputSchema
  .omit({ type: true })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "No fields to update");

export type RecordUpdate = z.infer<typeof recordUpdateSchema>;

export interface RecordDto {
  id: string;
  petId: string;
  type: string;
  title: string;
  date: string;
  notes: string | null;
  data: Record<string, unknown>;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}
