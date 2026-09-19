import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAge } from "@/lib/format";
import { speciesLabels, type PetDto } from "@/shared/schemas/pet";

export function PetCard({ pet }: { pet: PetDto }) {
  return (
    <Link href={`/pets/${pet.id}`} className="block">
      <Card className="hover:bg-muted/50 h-full transition-colors">
        <CardHeader className="flex items-start justify-between gap-2">
          <CardTitle>{pet.name}</CardTitle>
          <Badge variant="secondary">{speciesLabels[pet.species]}</Badge>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          {[pet.breed, pet.dateOfBirth && formatAge(pet.dateOfBirth)].filter(Boolean).join(" · ") ||
            "No details yet"}
        </CardContent>
      </Card>
    </Link>
  );
}
