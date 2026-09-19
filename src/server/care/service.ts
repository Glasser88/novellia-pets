import { buildDashboard, careStatus, type CareItem, type Dashboard } from "@/shared/care";
import { prisma } from "../db";
import { toPetDto } from "../pets/service";
import { toRecordDto } from "../records/service";

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

/** Fetch the three inputs in parallel, then apply the pure dashboard rules. */
export async function getDashboard(ownerId: string, today: string): Promise<Dashboard> {
  const [pets, care, recordCounts] = await Promise.all([
    prisma.pet.findMany({ where: { ownerId }, orderBy: { name: "asc" } }),
    listCare(ownerId, today),
    prisma.medicalRecord.groupBy({ by: ["petId"], where: { pet: { ownerId } }, _count: true }),
  ]);

  const recordCountByPet = new Map(recordCounts.map((row) => [row.petId, row._count]));
  return buildDashboard(pets.map(toPetDto), care, recordCountByPet);
}
