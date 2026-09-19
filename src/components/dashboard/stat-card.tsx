import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: number;
  tone?: "default" | "danger" | "warning";
}

const TONES = {
  default: "",
  danger: "text-red-700 dark:text-red-300",
  warning: "text-amber-700 dark:text-amber-300",
};

export function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1">
        <span className="text-muted-foreground text-sm">{label}</span>
        <span className={`text-3xl font-semibold ${value > 0 ? TONES[tone] : ""}`}>{value}</span>
      </CardContent>
    </Card>
  );
}
