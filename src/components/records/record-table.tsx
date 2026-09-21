import Link from "next/link";
import { CareStatusBadge } from "@/components/care-status-badge";
import { RecordTypeIcon } from "@/components/records/record-type-icon";
import { Badge } from "@/components/ui/badge";
import { LinkTableRow } from "@/components/ui/link-table-row";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { careStatus } from "@/shared/care";
import { getRecordType, summarizeRecordData } from "@/shared/recordTypes";
import type { Pet } from "@/shared/schemas/pet";
import type { MedicalRecord } from "@/shared/schemas/record";

interface RecordTableProps {
  rows: { record: MedicalRecord; pet: Pet }[];
  /** Today's ISO date, for judging how urgent each due date is. */
  today: string;
  /** Show which pet each record belongs to (for lists across pets). */
  showPet?: boolean;
}

export const RecordTable = ({ rows, today, showPet = false }: RecordTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Record</TableHead>
        {showPet && <TableHead>Pet</TableHead>}
        <TableHead>Type</TableHead>
        <TableHead>Date</TableHead>
        <TableHead>Due</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map(({ record, pet }) => {
        const type = getRecordType(record.type);
        const summary = summarizeRecordData(record.type, record.data);
        return (
          <LinkTableRow key={record.id} href={`/pets/${pet.id}/records/${record.id}`}>
            <TableCell>
              <div className="flex items-center gap-3">
                <RecordTypeIcon type={type} />
                <div>
                  <Link
                    href={`/pets/${pet.id}/records/${record.id}`}
                    className="font-medium hover:underline"
                  >
                    {record.title}
                  </Link>
                  {summary && <div className="text-muted-foreground text-sm">{summary}</div>}
                </div>
              </div>
            </TableCell>
            {showPet && (
              <TableCell>
                <Link href={`/pets/${pet.id}`} className="font-medium hover:underline">
                  {pet.name}
                </Link>
              </TableCell>
            )}
            <TableCell>
              <Badge variant="outline">{type.label}</Badge>
            </TableCell>
            <TableCell className="whitespace-nowrap">{formatDate(record.date)}</TableCell>
            <TableCell className="whitespace-nowrap">
              {record.dueDate ? formatDate(record.dueDate) : "—"}
            </TableCell>
            <TableCell>
              <CareStatusBadge
                status={record.dueDate ? careStatus(record.dueDate, today) : "none"}
              />
            </TableCell>
          </LinkTableRow>
        );
      })}
    </TableBody>
  </Table>
);
