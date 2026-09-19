import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { PetCard } from "@/components/pets/pet-card";
import { Button } from "@/components/ui/button";
import { getCurrentUserId } from "@/server/currentUser";
import { listPets } from "@/server/pets/service";

export default async function PetsPage() {
  const ownerId = await getCurrentUserId();
  const pets = await listPets(ownerId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pets</h1>
        <Button render={<Link href="/pets/new" />}>
          <PlusIcon /> Add pet
        </Button>
      </div>

      {pets.length === 0 ? (
        <p className="text-muted-foreground">No pets yet. Add your first one to get started.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  );
}
