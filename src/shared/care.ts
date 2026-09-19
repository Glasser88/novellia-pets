import { daysBetween } from "@/lib/format";

/**
 * How urgent a piece of upcoming care is, judged from its due date.
 * Pure functions so the rule is unit-testable and shared by server and UI.
 */
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
