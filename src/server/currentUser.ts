import { prisma } from "./db";

/**
 * Auth seam. There is no login in the MVP, so every request acts as one demo
 * user. When auth is added, this becomes "read the session and return its
 * user id" and nothing else in the server layer changes: every service
 * already takes an ownerId.
 */
const DEMO_USER = { email: "demo@novellia.pets", name: "Demo Owner" };

export async function getCurrentUserId(): Promise<string> {
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: {},
    create: DEMO_USER,
    select: { id: true },
  });

  return user.id;
}
