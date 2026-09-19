import { PetForm } from "@/components/pets/pet-form";

export default function NewPetPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Add a pet</h1>
      <PetForm />
    </div>
  );
}
