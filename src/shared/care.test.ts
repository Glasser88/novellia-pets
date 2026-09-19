import { describe, expect, it } from "vitest";
import type { PetDto } from "@/shared/schemas/pet";
import type { RecordDto } from "@/shared/schemas/record";
import {
  buildDashboard,
  careStatus,
  describeDue,
  mostUrgentStatus,
  type CareItem,
  type CareStatus,
} from "./care";

const today = "2026-09-19";

describe("careStatus", () => {
  it("classifies by distance from today", () => {
    expect(careStatus("2026-09-18", today)).toBe("overdue");
    expect(careStatus("2026-09-19", today)).toBe("due_soon");
    expect(careStatus("2026-10-19", today)).toBe("due_soon"); // exactly 30 days
    expect(careStatus("2026-10-20", today)).toBe("upcoming");
  });
});

describe("describeDue", () => {
  it("reads naturally", () => {
    expect(describeDue("2026-09-16", today)).toBe("3 days overdue");
    expect(describeDue("2026-09-18", today)).toBe("1 day overdue");
    expect(describeDue("2026-09-19", today)).toBe("due today");
    expect(describeDue("2026-09-20", today)).toBe("due in 1 day");
    expect(describeDue("2026-10-01", today)).toBe("due in 12 days");
  });
});

// Minimal fixtures: only the fields the rules read.
function pet(id: string) {
  return { id, name: id } as PetDto;
}
function careItem(petId: string, status: CareStatus): CareItem {
  return { pet: pet(petId), status, record: { id: `${petId}-${status}` } as RecordDto };
}

describe("mostUrgentStatus", () => {
  it("picks the worst status and defaults to ok", () => {
    expect(mostUrgentStatus([])).toBe("ok");
    expect(mostUrgentStatus([careItem("a", "upcoming")])).toBe("upcoming");
    expect(
      mostUrgentStatus([
        careItem("a", "upcoming"),
        careItem("a", "overdue"),
        careItem("a", "due_soon"),
      ]),
    ).toBe("overdue");
  });
});

describe("buildDashboard", () => {
  it("gives each pet its own status, record count and the overall counts", () => {
    const pets = [pet("milo"), pet("luna"), pet("pip")];
    const care = [
      careItem("milo", "overdue"),
      careItem("milo", "due_soon"),
      careItem("luna", "due_soon"),
    ];
    const counts = new Map([
      ["milo", 6],
      ["luna", 3],
    ]);

    const dashboard = buildDashboard(pets, care, counts);

    expect(dashboard.pets.map((p) => [p.pet.id, p.status, p.recordCount])).toEqual([
      ["milo", "overdue", 6],
      ["luna", "due_soon", 3],
      ["pip", "ok", 0],
    ]);
    expect(dashboard.counts).toEqual({ pets: 3, overdue: 1, dueSoon: 2 });
    expect(dashboard.care).toBe(care);
  });
});
