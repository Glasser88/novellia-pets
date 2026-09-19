import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
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
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
