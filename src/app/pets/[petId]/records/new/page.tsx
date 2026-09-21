import { notFound } from "next/navigation";
import { FormPage } from "@/components/form-page";
import { RecordForm } from "@/components/records/record-form";
import { getCurrentUserId } from "@/server/currentUser";
import { findPet } from "@/server/pets/service";

const NewRecordPage = async ({ params }: PageProps<"/pets/[petId]/records/new">) => {
  const { petId } = await params;
  const ownerId = await getCurrentUserId();

  const pet = await findPet(ownerId, petId);
  if (!pet) notFound();

  return (
    <FormPage
      title={`Add a record for ${pet.name}`}
      back={{ href: `/pets/${pet.id}`, label: pet.name }}
      sectionTitle="Record"
      description="Pick a type first; the fields below change to match."
    >
      <RecordForm petId={pet.id} returnTo={`/pets/${pet.id}`} />
    </FormPage>
  );
};

export default NewRecordPage;
