import type { Pet as PetRow, Prisma } from "@/generated/prisma/client";
import { petStatus, type PetAggregate, type PetOverview } from "@/shared/care";
import type { Pet, PetInput, PetUpdate } from "@/shared/schemas/pet";
import { fromIsoDateOrNull, toIsoDateOrNull } from "../dates";
import { prisma } from "../db";
import { NotFoundError } from "../errors";

export const petFromRow = (pet: PetRow): Pet => ({
  id: pet.id,
  name: pet.name,
  species: pet.species,
  breed: pet.breed,
  dateOfBirth: toIsoDateOrNull(pet.dateOfBirth),
  weightKg: pet.weightKg,
  notes: pet.notes,
  createdAt: pet.createdAt.toISOString(),
  updatedAt: pet.updatedAt.toISOString(),
});

export interface ListPetsOptions {
  /** Case-insensitive match against name or breed. */
  query?: string;
}

export const listPets = async (ownerId: string, options: ListPetsOptions = {}): Promise<Pet[]> => {
  const where: Prisma.PetWhereInput = { ownerId };
  if (options.query) {
    where.OR = [
      { name: { contains: options.query, mode: "insensitive" } },
      { breed: { contains: options.query, mode: "insensitive" } },
    ];
  }

  const pets = await prisma.pet.findMany({ where, orderBy: { name: "asc" } });
  return pets.map(petFromRow);
};

type AggregatesByPet = Partial<Record<string, PetAggregate>>;

/**
 * Record count and soonest due date per pet, in one grouped query. That is
 * all a pet list needs for its status badge.
 *
 * Keyed by pet id so each pet can look up its own row directly. Partial,
 * because a pet with no records has no row.
 */
const aggregateRecordsByPet = async (ownerId: string): Promise<AggregatesByPet> => {
  const rows = await prisma.medicalRecord.groupBy({
    by: ["petId"],
    where: { pet: { ownerId } },
    _count: true,
    _min: { dueDate: true },
  });

  const byPet: AggregatesByPet = {};
  for (const row of rows) {
    byPet[row.petId] = {
      recordCount: row._count,
      earliestDueDate: toIsoDateOrNull(row._min.dueDate),
    };
  }
  return byPet;
};

/** Like listPets, but each pet comes with its care status and record count. */
export const listPetOverviews = async (
  ownerId: string,
  today: string,
  options: ListPetsOptions = {},
): Promise<PetOverview[]> => {
  const [pets, aggregatesByPet] = await Promise.all([
    listPets(ownerId, options),
    aggregateRecordsByPet(ownerId),
  ]);

  return pets.map((pet) => {
    const aggregate = aggregatesByPet[pet.id];
    return {
      pet,
      status: petStatus(aggregate?.earliestDueDate ?? null, today),
      recordCount: aggregate?.recordCount ?? 0,
    };
  });
};

/**
 * Every lookup is scoped by owner so one user can never read another's pet.
 * Returns null when there is no such pet; pages use this and show a 404.
 */
export const findPet = async (ownerId: string, petId: string): Promise<Pet | null> => {
  const pet = await prisma.pet.findFirst({ where: { id: petId, ownerId } });
  return pet ? petFromRow(pet) : null;
};

/** Like findPet, but throws NotFoundError; for API routes and other services. */
export const getPet = async (ownerId: string, petId: string): Promise<Pet> => {
  const pet = await findPet(ownerId, petId);
  if (!pet) throw new NotFoundError("Pet", petId);
  return pet;
};

export const createPet = async (ownerId: string, input: PetInput): Promise<Pet> => {
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
  return petFromRow(pet);
};

export const updatePet = async (ownerId: string, petId: string, input: PetUpdate): Promise<Pet> => {
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
  return petFromRow(pet);
};

export const deletePet = async (ownerId: string, petId: string): Promise<void> => {
  await getPet(ownerId, petId);
  await prisma.pet.delete({ where: { id: petId } }); // records cascade in the DB
};
