import * as React from "react";
import { cn } from "cn";
import { ChevronDownIcon } from "lucide-react";

/**
 * A styled native <select>. Native selects work with keyboards, screen
 * readers and mobile pickers out of the box, and are a single element to
 * reason about in forms.
 */
const NativeSelect = ({ className, children, ...props }: React.ComponentProps<"select">) => (
  <div className="relative">
    <select
      data-slot="native-select"
      className={cn(
        "border-input bg-card dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive h-8 w-full appearance-none rounded-lg border py-1 pr-8 pl-2.5 text-sm outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDownIcon className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2" />
  </div>
);

export { NativeSelect };
