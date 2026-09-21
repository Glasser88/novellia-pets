"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/pets", label: "Pets" },
  { href: "/records", label: "Records" },
] as const;

/** Header navigation; the current section is shown in the brand colour. */
export const NavLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {NAV_LINKS.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-sm transition-colors",
              active ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
};
