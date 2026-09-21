import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { PetTable } from "@/components/pets/pet-table";
import { SearchForm } from "@/components/search-form";
import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import { todayIso } from "@/lib/format";
import { getCurrentUserId } from "@/server/currentUser";
import { listPetOverviews } from "@/server/pets/service";

const PetsPage = async ({ searchParams }: PageProps<"/pets">) => {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const ownerId = await getCurrentUserId();
  const pets = await listPetOverviews(ownerId, todayIso(), { query });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pets</h1>
        <Button nativeButton={false} render={<Link href="/pets/new" />}>
          <PlusIcon /> Add pet
        </Button>
      </div>

      <SearchForm action="/pets" placeholder="Search by name or breed" defaultValue={query} />

      <SectionCard
        title="All pets"
        hint="Every pet you're tracking. Open one to see their records or make changes."
        count={pets.length}
        isEmpty={pets.length === 0}
        emptyMessage={
          query ? `No pets match "${query}".` : "No pets yet. Add your first one to get started."
        }
      >
        <PetTable pets={pets} />
      </SectionCard>
    </div>
  );
};

export default PetsPage;
