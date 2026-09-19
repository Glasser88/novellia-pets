import { daysBetween } from "@/lib/format";
import type { PetDto } from "@/shared/schemas/pet";
import type { RecordDto } from "@/shared/schemas/record";

/**
 * Care-tracking rules. Everything here is pure: the server fetches rows and
 * hands them in, so the rules are unit-tested without a database.
 */

/** How urgent a piece of upcoming care is, judged from its due date. */
export type CareStatus = "overdue" | "due_soon" | "upcoming";

/** Anything due within this many days counts as "due soon". */
export const DUE_SOON_DAYS = 30;

export function careStatus(dueDate: string, today: string): CareStatus {
  const days = daysBetween(today, dueDate);
  if (days < 0) return "overdue";
  if (days <= DUE_SOON_DAYS) return "due_soon";
  return "upcoming";
}

/** "3 days overdue", "due today", "due in 12 days". */
export function describeDue(dueDate: string, today: string): string {
  const days = daysBetween(today, dueDate);
  if (days < 0) return `${-days} day${days === -1 ? "" : "s"} overdue`;
  if (days === 0) return "due today";
  return `due in ${days} day${days === 1 ? "" : "s"}`;
}

/** A record that implies future care, with the pet it belongs to. */
export interface CareItem {
  record: RecordDto;
  pet: PetDto;
  status: CareStatus;
}

/** A pet with the most urgent status among its care items. */
export interface PetOverview {
  pet: PetDto;
  status: CareStatus | "ok";
  recordCount: number;
}

export interface Dashboard {
  pets: PetOverview[];
  care: CareItem[];
  counts: { pets: number; overdue: number; dueSoon: number };
}

const URGENCY: Record<PetOverview["status"], number> = {
  overdue: 3,
  due_soon: 2,
  upcoming: 1,
  ok: 0,
};

/** The most urgent status among a pet's care items, or "ok" if it has none. */
export function mostUrgentStatus(items: CareItem[]): PetOverview["status"] {
  let status: PetOverview["status"] = "ok";
  for (const item of items) {
    if (URGENCY[item.status] > URGENCY[status]) status = item.status;
  }
  return status;
}

/** Fold pets, their care items and record counts into what the dashboard shows. */
export function buildDashboard(
  pets: PetDto[],
  care: CareItem[],
  recordCountByPet: ReadonlyMap<string, number>,
): Dashboard {
  const overview = pets.map((pet) => ({
    pet,
    status: mostUrgentStatus(care.filter((item) => item.pet.id === pet.id)),
    recordCount: recordCountByPet.get(pet.id) ?? 0,
  }));

  return {
    pets: overview,
    care,
    counts: {
      pets: pets.length,
      overdue: care.filter((item) => item.status === "overdue").length,
      dueSoon: care.filter((item) => item.status === "due_soon").length,
    },
  };
}
