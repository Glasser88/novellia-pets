import type { MedicalRecord as MedicalRecordRow, Prisma } from "@/generated/prisma/client";
import { parseRecordData } from "@/shared/recordTypes";
import type { DueWindow } from "@/shared/care";
import type { Pet } from "@/shared/schemas/pet";
import type { MedicalRecord, RecordInput, RecordUpdate } from "@/shared/schemas/record";
import { fromIsoDate, fromIsoDateOrNull, toIsoDate, toIsoDateOrNull } from "../dates";
import { prisma } from "../db";
import { dueDateFilter } from "../dueDates";
import { NotFoundError } from "../errors";
import { getPet, petFromRow } from "../pets/service";

export const recordFromRow = (record: MedicalRecordRow): MedicalRecord => ({
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
});

export interface ListRecordsOptions {
  type?: string;
  /** Case-insensitive match against the title. */
  query?: string;
}

/** Newest first. Ownership is enforced by resolving the pet under this owner. */
export const listRecords = async (
  ownerId: string,
  petId: string,
  options: ListRecordsOptions = {},
): Promise<MedicalRecord[]> => {
  await getPet(ownerId, petId);

  const where: Prisma.MedicalRecordWhereInput = { petId };
  if (options.type) where.type = options.type;
  if (options.query) where.title = { contains: options.query, mode: "insensitive" };

  const records = await prisma.medicalRecord.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return records.map(recordFromRow);
};

/** How many records the records page shows per page. */
export const RECORDS_PAGE_SIZE = 10;

export interface ListAllRecordsOptions {
  /** Only records whose due date falls in this window. */
  dueWindow?: DueWindow;
  type?: string;
  /** Case-insensitive match against the title. */
  query?: string;
  /** 1-based page number. */
  page?: number;
}

export interface RecordWithPet {
  record: MedicalRecord;
  pet: Pet;
}

export interface RecordsPage {
  rows: RecordWithPet[];
  /** How many records match the filters in total, across all pages. */
  total: number;
  page: number;
  pageCount: number;
}

/**
 * One page of records across all of an owner's pets, for the records page.
 * Sorted by due date when a due window is chosen (soonest first), newest
 * first otherwise.
 *
 * Offset pagination: page N skips (N - 1) * size rows. Simple and enough for
 * an owner's records; see "Pagination" in DECISIONS.md for when it would
 * change.
 */
export const listAllRecords = async (
  ownerId: string,
  today: string,
  options: ListAllRecordsOptions = {},
): Promise<RecordsPage> => {
  const where: Prisma.MedicalRecordWhereInput = { pet: { ownerId } };

  if (options.dueWindow) where.dueDate = dueDateFilter(options.dueWindow, today);
  if (options.type) where.type = options.type;
  if (options.query) where.title = { contains: options.query, mode: "insensitive" };

  const total = await prisma.medicalRecord.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / RECORDS_PAGE_SIZE));
  // A page past the end (say, a stale link after deletions) shows the last page.
  const page = Math.min(Math.max(1, options.page ?? 1), pageCount);

  const rows = await prisma.medicalRecord.findMany({
    where,
    include: { pet: true },
    orderBy: options.dueWindow ? { dueDate: "asc" } : [{ date: "desc" }, { createdAt: "desc" }],
    skip: (page - 1) * RECORDS_PAGE_SIZE,
    take: RECORDS_PAGE_SIZE,
  });

  return {
    rows: rows.map((row) => ({ record: recordFromRow(row), pet: petFromRow(row.pet) })),
    total,
    page,
    pageCount,
  };
};

/** Returns null when there is no such record; pages use this and show a 404. */
export const findRecord = async (
  ownerId: string,
  petId: string,
  recordId: string,
): Promise<MedicalRecord | null> => {
  // `pet: { ownerId }` filters through the relation, so this is one query.
  const record = await prisma.medicalRecord.findFirst({
    where: { id: recordId, petId, pet: { ownerId } },
  });
  return record ? recordFromRow(record) : null;
};

/** Like findRecord, but throws NotFoundError; for API routes and other services. */
export const getRecord = async (
  ownerId: string,
  petId: string,
  recordId: string,
): Promise<MedicalRecord> => {
  const record = await findRecord(ownerId, petId, recordId);
  if (!record) throw new NotFoundError("Record", recordId);
  return record;
};

export const createRecord = async (
  ownerId: string,
  petId: string,
  input: RecordInput,
): Promise<MedicalRecord> => {
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
  return recordFromRow(record);
};

export const updateRecord = async (
  ownerId: string,
  petId: string,
  recordId: string,
  input: RecordUpdate,
): Promise<MedicalRecord> => {
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
  return recordFromRow(record);
};

export const deleteRecord = async (
  ownerId: string,
  petId: string,
  recordId: string,
): Promise<void> => {
  await getRecord(ownerId, petId, recordId);
  await prisma.medicalRecord.delete({ where: { id: recordId } });
};
