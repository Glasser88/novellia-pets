import { CareStatusBadge } from "@/components/care-status-badge";
import { ListRow } from "@/components/list-row";
import { RecordTypeIcon } from "@/components/records/record-type-icon";
import { formatDate } from "@/lib/format";
import type { CareItem } from "@/shared/care";
import { describeDue } from "@/shared/care";
import { getRecordType } from "@/shared/recordTypes";

interface CareListProps {
  items: CareItem[];
  today: string;
}

export const CareList = ({ items, today }: CareListProps) => (
  <ul className="divide-y">
    {items.map(({ record, pet, dueDate, status }) => (
      <ListRow
        key={record.id}
        href={`/pets/${pet.id}/records/${record.id}`}
        leading={<RecordTypeIcon type={getRecordType(record.type)} />}
        title={
          <span className="truncate">
            {pet.name}
            <span className="text-muted-foreground"> · </span>
            {record.title}
          </span>
        }
        detail={`${getRecordType(record.type).label} · ${formatDate(dueDate)} · ${describeDue(dueDate, today)}`}
        aside={<CareStatusBadge status={status} />}
      />
    ))}
  </ul>
);
