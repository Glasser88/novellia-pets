import { BirdIcon, CatIcon, DogIcon, PawPrintIcon, RabbitIcon, TurtleIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "cn";
import type { Species } from "@/generated/prisma/enums";

const ICONS: Record<Species, LucideIcon> = {
  DOG: DogIcon,
  CAT: CatIcon,
  BIRD: BirdIcon,
  RABBIT: RabbitIcon,
  REPTILE: TurtleIcon,
  OTHER: PawPrintIcon,
};

interface SpeciesIconProps {
  species: Species;
  size?: "default" | "lg";
}

/** A tinted circle with the species' icon, used wherever a pet is named. */
export const SpeciesIcon = ({ species, size = "default" }: SpeciesIconProps) => {
  const Icon = ICONS[species];
  return (
    <span
      aria-hidden
      className={cn(
        "bg-accent text-accent-foreground flex shrink-0 items-center justify-center rounded-full",
        size === "lg" ? "size-12 [&_svg]:size-6" : "size-8 [&_svg]:size-4",
      )}
    >
      <Icon />
    </span>
  );
};
