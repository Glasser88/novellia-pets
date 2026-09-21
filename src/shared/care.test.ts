import { describe, expect, it } from "vitest";
import { careStatus, describeDue, dueSoonCutoff, petStatus } from "./care";

const today = "2026-09-19";

describe("careStatus", () => {
  it("classifies by distance from today", () => {
    expect(careStatus("2026-09-18", today)).toBe("overdue");
    expect(careStatus("2026-09-19", today)).toBe("due_soon");
    expect(careStatus("2026-10-19", today)).toBe("due_soon"); // exactly 30 days
    expect(careStatus("2026-10-20", today)).toBe("upcoming");
  });
});

describe("dueSoonCutoff", () => {
  it("is the last day that still counts as due soon", () => {
    const cutoff = dueSoonCutoff(today);
    expect(cutoff).toBe("2026-10-19");
    expect(careStatus(cutoff, today)).toBe("due_soon");
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

describe("petStatus", () => {
  it("judges a pet by its earliest due date and defaults to ok", () => {
    expect(petStatus(null, today)).toBe("ok");
    expect(petStatus("2026-09-18", today)).toBe("overdue");
    expect(petStatus("2026-10-01", today)).toBe("due_soon");
    expect(petStatus("2027-01-01", today)).toBe("upcoming");
  });
});
