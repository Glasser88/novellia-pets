import { addDays, daysBetween } from "@/lib/format";
import type { Pet } from "@/shared/schemas/pet";
import type { MedicalRecord } from "@/shared/schemas/record";

/**
 * Care-tracking rules. Everything here is pure: the server fetches rows and
 * hands them in, so the rules are unit-tested without a database.
 */

/** How urgent a piece of upcoming care is, judged from its due date. */
export type CareStatus = "overdue" | "due_soon" | "upcoming";

/** Anything due within this many days counts as "due soon". */
export const DUE_SOON_DAYS = 30;

/** The last date that still counts as "due soon"; anything later is "upcoming". */
export const dueSoonCutoff = (today: string): string => addDays(today, DUE_SOON_DAYS);

/**
 * A range of due dates the app can ask for. The first three are the statuses
 * above; "attention" is overdue and due soon together.
 */
export type DueWindow = CareStatus | "attention";

export const DUE_WINDOW_LABELS: Record<DueWindow, string> = {
  attention: "Needs attention",
  overdue: "Overdue",
  due_soon: "Due soon",
  upcoming: "Upcoming",
};

export const isDueWindow = (value: unknown): value is DueWindow =>
  typeof value === "string" && value in DUE_WINDOW_LABELS;

/** How many items each dashboard list shows; the rest live on the full pages. */
export const DASHBOARD_LIST_LIMIT = 5;

export const careStatus = (dueDate: string, today: string): CareStatus => {
  const days = daysBetween(today, dueDate);
  if (days < 0) return "overdue";
  if (days <= DUE_SOON_DAYS) return "due_soon";

  return "upcoming";
};

/** "3 days overdue", "due today", "due in 12 days". */
export const describeDue = (dueDate: string, today: string): string => {
  const days = daysBetween(today, dueDate);
  if (days < 0) return `${-days} day${days === -1 ? "" : "s"} overdue`;
  if (days === 0) return "due today";

  return `due in ${days} day${days === 1 ? "" : "s"}`;
};

/** A record that implies future care, with the pet it belongs to. */
export interface CareItem {
  record: MedicalRecord;
  pet: Pet;
  /** The record's due date; never null here, unlike on MedicalRecord. */
  dueDate: string;
  status: CareStatus;
}

/** A pet with the most urgent status among its care items. */
export interface PetOverview {
  pet: Pet;
  status: CareStatus | "ok";
  recordCount: number;
}

export interface Dashboard {
  pets: PetOverview[];
  /** Overdue or due soon, soonest first, capped at DASHBOARD_LIST_LIMIT. */
  attention: CareItem[];
  /** Due after the cutoff, soonest first, capped at DASHBOARD_LIST_LIMIT. */
  upcoming: CareItem[];
  counts: { pets: number; overdue: number; dueSoon: number };
}

/** What the server aggregates per pet in one grouped query. */
export interface PetAggregate {
  recordCount: number;
  /** The soonest due date among the pet's records, if any has one. */
  earliestDueDate: string | null;
}

/**
 * A pet's status is the status of its earliest due date: sooner is always
 * more urgent, so the server only needs MIN(dueDate) per pet, not the rows.
 */
export const petStatus = (earliestDueDate: string | null, today: string): PetOverview["status"] =>
  earliestDueDate ? careStatus(earliestDueDate, today) : "ok";
