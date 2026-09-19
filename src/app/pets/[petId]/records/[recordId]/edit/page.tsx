import { notFound } from "next/navigation";
import { RecordForm } from "@/components/records/record-form";
import { getCurrentUserId } from "@/server/currentUser";
import { NotFoundError } from "@/server/errors";
import { getRecord } from "@/server/records/service";

export default async function EditRecordPage({
  params,
}: PageProps<"/pets/[petId]/records/[recordId]/edit">) {
  const { petId, recordId } = await params;
  const ownerId = await getCurrentUserId();

  const record = await getRecord(ownerId, petId, recordId).catch((error) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit record</h1>
      <RecordForm petId={petId} record={record} />
    </div>
  );
}
