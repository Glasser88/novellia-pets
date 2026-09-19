import type { Pet } from "@/generated/prisma/client";
import type { PetDto, PetInput, PetUpdate } from "@/shared/schemas/pet";
import { fromIsoDate, toIsoDate } from "../dates";
import { prisma } from "../db";
import { NotFoundError } from "../errors";

export function toPetDto(pet: Pet): PetDto {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    dateOfBirth: toIsoDate(pet.dateOfBirth),
    weightKg: pet.weightKg,
    notes: pet.notes,
    createdAt: pet.createdAt.toISOString(),
    updatedAt: pet.updatedAt.toISOString(),
  };
}

export async function listPets(ownerId: string): Promise<PetDto[]> {
  const pets = await prisma.pet.findMany({ where: { ownerId }, orderBy: { name: "asc" } });
  return pets.map(toPetDto);
}

/** Every lookup is scoped by owner so one user can never read another's pet. */
export async function getPet(ownerId: string, petId: string): Promise<PetDto> {
  const pet = await prisma.pet.findFirst({ where: { id: petId, ownerId } });
  if (!pet) throw new NotFoundError("Pet", petId);
  return toPetDto(pet);
}

export async function createPet(ownerId: string, input: PetInput): Promise<PetDto> {
  const pet = await prisma.pet.create({
    data: { ...input, ownerId, dateOfBirth: fromIsoDate(input.dateOfBirth) },
  });
  return toPetDto(pet);
}

export async function updatePet(ownerId: string, petId: string, input: PetUpdate): Promise<PetDto> {
  await getPet(ownerId, petId); // 404 before touching anything
  const { dateOfBirth, ...rest } = input;
  const pet = await prisma.pet.update({
    where: { id: petId },
    data: { ...rest, ...(dateOfBirth !== undefined && { dateOfBirth: fromIsoDate(dateOfBirth) }) },
  });
  return toPetDto(pet);
}

export async function deletePet(ownerId: string, petId: string): Promise<void> {
  await getPet(ownerId, petId);
  await prisma.pet.delete({ where: { id: petId } }); // records cascade in the DB
}
