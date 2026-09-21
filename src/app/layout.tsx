import type { Metadata } from "next";
import { cn } from "cn";
import { SiteHeader } from "@/components/site-header";
import { getTheme } from "@/server/theme";
import "./globals.css";

// Every page shows per-user data read from the database, so render on each
// request rather than pre-rendering at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Novellia Pets",
  description: "Track and manage your pets' medical records",
};

const RootLayout = async ({ children }: LayoutProps<"/">) => {
  // An explicit choice becomes a class on <html>; with none, CSS follows the
  // system preference. Rendering it here means no flash and no client script.
  const theme = await getTheme();

  return (
    <html lang="en" className={cn("h-full antialiased", theme)}>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
      </body>
    </html>
  );
};

export default RootLayout;
