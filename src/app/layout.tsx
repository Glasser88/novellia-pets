import type { Metadata } from "next";
import Link from "next/link";
import { PawPrintIcon } from "lucide-react";
import "./globals.css";

// Every page shows per-user data read from the database, so render on each
// request rather than pre-rendering at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Novellia Pets",
  description: "Track and manage your pets' medical records",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <header className="border-b">
          <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <PawPrintIcon className="size-5" />
              Novellia Pets
            </Link>
            <Link href="/" className="text-muted-foreground hover:text-foreground text-sm">
              Dashboard
            </Link>
            <Link href="/pets" className="text-muted-foreground hover:text-foreground text-sm">
              Pets
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
