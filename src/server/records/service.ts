import type { MedicalRecord, Prisma } from "@/generated/prisma/client";
import { parseRecordData } from "@/shared/recordTypes";
import type { RecordDto, RecordInput, RecordUpdate } from "@/shared/schemas/record";
import { fromIsoDate, toIsoDate } from "../dates";
import { prisma } from "../db";
import { NotFoundError } from "../errors";
import { getPet } from "../pets/service";

export function toRecordDto(record: MedicalRecord): RecordDto {
  return {
    id: record.id,
    petId: record.petId,
    type: record.type,
    title: record.title,
    date: toIsoDate(record.date)!,
    notes: record.notes,
    data: (record.data ?? {}) as Record<string, unknown>,
    dueDate: toIsoDate(record.dueDate),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export interface ListRecordsOptions {
  type?: string;
}

/** Newest first. Ownership is enforced by resolving the pet under this owner. */
export async function listRecords(
  ownerId: string,
  petId: string,
  options: ListRecordsOptions = {},
): Promise<RecordDto[]> {
  await getPet(ownerId, petId);
  const records = await prisma.medicalRecord.findMany({
    where: { petId, ...(options.type && { type: options.type }) },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return records.map(toRecordDto);
}

export async function getRecord(
  ownerId: string,
  petId: string,
  recordId: string,
): Promise<RecordDto> {
  const record = await prisma.medicalRecord.findFirst({
    where: { id: recordId, petId, pet: { ownerId } },
  });
  if (!record) throw new NotFoundError("Record", recordId);
  return toRecordDto(record);
}

export async function createRecord(
  ownerId: string,
  petId: string,
  input: RecordInput,
): Promise<RecordDto> {
  await getPet(ownerId, petId);
  const { data, dueDate } = parseRecordData(input.type, input.data, input.date);
  const record = await prisma.medicalRecord.create({
    data: {
      petId,
      type: input.type,
      title: input.title,
      date: fromIsoDate(input.date)!,
      notes: input.notes,
      // Validated by the registry; Prisma only knows it is JSON.
      data: data as Prisma.InputJsonObject,
      dueDate: fromIsoDate(dueDate),
    },
  });
  return toRecordDto(record);
}

export async function updateRecord(
  ownerId: string,
  petId: string,
  recordId: string,
  input: RecordUpdate,
): Promise<RecordDto> {
  const existing = await getRecord(ownerId, petId, recordId);
  const date = input.date ?? existing.date;
  // Re-derive dueDate whenever the inputs it depends on change.
  const derived =
    input.data !== undefined || input.date !== undefined
      ? parseRecordData(existing.type, input.data ?? existing.data, date)
      : null;
  const record = await prisma.medicalRecord.update({
    where: { id: recordId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.date !== undefined && { date: fromIsoDate(input.date)! }),
      ...(derived && {
        data: derived.data as Prisma.InputJsonObject,
        dueDate: fromIsoDate(derived.dueDate),
      }),
    },
  });
  return toRecordDto(record);
}

export async function deleteRecord(
  ownerId: string,
  petId: string,
  recordId: string,
): Promise<void> {
  await getRecord(ownerId, petId, recordId);
  await prisma.medicalRecord.delete({ where: { id: recordId } });
}
