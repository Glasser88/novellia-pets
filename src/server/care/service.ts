import { careStatus, type CareStatus } from "@/shared/care";
import type { PetDto } from "@/shared/schemas/pet";
import type { RecordDto } from "@/shared/schemas/record";
import { prisma } from "../db";
import { toPetDto } from "../pets/service";
import { toRecordDto } from "../records/service";

/** A record that implies future care, with the pet it belongs to. */
export interface CareItem {
  record: RecordDto;
  pet: PetDto;
  status: CareStatus;
}

/** A pet with the most urgent status among its care items. */
export interface PetOverview {
  pet: PetDto;
  status: CareStatus | "ok";
  recordCount: number;
}

export interface Dashboard {
  pets: PetOverview[];
  care: CareItem[];
  counts: { pets: number; overdue: number; dueSoon: number };
}

/**
 * Everything with a due date, soonest first. Uses the dueDate index and the
 * value the registry derived on write, so no JSON is unpacked here.
 */
export async function listCare(ownerId: string, today: string): Promise<CareItem[]> {
  const records = await prisma.medicalRecord.findMany({
    where: { pet: { ownerId }, dueDate: { not: null } },
    include: { pet: true },
    orderBy: { dueDate: "asc" },
  });

  return records.map((record) => {
    const dto = toRecordDto(record);
    return { record: dto, pet: toPetDto(record.pet), status: careStatus(dto.dueDate!, today) };
  });
}

const URGENCY: Record<CareStatus | "ok", number> = { overdue: 3, due_soon: 2, upcoming: 1, ok: 0 };

export async function getDashboard(ownerId: string, today: string): Promise<Dashboard> {
  const [pets, care, recordCounts] = await Promise.all([
    prisma.pet.findMany({ where: { ownerId }, orderBy: { name: "asc" } }),
    listCare(ownerId, today),
    prisma.medicalRecord.groupBy({ by: ["petId"], where: { pet: { ownerId } }, _count: true }),
  ]);

  const countByPet = new Map(recordCounts.map((row) => [row.petId, row._count]));

  const overview: PetOverview[] = pets.map((pet) => {
    let status: PetOverview["status"] = "ok";
    for (const item of care) {
      if (item.pet.id === pet.id && URGENCY[item.status] > URGENCY[status]) status = item.status;
    }
    return { pet: toPetDto(pet), status, recordCount: countByPet.get(pet.id) ?? 0 };
  });

  return {
    pets: overview,
    care,
    counts: {
      pets: pets.length,
      overdue: care.filter((item) => item.status === "overdue").length,
      dueSoon: care.filter((item) => item.status === "due_soon").length,
    },
  };
}
