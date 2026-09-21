import Link from "next/link";
import { PawPrintIcon } from "lucide-react";
import { NavLinks } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/server/currentUser";
import { getTheme } from "@/server/theme";

export const SiteHeader = async () => {
  const [user, theme] = await Promise.all([getCurrentUser(), getTheme()]);

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <PawPrintIcon className="size-5" />
          Novellia Pets
        </Link>
        <NavLinks />
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle theme={theme} />
          <UserMenu user={user} />
        </div>
      </nav>
    </header>
  );
};
