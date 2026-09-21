"use client";

import { InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/** A small info icon that explains something on hover or focus. */
export const InfoTip = ({ text }: { text: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger
        aria-label={text}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded-full outline-none focus-visible:ring-3"
      >
        <InfoIcon className="size-4" />
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
