import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/server/currentUser";
import { parseBody, route } from "@/server/http";
import { createRecord, listRecords } from "@/server/records/service";
import { recordInputSchema } from "@/shared/schemas/record";

type Ctx = RouteContext<"/api/pets/[petId]/records">;

export const GET = route<Ctx>(async (req, { params }) => {
  const { petId } = await params;
  const ownerId = await getCurrentUserId();
  const type = new URL(req.url).searchParams.get("type") ?? undefined;
  return NextResponse.json(await listRecords(ownerId, petId, { type }));
});

export const POST = route<Ctx>(async (req, { params }) => {
  const { petId } = await params;
  const ownerId = await getCurrentUserId();
  const input = await parseBody(req, recordInputSchema);
  const record = await createRecord(ownerId, petId, input);
  return NextResponse.json(record, { status: 201 });
});
