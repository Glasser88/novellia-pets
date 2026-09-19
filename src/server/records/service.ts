import type { MedicalRecord, Prisma } from "@/generated/prisma/client";
import { parseRecordData } from "@/shared/recordTypes";
import type { RecordDto, RecordInput, RecordUpdate } from "@/shared/schemas/record";
import { fromIsoDate, fromIsoDateOrNull, toIsoDate, toIsoDateOrNull } from "../dates";
import { prisma } from "../db";
import { NotFoundError } from "../errors";
import { getPet } from "../pets/service";

export function toRecordDto(record: MedicalRecord): RecordDto {
  return {
    id: record.id,
    petId: record.petId,
    type: record.type,
    title: record.title,
    date: toIsoDate(record.date),
    notes: record.notes,
    // Prisma types the jsonb column as generic JSON; the registry validated
    // it as an object on the way in.
    data: record.data as Record<string, unknown>,
    dueDate: toIsoDateOrNull(record.dueDate),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export interface ListRecordsOptions {
  type?: string;
  /** Case-insensitive match against the title. */
  query?: string;
}

/** Newest first. Ownership is enforced by resolving the pet under this owner. */
export async function listRecords(
  ownerId: string,
  petId: string,
  options: ListRecordsOptions = {},
): Promise<RecordDto[]> {
  await getPet(ownerId, petId);

  const where: Prisma.MedicalRecordWhereInput = { petId };
  if (options.type) where.type = options.type;
  if (options.query) where.title = { contains: options.query, mode: "insensitive" };

  const records = await prisma.medicalRecord.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return records.map(toRecordDto);
}

export async function getRecord(
  ownerId: string,
  petId: string,
  recordId: string,
): Promise<RecordDto> {
  // `pet: { ownerId }` filters through the relation, so this is one query.
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

  // The registry validates `data` for this type and derives the due date.
  const { data, dueDate } = parseRecordData(input.type, input.data, input.date);

  const record = await prisma.medicalRecord.create({
    data: {
      petId,
      type: input.type,
      title: input.title,
      date: fromIsoDate(input.date),
      notes: input.notes,
      data: data as Prisma.InputJsonObject,
      dueDate: fromIsoDateOrNull(dueDate),
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

  const changes: Prisma.MedicalRecordUpdateInput = {};
  if (input.title !== undefined) changes.title = input.title;
  if (input.notes !== undefined) changes.notes = input.notes;
  if (input.date !== undefined) changes.date = fromIsoDate(input.date);

  // dueDate depends on `data` and `date`, so re-validate and re-derive it
  // whenever either changes. `data` is always replaced as a whole.
  const dataChanged = input.data !== undefined;
  const dateChanged = input.date !== undefined;
  if (dataChanged || dateChanged) {
    const { data, dueDate } = parseRecordData(
      existing.type,
      input.data ?? existing.data,
      input.date ?? existing.date,
    );
    changes.data = data as Prisma.InputJsonObject;
    changes.dueDate = fromIsoDateOrNull(dueDate);
  }

  const record = await prisma.medicalRecord.update({ where: { id: recordId }, data: changes });
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
