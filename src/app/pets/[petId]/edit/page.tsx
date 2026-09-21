import { notFound } from "next/navigation";
import { FormPage } from "@/components/form-page";
import { PetForm } from "@/components/pets/pet-form";
import { getCurrentUserId } from "@/server/currentUser";
import { findPet } from "@/server/pets/service";

const EditPetPage = async ({ params }: PageProps<"/pets/[petId]/edit">) => {
  const { petId } = await params;
  const ownerId = await getCurrentUserId();

  const pet = await findPet(ownerId, petId);
  if (!pet) notFound();

  return (
    <FormPage
      title={`Edit ${pet.name}`}
      sectionTitle="Details"
      back={{ href: `/pets/${pet.id}`, label: pet.name }}
    >
      <PetForm pet={pet} returnTo={`/pets/${pet.id}`} />
    </FormPage>
  );
};

export default EditPetPage;
