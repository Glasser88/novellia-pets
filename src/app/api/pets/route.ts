import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/server/currentUser";
import { parseBody, route } from "@/server/http";
import { createPet, listPets } from "@/server/pets/service";
import { petInputSchema } from "@/shared/schemas/pet";

export const GET = route(async () => {
  const ownerId = await getCurrentUserId();
  return NextResponse.json(await listPets(ownerId));
});

export const POST = route(async (req) => {
  const ownerId = await getCurrentUserId();
  const input = await parseBody(req, petInputSchema);
  const pet = await createPet(ownerId, input);
  return NextResponse.json(pet, { status: 201 });
});
