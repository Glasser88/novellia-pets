import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { CareList } from "@/components/dashboard/care-list";
import { CareStatusBadge } from "@/components/dashboard/care-status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { plural, todayIso } from "@/lib/format";
import { getDashboard } from "@/server/dashboard/service";
import { getCurrentUserId } from "@/server/currentUser";
import { speciesLabels } from "@/shared/schemas/pet";

export default async function DashboardPage() {
  const ownerId = await getCurrentUserId();
  const today = todayIso();
  const { pets, care, counts } = await getDashboard(ownerId, today);

  // The list is sorted by due date; overdue and due-soon items come first
  // naturally. Show the "upcoming" tail only up to a sensible limit.
  const attention = care.filter((item) => item.status !== "upcoming");
  const upcoming = care.filter((item) => item.status === "upcoming").slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button nativeButton={false} render={<Link href="/pets/new" />}>
          <PlusIcon /> Add pet
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pets" value={counts.pets} />
        <StatCard label="Overdue" value={counts.overdue} tone="danger" />
        <StatCard label="Due in the next 30 days" value={counts.dueSoon} tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
          </CardHeader>
          <CardContent>
            <CareList items={attention} today={today} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coming up</CardTitle>
          </CardHeader>
          <CardContent>
            <CareList items={upcoming} today={today} />
          </CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Pets</h2>
        {pets.length === 0 ? (
          <p className="text-muted-foreground text-sm">No pets yet.</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {pets.map(({ pet, status, recordCount }) => (
              <li key={pet.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Link href={`/pets/${pet.id}`} className="font-medium hover:underline">
                    {pet.name}
                  </Link>
                  <Badge variant="secondary">{speciesLabels[pet.species]}</Badge>
                  <span className="text-muted-foreground text-sm">
                    {plural(recordCount, "record")}
                  </span>
                </div>
                <CareStatusBadge status={status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
