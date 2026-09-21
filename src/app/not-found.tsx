import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/section-card";

/**
 * Rendered for unknown URLs and whenever a page calls notFound(), e.g. a pet
 * or record id that does not exist or belongs to someone else.
 */
const NotFoundPage = () => (
  <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
    <h1 className="text-2xl font-semibold">Page not found</h1>
    <SectionCard
      title="Nothing here"
      description="The pet or record you're looking for doesn't exist, or it may have been deleted."
    >
      <Button nativeButton={false} render={<Link href="/" />}>
        Back to dashboard
      </Button>
    </SectionCard>
  </div>
);

export default NotFoundPage;
