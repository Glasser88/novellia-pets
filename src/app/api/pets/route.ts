import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/server/currentUser";
import { parseBody, withErrorHandling } from "@/server/http";
import { createPet, listPets } from "@/server/pets/service";
import { petInputSchema } from "@/shared/schemas/pet";

export const GET = withErrorHandling(async () => {
  const ownerId = await getCurrentUserId();
  return NextResponse.json(await listPets(ownerId));
});

export const POST = withErrorHandling(async (req) => {
  const ownerId = await getCurrentUserId();
  const input = await parseBody(req, petInputSchema);
  const pet = await createPet(ownerId, input);
  return NextResponse.json(pet, { status: 201 });
});
