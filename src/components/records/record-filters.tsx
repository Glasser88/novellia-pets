"use client";

import type { ChangeEvent, FormEvent } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { DUE_WINDOW_LABELS, type DueWindow } from "@/shared/care";
import { listRecordTypes } from "@/shared/recordTypes";

interface RecordFiltersProps {
  /** Page to submit to; the filters land in its query string. */
  action: string;
  /** Current values, from the URL. */
  dueWindow?: DueWindow;
  type?: string;
  query?: string;
  /** Show the "how soon is it due" dropdown (the records page does; a pet page does not). */
  showDueWindow?: boolean;
}

const DUE_WINDOWS: DueWindow[] = ["attention", "overdue", "due_soon", "upcoming"];

/**
 * One GET form: two dropdowns and a search box. Changing a dropdown submits
 * straight away; the search box submits on enter (or when cleared). Every
 * filter lives in the URL, so results are linkable and server-rendered.
 */
export const RecordFilters = ({
  action,
  dueWindow,
  type,
  query = "",
  showDueWindow = false,
}: RecordFiltersProps) => {
  const submitOnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    event.currentTarget.form?.requestSubmit();
  };

  // The native clear button on a search input empties the field without
  // submitting; submit for it so the results reset too.
  const submitWhenCleared = (event: FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    if (input.value === "" && query) input.form?.requestSubmit();
  };

  return (
    <form action={action} method="get" className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-48 flex-1 sm:max-w-xs">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          type="search"
          name="q"
          placeholder="Search records"
          defaultValue={query}
          onInput={submitWhenCleared}
          aria-label="Search records"
          className="pl-8"
        />
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-3">
        {showDueWindow && (
          <NativeSelect
            name="status"
            aria-label="Due"
            defaultValue={dueWindow ?? ""}
            onChange={submitOnChange}
            className="w-44"
          >
            <option value="">All records</option>
            {DUE_WINDOWS.map((window) => (
              <option key={window} value={window}>
                {DUE_WINDOW_LABELS[window]}
              </option>
            ))}
          </NativeSelect>
        )}

        <NativeSelect
          name="type"
          aria-label="Record type"
          defaultValue={type ?? ""}
          onChange={submitOnChange}
          className="w-40"
        >
          <option value="">All types</option>
          {listRecordTypes().map((recordType) => (
            <option key={recordType.key} value={recordType.key}>
              {recordType.pluralLabel}
            </option>
          ))}
        </NativeSelect>
      </div>
    </form>
  );
};
