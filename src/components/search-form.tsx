"use client";

import type { FormEvent } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchFormProps {
  /** Page to submit to; the query lands in its `?q=` parameter. */
  action: string;
  placeholder: string;
  defaultValue?: string;
  /** Other query parameters to preserve, e.g. an active type filter. */
  hidden?: Record<string, string | undefined>;
}

/**
 * A plain GET form: submitting navigates to `action?q=...`, so search is
 * server-rendered, linkable and works without JavaScript.
 *
 * The browser's native clear button on a search input only empties the field;
 * it does not submit. With JavaScript available we submit when an active
 * search is cleared, so the results reset too.
 */
export function SearchForm({ action, placeholder, defaultValue, hidden = {} }: SearchFormProps) {
  function handleInput(event: FormEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    if (input.value === "" && defaultValue) {
      input.form?.requestSubmit();
    }
  }

  return (
    <form action={action} method="get" role="search" className="relative w-full max-w-xs">
      {Object.entries(hidden).map(
        ([name, value]) => value && <input key={name} type="hidden" name={name} value={value} />,
      )}
      <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
      <Input
        type="search"
        name="q"
        placeholder={placeholder}
        defaultValue={defaultValue}
        onInput={handleInput}
        aria-label={placeholder}
        className="pl-8"
      />
    </form>
  );
}
