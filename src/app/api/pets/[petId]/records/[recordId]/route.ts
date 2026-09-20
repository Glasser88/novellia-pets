import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/server/currentUser";
import { parseBody, withErrorHandling } from "@/server/http";
import { deleteRecord, getRecord, updateRecord } from "@/server/records/service";
import { recordUpdateSchema } from "@/shared/schemas/record";

type Ctx = RouteContext<"/api/pets/[petId]/records/[recordId]">;

export const GET = withErrorHandling<Ctx>(async (_req, { params }) => {
  const { petId, recordId } = await params;
  const ownerId = await getCurrentUserId();

  return NextResponse.json(await getRecord(ownerId, petId, recordId));
});

export const PATCH = withErrorHandling<Ctx>(async (req, { params }) => {
  const { petId, recordId } = await params;
  const ownerId = await getCurrentUserId();
  const input = await parseBody(req, recordUpdateSchema);

  return NextResponse.json(await updateRecord(ownerId, petId, recordId, input));
});

export const DELETE = withErrorHandling<Ctx>(async (_req, { params }) => {
  const { petId, recordId } = await params;
  const ownerId = await getCurrentUserId();

  await deleteRecord(ownerId, petId, recordId);

  return new NextResponse(null, { status: 204 });
});
