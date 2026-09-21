import { FileTextIcon } from "lucide-react";
import { cn } from "cn";
import type { AnyRecordType } from "@/shared/recordTypes";

interface RecordTypeIconProps {
  type: AnyRecordType;
  size?: "default" | "lg";
}

/** A tinted circle with the record type's icon, the record-side twin of SpeciesIcon. */
export const RecordTypeIcon = ({ type, size = "default" }: RecordTypeIconProps) => {
  const Icon = type.icon ?? FileTextIcon;
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
