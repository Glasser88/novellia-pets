import Link from "next/link";
import { CareStatusBadge } from "@/components/dashboard/care-status-badge";
import { formatDate } from "@/lib/format";
import type { CareItem } from "@/shared/care";
import { describeDue } from "@/shared/care";
import { getRecordType } from "@/shared/recordTypes";

interface CareListProps {
  items: CareItem[];
  today: string;
}

export function CareList({ items, today }: CareListProps) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Nothing is due. Records with a due date (like a next vaccination) show up here.
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {items.map(({ record, pet, status }) => (
        <li key={record.id} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <div className="truncate font-medium">
              <Link href={`/pets/${pet.id}`} className="hover:underline">
                {pet.name}
              </Link>
              <span className="text-muted-foreground"> · </span>
              {record.title}
            </div>
            <div className="text-muted-foreground text-sm">
              {getRecordType(record.type).label} · {formatDate(record.dueDate!)} ·{" "}
              {describeDue(record.dueDate!, today)}
            </div>
          </div>
          <CareStatusBadge status={status} />
        </li>
      ))}
    </ul>
  );
}
