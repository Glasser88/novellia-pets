import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  /** Builds the URL for a page, keeping the current filters. */
  hrefFor: (page: number) => string;
}

/** "Showing 26 to 50 of 132" with Previous and Next. Hidden when everything fits on one page. */
export const Pagination = ({ page, pageCount, pageSize, total, hrefFor }: PaginationProps) => {
  if (pageCount <= 1) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-4 pt-3">
      <p className="text-muted-foreground text-sm">
        Showing {first} to {last} of {total}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          disabled={page <= 1}
          render={<Link href={hrefFor(page - 1)} aria-disabled={page <= 1} />}
        >
          <ChevronLeftIcon /> Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          disabled={page >= pageCount}
          render={<Link href={hrefFor(page + 1)} aria-disabled={page >= pageCount} />}
        >
          Next <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
};
