"use client";

import { LogOutIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CurrentUser } from "@/shared/user";

/** "Demo Owner" -> "DO"; a single name gives one letter. */
const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

/**
 * The signed-in user, top right. Sign out is shown but disabled: it becomes a
 * real action when authentication is wired up (see DECISIONS.md), and until
 * then the UI is honest that this is a demo session.
 */
export const UserMenu = ({ user }: { user: CurrentUser }) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      aria-label="Account menu"
      className="focus-visible:ring-ring/50 rounded-full outline-none focus-visible:ring-3"
    >
      <Avatar>
        <AvatarFallback>{initials(user.name)}</AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuGroup>
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-foreground text-sm font-medium">{user.name}</span>
          <span className="text-muted-foreground font-normal">{user.email}</span>
        </DropdownMenuLabel>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem disabled>
        <LogOutIcon /> Sign out
        <span className="text-muted-foreground ml-auto text-xs">demo</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
