import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SectionCard } from "@/components/section-card";

interface FormPageProps {
  /** The page heading, e.g. "Add a pet". */
  title: string;
  /** The card heading, named after what the form edits, e.g. "Details". */
  sectionTitle: string;
  /** One line of guidance under the card heading. */
  description?: string;
  /** Where the form returns to, shown as "← Milo" above the title. */
  back: { href: string; label: string };
  children: ReactNode;
}

/**
 * The layout for every create/edit screen: a single centred column, narrow
 * enough that fields stay scannable, with the form in the same card frame as
 * the rest of the app.
 */
export const FormPage = ({ title, sectionTitle, description, back, children }: FormPageProps) => (
  <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
    <div className="flex flex-col gap-2">
      <Link
        href={back.href}
        className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 text-sm"
      >
        <ArrowLeftIcon className="size-4" /> {back.label}
      </Link>
      <h1 className="text-2xl font-semibold">{title}</h1>
    </div>
    <SectionCard title={sectionTitle} description={description}>
      {children}
    </SectionCard>
  </div>
);
