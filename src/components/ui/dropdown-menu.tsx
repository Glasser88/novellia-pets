"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { cn } from "cn";

const DropdownMenu = (props: MenuPrimitive.Root.Props) => (
  <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
);

const DropdownMenuTrigger = (props: MenuPrimitive.Trigger.Props) => (
  <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
);

const DropdownMenuContent = ({
  className,
  align = "end",
  sideOffset = 6,
  ...props
}: MenuPrimitive.Popup.Props & Pick<MenuPrimitive.Positioner.Props, "align" | "sideOffset">) => (
  <MenuPrimitive.Portal>
    <MenuPrimitive.Positioner align={align} sideOffset={sideOffset} className="z-50">
      <MenuPrimitive.Popup
        data-slot="dropdown-menu-content"
        className={cn(
          "bg-popover text-popover-foreground ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 min-w-48 rounded-lg p-1 text-sm shadow-md ring-1 duration-100 outline-none",
          className,
        )}
        {...props}
      />
    </MenuPrimitive.Positioner>
  </MenuPrimitive.Portal>
);

const DropdownMenuLabel = ({ className, ...props }: MenuPrimitive.GroupLabel.Props) => (
  <MenuPrimitive.GroupLabel
    data-slot="dropdown-menu-label"
    className={cn("px-2 py-1.5 text-xs font-medium", className)}
    {...props}
  />
);

const DropdownMenuGroup = (props: MenuPrimitive.Group.Props) => (
  <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
);

const DropdownMenuItem = ({ className, ...props }: MenuPrimitive.Item.Props) => (
  <MenuPrimitive.Item
    data-slot="dropdown-menu-item"
    className={cn(
      "data-highlighted:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
      className,
    )}
    {...props}
  />
);

const DropdownMenuSeparator = ({ className, ...props }: MenuPrimitive.Separator.Props) => (
  <MenuPrimitive.Separator
    data-slot="dropdown-menu-separator"
    className={cn("bg-border -mx-1 my-1 h-px", className)}
    {...props}
  />
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
