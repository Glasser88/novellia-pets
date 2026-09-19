/**
 * Demo data. Runs through the same service functions as the API, so every
 * record is validated by the record-type registry and gets its dueDate the
 * same way user-entered data does.
 *
 * Dates are relative to today so the dashboard always has something overdue,
 * something due soon and something further out. Re-running replaces the demo
 * user's data.
 */
import "dotenv/config";
import { prisma } from "@/server/db";
import { createPet } from "@/server/pets/service";
import { createRecord } from "@/server/records/service";
import { getCurrentUserId } from "@/server/currentUser";
import type { RecordInput } from "@/shared/schemas/record";

function daysFromToday(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

type SeedRecord = Omit<RecordInput, "data"> & { data?: Record<string, unknown> };

async function main() {
  const ownerId = await getCurrentUserId();

  // Start clean: records cascade from pets.
  await prisma.pet.deleteMany({ where: { ownerId } });

  const milo = await createPet(ownerId, {
    name: "Milo",
    species: "DOG",
    breed: "Beagle",
    dateOfBirth: "2021-06-15",
    weightKg: 12.4,
    notes: "Loves peanut butter. Nervous at the vet; bring treats.",
  });

  const luna = await createPet(ownerId, {
    name: "Luna",
    species: "CAT",
    breed: "Domestic shorthair",
    dateOfBirth: "2019-02-03",
    weightKg: 4.1,
  });

  const pip = await createPet(ownerId, {
    name: "Pip",
    species: "RABBIT",
    breed: "Holland Lop",
    dateOfBirth: daysFromToday(-200),
    weightKg: 1.6,
  });

  const records: [string, SeedRecord][] = [
    // Milo: one overdue vaccination, a follow-up due soon, some history.
    [
      milo.id,
      {
        type: "vaccination",
        title: "Rabies",
        date: daysFromToday(-380),
        data: { vaccine: "Rabies", manufacturer: "Zoetis", nextDueDate: daysFromToday(-15) },
      },
    ],
    [
      milo.id,
      {
        type: "vaccination",
        title: "DHPP booster",
        date: daysFromToday(-100),
        data: { vaccine: "DHPP", nextDueDate: daysFromToday(265) },
      },
    ],
    [
      milo.id,
      {
        type: "vet_visit",
        title: "Annual checkup",
        date: daysFromToday(-30),
        notes: "Mild tartar. Recommended dental cleaning.",
        data: {
          clinic: "Riverside Animal Hospital",
          veterinarian: "Dr. Patel",
          reason: "Annual exam",
          diagnosis: "Healthy. Mild dental tartar.",
          followUpDate: daysFromToday(12),
        },
      },
    ],
    [
      milo.id,
      {
        type: "allergy",
        title: "Chicken allergy",
        date: daysFromToday(-400),
        data: { allergen: "Chicken", reaction: "Itchy skin, ear infections", severity: "moderate" },
      },
    ],
    [
      milo.id,
      {
        type: "weight_check",
        title: "Weigh-in",
        date: daysFromToday(-180),
        data: { weightKg: 11.8 },
      },
    ],
    [
      milo.id,
      {
        type: "weight_check",
        title: "Weigh-in",
        date: daysFromToday(-30),
        data: { weightKg: 12.4 },
      },
    ],

    // Luna: on a medication with a refill due soon; vaccination up to date.
    [
      luna.id,
      {
        type: "medication",
        title: "Thyroid medication",
        date: daysFromToday(-60),
        data: {
          name: "Methimazole",
          dosage: "2.5 mg",
          frequency: "twice_daily",
          refillDueDate: daysFromToday(6),
        },
      },
    ],
    [
      luna.id,
      {
        type: "vaccination",
        title: "FVRCP",
        date: daysFromToday(-200),
        data: { vaccine: "FVRCP", nextDueDate: daysFromToday(530) },
      },
    ],
    [
      luna.id,
      {
        type: "vet_visit",
        title: "Bloodwork recheck",
        date: daysFromToday(-60),
        data: {
          clinic: "Riverside Animal Hospital",
          reason: "Hyperthyroidism monitoring",
          diagnosis: "T4 improving on current dose.",
        },
      },
    ],

    // Pip: young, nothing due yet.
    [
      pip.id,
      {
        type: "vet_visit",
        title: "First checkup",
        date: daysFromToday(-150),
        data: { clinic: "Exotic Pet Clinic", reason: "New pet exam", diagnosis: "Healthy." },
      },
    ],
    [
      pip.id,
      {
        type: "weight_check",
        title: "Weigh-in",
        date: daysFromToday(-150),
        data: { weightKg: 0.9 },
      },
    ],
    [
      pip.id,
      {
        type: "weight_check",
        title: "Weigh-in",
        date: daysFromToday(-10),
        data: { weightKg: 1.6 },
      },
    ],
  ];

  for (const [petId, record] of records) {
    await createRecord(ownerId, petId, { ...record, data: record.data ?? {} });
  }

  console.log(`Seeded 3 pets and ${records.length} records for the demo owner.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
