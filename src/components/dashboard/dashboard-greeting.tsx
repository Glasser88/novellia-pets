import { formatDate } from "@/lib/format";
import { describeDue, type CareItem, type Dashboard } from "@/shared/care";

interface DashboardGreetingProps {
  name: string;
  today: string;
  dashboard: Dashboard;
}

/** "Milo's Rabies booster" */
const nameOf = (item: CareItem): string => `${item.pet.name}'s ${item.record.title}`;

/**
 * One sentence about the state of things. A single record is named; more
 * than one is counted. `attention` is the soonest-first list, so its first
 * overdue and first due-soon entries are the ones to name.
 */
const careSummary = ({ counts, attention, upcoming }: Dashboard, today: string): string => {
  if (counts.pets === 0) return "Add your first pet to start tracking their care.";

  const parts: string[] = [];

  const overdue = attention.find((item) => item.status === "overdue");
  if (counts.overdue === 1 && overdue) parts.push(`${nameOf(overdue)} is overdue`);
  else if (counts.overdue > 1) parts.push(`${counts.overdue} records are overdue`);

  const dueSoon = attention.find((item) => item.status === "due_soon");
  if (counts.dueSoon === 1 && dueSoon) {
    parts.push(`${nameOf(dueSoon)} is ${describeDue(dueSoon.dueDate, today)}`);
  } else if (counts.dueSoon > 1) {
    parts.push(`${counts.dueSoon} records are due in the next 30 days`);
  }

  if (parts.length > 0) return `${parts.join(", and ")}.`;

  const nextUp = upcoming[0];
  if (nextUp)
    return `Everything is up to date. Next up: ${nameOf(nextUp)}, ${formatDate(nextUp.dueDate)}.`;
  return "Everything is up to date.";
};

export const DashboardGreeting = ({ name, today, dashboard }: DashboardGreetingProps) => {
  const firstName = name.split(" ")[0];

  return (
    <div className="flex flex-col gap-1">
      <p className="text-muted-foreground text-sm">{formatDate(today)}</p>
      <h1 className="text-2xl font-semibold">Welcome back, {firstName}</h1>
      <p className="text-muted-foreground">{careSummary(dashboard, today)}</p>
    </div>
  );
};
