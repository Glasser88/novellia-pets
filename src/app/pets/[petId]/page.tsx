import Link from "next/link";
import { notFound } from "next/navigation";
import { PencilIcon } from "lucide-react";
import { DeletePetButton } from "@/components/pets/delete-pet-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatAge, formatDate } from "@/lib/format";
import { getCurrentUserId } from "@/server/currentUser";
import { NotFoundError } from "@/server/errors";
import { getPet } from "@/server/pets/service";
import { speciesLabels } from "@/shared/schemas/pet";

export default async function PetPage({ params }: PageProps<"/pets/[petId]">) {
  const { petId } = await params;
  const ownerId = await getCurrentUserId();

  const pet = await getPet(ownerId, petId).catch((error) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });

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
          <DeletePetButton petId={pet.id} petName={pet.name} />
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

      {/* Medical records section comes next. */}
    </div>
  );
}
