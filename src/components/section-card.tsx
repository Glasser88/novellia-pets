import type { ReactNode } from "react";
import { InfoTip } from "@/components/info-tip";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SectionCardProps {
  title: string;
  /** What belongs in this section, shown as an info icon next to the title. */
  hint?: string;
  /** A line under the title that must be read, e.g. guidance for a form. */
  description?: string;
  /** Shown next to the title, e.g. how many items the section holds. */
  count?: number;
  /** Rendered in the top-right corner of the header (a link or button). */
  action?: ReactNode;
  /** When true, `emptyMessage` is shown instead of `children`. */
  isEmpty?: boolean;
  emptyMessage?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * The shared frame for every block of content in the app: one card, one
 * title style, and optional description, header action and empty state.
 * The content is whatever the section needs.
 */
export const SectionCard = ({
  title,
  hint,
  description,
  count,
  action,
  isEmpty = false,
  emptyMessage = "Nothing here yet.",
  className,
  children,
}: SectionCardProps) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <h2>{title}</h2>
        {count !== undefined && (
          <span className="text-muted-foreground font-normal tabular-nums">{count}</span>
        )}
        {hint && <InfoTip text={hint} />}
      </CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
      {action && <CardAction>{action}</CardAction>}
    </CardHeader>
    <CardContent>
      {isEmpty ? <div className="text-muted-foreground text-sm">{emptyMessage}</div> : children}
    </CardContent>
  </Card>
);
