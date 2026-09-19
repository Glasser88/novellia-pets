import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { PetCard } from "@/components/pets/pet-card";
import { SearchForm } from "@/components/search-form";
import { Button } from "@/components/ui/button";
import { getCurrentUserId } from "@/server/currentUser";
import { listPets } from "@/server/pets/service";

export default async function PetsPage({ searchParams }: PageProps<"/pets">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const ownerId = await getCurrentUserId();
  const pets = await listPets(ownerId, { query });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pets</h1>
        <Button nativeButton={false} render={<Link href="/pets/new" />}>
          <PlusIcon /> Add pet
        </Button>
      </div>

      <SearchForm action="/pets" placeholder="Search by name or breed" defaultValue={query} />

      {pets.length === 0 ? (
        <p className="text-muted-foreground">
          {query ? `No pets match "${query}".` : "No pets yet. Add your first one to get started."}
        </p>
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
