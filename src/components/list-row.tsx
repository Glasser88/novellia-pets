import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ListRowProps {
  href: string;
  /** The main line: a name, optionally with a badge beside it. */
  title: ReactNode;
  /** The muted line under the title. */
  detail: ReactNode;
  /** Shown on the right, before the chevron (a status badge, say). */
  aside?: ReactNode;
  /** Shown on the left, before the text (an icon or avatar). */
  leading?: ReactNode;
}

/**
 * One clickable row in a SectionCard list. The whole row is the link, with a
 * hover tint that bleeds to the card edges and a chevron as the "opens
 * something" cue.
 */
export const ListRow = ({ href, title, detail, aside, leading }: ListRowProps) => (
  <li>
    <Link
      href={href}
      className="hover:bg-muted/60 -mx-(--card-spacing) flex items-center gap-4 px-(--card-spacing) py-3 transition-colors"
    >
      {leading}
      {/* min-w-0 lets this column shrink so long text truncates instead of pushing the badge out. */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 truncate font-medium">{title}</div>
        <div className="text-muted-foreground truncate text-sm">{detail}</div>
      </div>
      <div className="shrink-0">{aside}</div>
      <ChevronRightIcon className="text-muted-foreground size-4 shrink-0" />
    </Link>
  </li>
);
