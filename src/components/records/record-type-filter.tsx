import Link from "next/link";
import { cn } from "cn";
import { listRecordTypes } from "@/shared/recordTypes";

interface RecordTypeFilterProps {
  basePath: string;
  selected?: string;
}

/** Link-based filter: the selected type lives in the URL (?type=...). */
export function RecordTypeFilter({ basePath, selected }: RecordTypeFilterProps) {
  const options = [
    { key: undefined, label: "All" },
    ...listRecordTypes().map((t) => ({ key: t.key, label: t.pluralLabel })),
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {options.map((option) => {
        const active = option.key === selected;
        return (
          <Link
            key={option.key ?? "all"}
            href={option.key ? `${basePath}?type=${option.key}` : basePath}
            className={cn(
              "rounded-md px-2.5 py-1 text-sm",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
