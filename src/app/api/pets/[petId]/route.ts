import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/server/currentUser";
import { parseBody, route } from "@/server/http";
import { deletePet, getPet, updatePet } from "@/server/pets/service";
import { petUpdateSchema } from "@/shared/schemas/pet";

type Ctx = RouteContext<"/api/pets/[petId]">;

export const GET = route<Ctx>(async (_req, { params }) => {
  const { petId } = await params;
  const ownerId = await getCurrentUserId();
  return NextResponse.json(await getPet(ownerId, petId));
});

export const PATCH = route<Ctx>(async (req, { params }) => {
  const { petId } = await params;
  const ownerId = await getCurrentUserId();
  const input = await parseBody(req, petUpdateSchema);
  return NextResponse.json(await updatePet(ownerId, petId, input));
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const { petId } = await params;
  const ownerId = await getCurrentUserId();
  await deletePet(ownerId, petId);
  return new NextResponse(null, { status: 204 });
});
