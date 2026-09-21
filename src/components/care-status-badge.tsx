import { Badge } from "@/components/ui/badge";
import type { CareStatus } from "@/shared/care";

const LABELS: Record<CareStatus | "ok", string> = {
  overdue: "Overdue",
  due_soon: "Due soon",
  upcoming: "Upcoming",
  ok: "All good",
};

const STYLES: Record<CareStatus | "ok", string> = {
  overdue: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  due_soon: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  upcoming: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  ok: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
};

export const CareStatusBadge = ({ status }: { status: CareStatus | "ok" }) => (
  <Badge variant="outline" className={`border-transparent ${STYLES[status]}`}>
    {LABELS[status]}
  </Badge>
);
