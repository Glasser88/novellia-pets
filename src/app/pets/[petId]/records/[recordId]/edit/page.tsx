import { notFound } from "next/navigation";
import { FormPage } from "@/components/form-page";
import { RecordForm } from "@/components/records/record-form";
import { getCurrentUserId } from "@/server/currentUser";
import { findRecord } from "@/server/records/service";

const EditRecordPage = async ({ params }: PageProps<"/pets/[petId]/records/[recordId]/edit">) => {
  const { petId, recordId } = await params;
  const ownerId = await getCurrentUserId();

  const record = await findRecord(ownerId, petId, recordId);
  if (!record) notFound();

  const recordPath = `/pets/${petId}/records/${recordId}`;

  return (
    <FormPage
      title="Edit record"
      sectionTitle="Record"
      back={{ href: recordPath, label: record.title }}
    >
      <RecordForm petId={petId} record={record} returnTo={recordPath} />
    </FormPage>
  );
};

export default EditRecordPage;
