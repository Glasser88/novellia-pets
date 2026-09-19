import type { Pet, Prisma } from "@/generated/prisma/client";
import type { PetDto, PetInput, PetUpdate } from "@/shared/schemas/pet";
import { fromIsoDateOrNull, toIsoDateOrNull } from "../dates";
import { prisma } from "../db";
import { NotFoundError } from "../errors";

export function toPetDto(pet: Pet): PetDto {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    dateOfBirth: toIsoDateOrNull(pet.dateOfBirth),
    weightKg: pet.weightKg,
    notes: pet.notes,
    createdAt: pet.createdAt.toISOString(),
    updatedAt: pet.updatedAt.toISOString(),
  };
}

export interface ListPetsOptions {
  /** Case-insensitive match against name or breed. */
  query?: string;
}

export async function listPets(ownerId: string, options: ListPetsOptions = {}): Promise<PetDto[]> {
  const where: Prisma.PetWhereInput = { ownerId };
  if (options.query) {
    where.OR = [
      { name: { contains: options.query, mode: "insensitive" } },
      { breed: { contains: options.query, mode: "insensitive" } },
    ];
  }

  const pets = await prisma.pet.findMany({ where, orderBy: { name: "asc" } });
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
    data: {
      ownerId,
      name: input.name,
      species: input.species,
      breed: input.breed,
      dateOfBirth: fromIsoDateOrNull(input.dateOfBirth),
      weightKg: input.weightKg,
      notes: input.notes,
    },
  });
  return toPetDto(pet);
}

export async function updatePet(ownerId: string, petId: string, input: PetUpdate): Promise<PetDto> {
  await getPet(ownerId, petId); // 404 before touching anything

  // Only fields present in the input are changed; absent fields are left alone.
  const changes: Prisma.PetUpdateInput = {};
  if (input.name !== undefined) changes.name = input.name;
  if (input.species !== undefined) changes.species = input.species;
  if (input.breed !== undefined) changes.breed = input.breed;
  if (input.dateOfBirth !== undefined) changes.dateOfBirth = fromIsoDateOrNull(input.dateOfBirth);
  if (input.weightKg !== undefined) changes.weightKg = input.weightKg;
  if (input.notes !== undefined) changes.notes = input.notes;

  const pet = await prisma.pet.update({ where: { id: petId }, data: changes });
  return toPetDto(pet);
}

export async function deletePet(ownerId: string, petId: string): Promise<void> {
  await getPet(ownerId, petId);
  await prisma.pet.delete({ where: { id: petId } }); // records cascade in the DB
}
