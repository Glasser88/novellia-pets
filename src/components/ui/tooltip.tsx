"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { cn } from "cn";

const TooltipProvider = (props: TooltipPrimitive.Provider.Props) => (
  <TooltipPrimitive.Provider delay={200} {...props} />
);

const Tooltip = (props: TooltipPrimitive.Root.Props) => (
  <TooltipPrimitive.Root data-slot="tooltip" {...props} />
);

const TooltipTrigger = (props: TooltipPrimitive.Trigger.Props) => (
  <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
);

const TooltipContent = ({
  className,
  side = "top",
  sideOffset = 6,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "side" | "sideOffset">) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Positioner side={side} sideOffset={sideOffset} className="z-50">
      <TooltipPrimitive.Popup
        data-slot="tooltip-content"
        className={cn(
          "bg-foreground text-background data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 max-w-xs rounded-md px-3 py-1.5 text-xs text-balance duration-100",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Positioner>
  </TooltipPrimitive.Portal>
);

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
