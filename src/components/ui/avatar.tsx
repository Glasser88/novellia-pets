"use client";

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { cn } from "cn";

const Avatar = ({ className, ...props }: AvatarPrimitive.Root.Props) => (
  <AvatarPrimitive.Root
    data-slot="avatar"
    className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
);

const AvatarImage = ({ className, ...props }: AvatarPrimitive.Image.Props) => (
  <AvatarPrimitive.Image
    data-slot="avatar-image"
    className={cn("aspect-square size-full", className)}
    {...props}
  />
);

const AvatarFallback = ({ className, ...props }: AvatarPrimitive.Fallback.Props) => (
  <AvatarPrimitive.Fallback
    data-slot="avatar-fallback"
    className={cn(
      "bg-accent text-accent-foreground flex size-full items-center justify-center rounded-full text-xs font-semibold",
      className,
    )}
    {...props}
  />
);

export { Avatar, AvatarImage, AvatarFallback };
