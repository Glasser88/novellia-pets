import Link from "next/link";
import { notFound } from "next/navigation";
import { PencilIcon, PlusIcon } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecordTable } from "@/components/records/record-table";
import { RecordTypeFilter } from "@/components/records/record-type-filter";
import { SearchForm } from "@/components/search-form";
import { Card, CardContent } from "@/components/ui/card";
import { formatAge, formatDate } from "@/lib/format";
import { getCurrentUserId } from "@/server/currentUser";
import { NotFoundError } from "@/server/errors";
import { getPet } from "@/server/pets/service";
import { listRecords } from "@/server/records/service";
import { recordTypes } from "@/shared/recordTypes";
import { speciesLabels } from "@/shared/schemas/pet";

export default async function PetPage({ params, searchParams }: PageProps<"/pets/[petId]">) {
  const { petId } = await params;
  const { type, q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const ownerId = await getCurrentUserId();

  // Only filter by a type the registry knows; anything else shows all.
  const typeFilter = typeof type === "string" && recordTypes.has(type) ? type : undefined;

  const pet = await getPet(ownerId, petId).catch((error) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });
  const records = await listRecords(ownerId, petId, { type: typeFilter, query });

  const facts: [string, string | null][] = [
    ["Species", speciesLabels[pet.species]],
    ["Breed", pet.breed],
    [
      "Age",
      pet.dateOfBirth && `${formatAge(pet.dateOfBirth)} (born ${formatDate(pet.dateOfBirth)})`,
    ],
    ["Weight", pet.weightKg !== null ? `${pet.weightKg} kg` : null],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold">
            {pet.name}
            <Badge variant="secondary">{speciesLabels[pet.species]}</Badge>
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/pets/${pet.id}/edit`} />}
          >
            <PencilIcon /> Edit
          </Button>
          <ConfirmDeleteButton
            apiPath={`/api/pets/${pet.id}`}
            redirectTo="/pets"
            title={`Delete ${pet.name}?`}
            description={`This removes ${pet.name} and all of their medical records. This cannot be undone.`}
          />
        </div>
      </div>

      <Card>
        <CardContent>
          <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {facts.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 sm:justify-start">
                <dt className="text-muted-foreground w-24 shrink-0">{label}</dt>
                <dd>{value ?? "—"}</dd>
              </div>
            ))}
            {pet.notes && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Notes</dt>
                <dd className="whitespace-pre-wrap">{pet.notes}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Medical records</h2>
          <Button nativeButton={false} render={<Link href={`/pets/${pet.id}/records/new`} />}>
            <PlusIcon /> Add record
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <RecordTypeFilter basePath={`/pets/${pet.id}`} selected={typeFilter} query={query} />
          <SearchForm
            action={`/pets/${pet.id}`}
            placeholder="Search records"
            defaultValue={query}
            hidden={{ type: typeFilter }}
          />
        </div>
        <RecordTable petId={pet.id} records={records} />
      </section>
    </div>
  );
}
