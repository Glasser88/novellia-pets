import type { CurrentUser } from "@/shared/user";
import { prisma } from "./db";

/**
 * Auth seam. There is no login in the MVP, so every request acts as one demo
 * user. When auth is added, `getCurrentUser` becomes "read the session and
 * return its user" and nothing else changes: every service already takes an
 * ownerId, and the header already renders whatever user this returns.
 * See "Authentication" in DECISIONS.md for the plan.
 */

const DEMO_USER = { email: "demo@novellia.pets", name: "Demo Owner" };

export const getCurrentUser = async (): Promise<CurrentUser> =>
  prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: {},
    create: DEMO_USER,
    select: { id: true, name: true, email: true },
  });

export const getCurrentUserId = async (): Promise<string> => (await getCurrentUser()).id;
