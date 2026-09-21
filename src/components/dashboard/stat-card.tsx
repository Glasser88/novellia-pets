import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { SectionCard } from "@/components/section-card";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Where the number leads, e.g. the records page filtered to what it counts. */
  href: string;
  tone?: "default" | "danger" | "warning";
}

const TONES = {
  default: "",
  danger: "text-red-700 dark:text-red-300",
  warning: "text-amber-700 dark:text-amber-300",
};

/** A single number in the same frame as every other section; the whole card is a link. */
export const StatCard = ({ label, value, icon: Icon, href, tone = "default" }: StatCardProps) => (
  <Link href={href} className="block rounded-xl">
    <SectionCard
      title={label}
      action={<Icon className="text-muted-foreground size-5" />}
      className="hover:ring-primary/50 h-full transition-shadow"
    >
      <span className={`text-3xl font-semibold tabular-nums ${value > 0 ? TONES[tone] : ""}`}>
        {value}
      </span>
    </SectionCard>
  </Link>
);
