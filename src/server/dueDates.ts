import type { Prisma } from "@/generated/prisma/client";
import { dueSoonCutoff, type DueWindow } from "@/shared/care";
import { fromIsoDate } from "./dates";

/**
 * A due-date window as a Prisma filter, so the dashboard and the records
 * page agree on what "overdue" or "upcoming" means. All windows exclude
 * records with no due date, and all use the dueDate index.
 */
export const dueDateFilter = (window: DueWindow, today: string): Prisma.DateTimeNullableFilter => {
  const todayDate = fromIsoDate(today);
  const cutoff = fromIsoDate(dueSoonCutoff(today));

  switch (window) {
    case "overdue":
      return { lt: todayDate };
    case "due_soon":
      return { gte: todayDate, lte: cutoff };
    case "attention":
      return { lte: cutoff };
    case "upcoming":
      return { gt: cutoff };
  }
};
