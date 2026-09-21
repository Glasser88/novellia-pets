import Link from "next/link";
import { CareStatusBadge } from "@/components/care-status-badge";
import { Badge } from "@/components/ui/badge";
import { SpeciesIcon } from "@/components/pets/species-icon";
import { LinkTableRow } from "@/components/ui/link-table-row";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAge } from "@/lib/format";
import type { PetOverview } from "@/shared/care";
import { speciesLabels } from "@/shared/schemas/pet";

interface PetTableProps {
  pets: PetOverview[];
}

/** The pets list, in the same table shape as the records list. Open a pet to edit it. */
export const PetTable = ({ pets }: PetTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Pet</TableHead>
        <TableHead>Species</TableHead>
        <TableHead>Records</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {pets.map(({ pet, status, recordCount }) => {
        const details = [pet.breed, pet.dateOfBirth && formatAge(pet.dateOfBirth)].filter(Boolean);
        return (
          <LinkTableRow key={pet.id} href={`/pets/${pet.id}`}>
            <TableCell>
              <div className="flex items-center gap-3">
                <SpeciesIcon species={pet.species} />
                <div>
                  <Link href={`/pets/${pet.id}`} className="font-medium hover:underline">
                    {pet.name}
                  </Link>
                  {details.length > 0 && (
                    <div className="text-muted-foreground text-sm">{details.join(" · ")}</div>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{speciesLabels[pet.species]}</Badge>
            </TableCell>
            <TableCell className="tabular-nums">{recordCount}</TableCell>
            <TableCell>
              <CareStatusBadge status={status} />
            </TableCell>
          </LinkTableRow>
        );
      })}
    </TableBody>
  </Table>
);
