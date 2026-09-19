import Link from "next/link";
import { cn } from "cn";
import { listRecordTypes } from "@/shared/recordTypes";

interface RecordTypeFilterProps {
  basePath: string;
  selected?: string;
  /** Current search text, preserved when switching type. */
  query?: string;
}

/** Link-based filter: the selected type lives in the URL (?type=...). */
export function RecordTypeFilter({ basePath, selected, query }: RecordTypeFilterProps) {
  function href(typeKey?: string) {
    const params = new URLSearchParams();
    if (typeKey) params.set("type", typeKey);
    if (query) params.set("q", query);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

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
            href={href(option.key)}
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
