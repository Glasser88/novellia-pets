"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { TableRow } from "@/components/ui/table";

interface LinkTableRowProps {
  href: string;
  children: ReactNode;
}

/**
 * A table row that opens `href` when clicked anywhere on it. Table rows
 * cannot be links, so the first cell should still contain a real <Link> to
 * the same place for keyboards and screen readers; a click on that link (or
 * any other link or button in the row) is left to the element itself.
 */
export const LinkTableRow = ({ href, children }: LinkTableRowProps) => {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLTableRowElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("a, button")) return;
    router.push(href);
  };

  return (
    <TableRow onClick={handleClick} className="cursor-pointer">
      {children}
    </TableRow>
  );
};
