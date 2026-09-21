import { CareStatusBadge } from "@/components/care-status-badge";
import { ListRow } from "@/components/list-row";
import { SpeciesIcon } from "@/components/pets/species-icon";
import { Badge } from "@/components/ui/badge";
import { formatAge, plural } from "@/lib/format";
import type { PetOverview } from "@/shared/care";
import { speciesLabels } from "@/shared/schemas/pet";

interface PetListProps {
  pets: PetOverview[];
}

export const PetList = ({ pets }: PetListProps) => (
  <ul className="divide-y">
    {pets.map(({ pet, status, recordCount }) => {
      const details = [
        pet.breed,
        pet.dateOfBirth && formatAge(pet.dateOfBirth),
        plural(recordCount, "record"),
      ].filter(Boolean);

      return (
        <ListRow
          key={pet.id}
          href={`/pets/${pet.id}`}
          leading={<SpeciesIcon species={pet.species} />}
          title={
            <>
              <span className="truncate">{pet.name}</span>
              <Badge variant="secondary">{speciesLabels[pet.species]}</Badge>
            </>
          }
          detail={details.join(" · ")}
          aside={<CareStatusBadge status={status} />}
        />
      );
    })}
  </ul>
);
