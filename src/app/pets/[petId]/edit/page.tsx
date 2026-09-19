import { notFound } from "next/navigation";
import { PetForm } from "@/components/pets/pet-form";
import { getCurrentUserId } from "@/server/currentUser";
import { NotFoundError } from "@/server/errors";
import { getPet } from "@/server/pets/service";

export default async function EditPetPage({ params }: PageProps<"/pets/[petId]/edit">) {
  const { petId } = await params;
  const ownerId = await getCurrentUserId();

  const pet = await getPet(ownerId, petId).catch((error) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit {pet.name}</h1>
      <PetForm pet={pet} />
    </div>
  );
}
