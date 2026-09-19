import { notFound } from "next/navigation";
import { RecordForm } from "@/components/records/record-form";
import { getCurrentUserId } from "@/server/currentUser";
import { NotFoundError } from "@/server/errors";
import { getPet } from "@/server/pets/service";

export default async function NewRecordPage({ params }: PageProps<"/pets/[petId]/records/new">) {
  const { petId } = await params;
  const ownerId = await getCurrentUserId();

  const pet = await getPet(ownerId, petId).catch((error) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Add a record for {pet.name}</h1>
      <RecordForm petId={pet.id} />
    </div>
  );
}
