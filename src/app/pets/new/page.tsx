import { FormPage } from "@/components/form-page";
import { PetForm } from "@/components/pets/pet-form";

const NewPetPage = () => (
  <FormPage
    title="Add a pet"
    back={{ href: "/pets", label: "Pets" }}
    sectionTitle="Details"
    description="Only a name and species are required."
  >
    <PetForm returnTo="/pets" />
  </FormPage>
);

export default NewPetPage;
