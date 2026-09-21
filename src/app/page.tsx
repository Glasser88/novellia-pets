import Link from "next/link";
import {
  CalendarClockIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  PawPrintIcon,
  PlusIcon,
} from "lucide-react";
import { CareList } from "@/components/dashboard/care-list";
import { DashboardGreeting } from "@/components/dashboard/dashboard-greeting";
import { SectionCard } from "@/components/section-card";
import { PetList } from "@/components/dashboard/pet-list";
import { StatCard } from "@/components/dashboard/stat-card";
import { ViewAllLink } from "@/components/view-all-link";
import { Button } from "@/components/ui/button";
import { todayIso } from "@/lib/format";
import { getDashboard } from "@/server/dashboard/service";
import { getCurrentUser } from "@/server/currentUser";

const DashboardPage = async () => {
  const user = await getCurrentUser();
  const today = todayIso();
  const dashboard = await getDashboard(user.id, today);
  const { pets, attention, upcoming, counts } = dashboard;

  // First run: one welcoming card instead of four empty sections.
  if (pets.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <DashboardGreeting name={user.name} today={today} dashboard={dashboard} />
        <SectionCard
          title="Add your first pet"
          description="Once a pet is here, their records and upcoming care show up on this page."
          className="mx-auto w-full max-w-xl"
        >
          <Button nativeButton={false} render={<Link href="/pets/new" />}>
            <PlusIcon /> Add pet
          </Button>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <DashboardGreeting name={user.name} today={today} dashboard={dashboard} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pets" value={counts.pets} icon={PawPrintIcon} href="/pets" />
        <StatCard
          label="Overdue"
          value={counts.overdue}
          icon={CircleAlertIcon}
          href="/records?status=overdue"
          tone="danger"
        />
        <StatCard
          label="Due in the next 30 days"
          value={counts.dueSoon}
          icon={CalendarClockIcon}
          href="/records?status=due_soon"
          tone="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Needs attention"
          hint="Records that are overdue, or due in the next 30 days. Soonest first."
          action={<ViewAllLink href="/records?status=attention" />}
          isEmpty={attention.length === 0}
          emptyMessage={
            <span className="flex items-center gap-2">
              <CircleCheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
              Nothing needs attention right now.
            </span>
          }
        >
          <CareList items={attention} today={today} />
        </SectionCard>

        <SectionCard
          title="Coming up"
          hint="Records due more than 30 days from now. The next five, soonest first."
          action={<ViewAllLink href="/records?status=upcoming" />}
          isEmpty={upcoming.length === 0}
          emptyMessage="Nothing scheduled further out. Records with a due date (like a next vaccination) show up here."
        >
          <CareList items={upcoming} today={today} />
        </SectionCard>
      </div>

      <SectionCard
        title="Pets"
        hint="Every pet you're tracking, with their most urgent care status."
        action={
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/pets/new" />}
          >
            <PlusIcon /> Add pet
          </Button>
        }
      >
        <PetList pets={pets} />
      </SectionCard>
    </div>
  );
};

export default DashboardPage;
