import Link from "next/link";
import { notFound } from "next/navigation";
import { PencilIcon, PlusIcon } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { SpeciesIcon } from "@/components/pets/species-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecordTable } from "@/components/records/record-table";
import { RecordFilters } from "@/components/records/record-filters";
import { SectionCard } from "@/components/section-card";
import { formatAge, formatDate, todayIso } from "@/lib/format";
import { getCurrentUserId } from "@/server/currentUser";
import { findPet } from "@/server/pets/service";
import { listRecords } from "@/server/records/service";
import { isRecordTypeKey } from "@/shared/recordTypes";
import { speciesLabels } from "@/shared/schemas/pet";

const PetPage = async ({ params, searchParams }: PageProps<"/pets/[petId]">) => {
  const { petId } = await params;
  const { type, q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const ownerId = await getCurrentUserId();

  // Only filter by a type the registry knows; anything else shows all.
  const typeFilter = typeof type === "string" && isRecordTypeKey(type) ? type : undefined;

  const pet = await findPet(ownerId, petId);
  if (!pet) notFound();
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
        <div className="flex items-center gap-4">
          <SpeciesIcon species={pet.species} size="lg" />
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

      <SectionCard title="Details" hint="What you know about this pet. Edit to change it.">
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
      </SectionCard>

      <RecordFilters action={`/pets/${pet.id}`} type={typeFilter} query={query} />

      <SectionCard
        title="Medical records"
        hint="Everything logged for this pet, newest first. Open a record for the full details."
        count={records.length}
        action={
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/pets/${pet.id}/records/new`} />}
          >
            <PlusIcon /> Add record
          </Button>
        }
        isEmpty={records.length === 0}
        emptyMessage={
          typeFilter || query
            ? "No records match this filter."
            : `No records yet. Add ${pet.name}'s first vaccination, allergy or visit.`
        }
      >
        <RecordTable rows={records.map((record) => ({ record, pet }))} today={todayIso()} />
      </SectionCard>
    </div>
  );
};

export default PetPage;
