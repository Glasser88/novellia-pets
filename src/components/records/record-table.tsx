import Link from "next/link";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { getRecordType, summarizeRecordData } from "@/shared/recordTypes";
import type { RecordDto } from "@/shared/schemas/record";

interface RecordTableProps {
  petId: string;
  records: RecordDto[];
}

export function RecordTable({ petId, records }: RecordTableProps) {
  if (records.length === 0) {
    return <p className="text-muted-foreground text-sm">No records match.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Record</TableHead>
          <TableHead>Due</TableHead>
          <TableHead className="w-0" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => {
          const type = getRecordType(record.type);
          const summary = summarizeRecordData(record.type, record.data);
          return (
            <TableRow key={record.id}>
              <TableCell className="whitespace-nowrap">{formatDate(record.date)}</TableCell>
              <TableCell>
                <Badge variant="outline">{type.label}</Badge>
              </TableCell>
              <TableCell>
                <div className="font-medium">{record.title}</div>
                {summary && <div className="text-muted-foreground text-sm">{summary}</div>}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {record.dueDate ? formatDate(record.dueDate) : "—"}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<Link href={`/pets/${petId}/records/${record.id}/edit`} />}
                  >
                    Edit
                  </Button>
                  <ConfirmDeleteButton
                    size="sm"
                    apiPath={`/api/pets/${petId}/records/${record.id}`}
                    title={`Delete "${record.title}"?`}
                    description="This removes the record permanently."
                  />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
