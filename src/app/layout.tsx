import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Novellia Pets",
  description: "Track and manage your pets' medical records",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
