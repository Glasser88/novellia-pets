import type { Prisma } from "@/generated/prisma/client";
import { careStatus, DASHBOARD_LIST_LIMIT, type CareItem, type Dashboard } from "@/shared/care";
import { prisma } from "../db";
import { dueDateFilter } from "../dueDates";
import { listPetOverviews, petFromRow } from "../pets/service";
import { recordFromRow } from "../records/service";

/**
 * A read model, not an entity service: nothing is created or updated here.
 * It assembles the dashboard from a handful of small queries and applies the
 * care rules in src/shared/care.ts.
 *
 * Every query here is bounded: the lists are capped at DASHBOARD_LIST_LIMIT
 * and the counts (and the per-pet statuses, in the pets service) are
 * aggregated in the database, so the dashboard costs the same with ten
 * records as with ten thousand. All of the dueDate predicates use the dueDate
 * index and the value the registry derived on write, so no JSON is unpacked.
 */

/** Everything an owner's records are filtered by. */
const ownedBy = (ownerId: string): Prisma.MedicalRecordWhereInput => ({ pet: { ownerId } });

/** The first `DASHBOARD_LIST_LIMIT` records in a due-date window, soonest first. */
const listDueRecords = async (
  ownerId: string,
  dueDate: Prisma.DateTimeNullableFilter,
  today: string,
): Promise<CareItem[]> => {
  const rows = await prisma.medicalRecord.findMany({
    where: { ...ownedBy(ownerId), dueDate },
    include: { pet: true },
    orderBy: { dueDate: "asc" },
    take: DASHBOARD_LIST_LIMIT,
  });

  return rows.map((row) => {
    const record = recordFromRow(row);
    // Every window excludes null due dates, so the assertion is safe.
    const dueDate = record.dueDate!;
    return { record, pet: petFromRow(row.pet), dueDate, status: careStatus(dueDate, today) };
  });
};

/** How many of an owner's records fall in a due-date window. */
const countDueRecords = (
  ownerId: string,
  dueDate: Prisma.DateTimeNullableFilter,
): Promise<number> => prisma.medicalRecord.count({ where: { ...ownedBy(ownerId), dueDate } });

/**
 * Fetch the inputs in parallel, then assemble the dashboard.
 *
 * Promise.all is deliberate: the panels share the same "as of today" moment,
 * so a partial dashboard would be inconsistent rather than merely incomplete.
 * Independent panels would instead be separate Server Components with their
 * own Suspense boundaries.
 */
export const getDashboard = async (ownerId: string, today: string): Promise<Dashboard> => {
  const [pets, attention, upcoming, overdue, dueSoon] = await Promise.all([
    listPetOverviews(ownerId, today),
    listDueRecords(ownerId, dueDateFilter("attention", today), today),
    listDueRecords(ownerId, dueDateFilter("upcoming", today), today),
    countDueRecords(ownerId, dueDateFilter("overdue", today)),
    countDueRecords(ownerId, dueDateFilter("due_soon", today)),
  ]);

  return {
    pets,
    attention,
    upcoming,
    counts: { pets: pets.length, overdue, dueSoon },
  };
};
