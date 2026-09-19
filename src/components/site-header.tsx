import Link from "next/link";
import { PawPrintIcon } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/pets", label: "Pets" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <PawPrintIcon className="size-5" />
          Novellia Pets
        </Link>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
