"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setTheme } from "@/server/theme";
import type { Theme } from "@/shared/theme";

const systemTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

/**
 * Flips between light and dark. With no explicit choice yet, the first click
 * flips away from whatever the system is showing. Both icons are rendered and
 * CSS shows the right one, so no client code needs to know the theme.
 */
export const ThemeToggle = ({ theme }: { theme?: Theme }) => {
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const current = theme ?? systemTheme();
    startTransition(() => setTheme(current === "dark" ? "light" : "dark"));
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      disabled={pending}
      onClick={toggle}
    >
      <SunIcon className="dark:hidden" />
      <MoonIcon className="hidden dark:block" />
    </Button>
  );
};
