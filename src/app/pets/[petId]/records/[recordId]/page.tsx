import Link from "next/link";
import { notFound } from "next/navigation";
import { PencilIcon } from "lucide-react";
import { CareStatusBadge } from "@/components/care-status-badge";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { formatFieldValue } from "@/components/records/record-field-value";
import { RecordTypeIcon } from "@/components/records/record-type-icon";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, todayIso } from "@/lib/format";
import { getCurrentUserId } from "@/server/currentUser";
import { findPet } from "@/server/pets/service";
import { findRecord } from "@/server/records/service";
import { careStatus, describeDue } from "@/shared/care";
import { getRecordType } from "@/shared/recordTypes";

const RecordPage = async ({ params }: PageProps<"/pets/[petId]/records/[recordId]">) => {
  const { petId, recordId } = await params;
  const ownerId = await getCurrentUserId();
  const today = todayIso();

  const [pet, record] = await Promise.all([
    findPet(ownerId, petId),
    findRecord(ownerId, petId, recordId),
  ]);
  if (!pet || !record) notFound();

  const type = getRecordType(record.type);
  const petPath = `/pets/${pet.id}`;

  // The shared fields first, then the type's own fields in the order the
  // registry lists them (the same order as the form).
  const facts: [string, string | null][] = [
    ["Date", formatDate(record.date)],
    [
      "Due",
      record.dueDate
        ? `${formatDate(record.dueDate)} (${describeDue(record.dueDate, today)})`
        : null,
    ],
    ...type.fields.map((field): [string, string | null] => [
      field.label,
      formatFieldValue(field, record.data[field.name]),
    ]),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <RecordTypeIcon type={type} size="lg" />
          <div className="flex flex-col gap-1">
            <Link
              href={petPath}
              className="text-muted-foreground hover:text-foreground w-fit text-sm hover:underline"
            >
              {pet.name}
            </Link>
            <h1 className="flex flex-wrap items-center gap-3 text-2xl font-semibold">
              {record.title}
              <Badge variant="outline">{type.label}</Badge>
              <CareStatusBadge
                status={record.dueDate ? careStatus(record.dueDate, today) : "none"}
              />
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`${petPath}/records/${record.id}/edit`} />}
          >
            <PencilIcon /> Edit
          </Button>
          <ConfirmDeleteButton
            apiPath={`/api/pets/${pet.id}/records/${record.id}`}
            redirectTo={petPath}
            title={`Delete "${record.title}"?`}
            description="This removes the record permanently."
          />
        </div>
      </div>

      <SectionCard title="Details" hint={type.description}>
        <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          {facts.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 sm:justify-start">
              <dt className="text-muted-foreground w-32 shrink-0">{label}</dt>
              <dd>{value ?? "—"}</dd>
            </div>
          ))}
          {record.notes && (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Notes</dt>
              <dd className="whitespace-pre-wrap">{record.notes}</dd>
            </div>
          )}
        </dl>
      </SectionCard>
    </div>
  );
};

export default RecordPage;
