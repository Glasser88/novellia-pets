import Link from "next/link";
import { Button } from "@/components/ui/button";

/** The "see the rest" action in a section header that shows a capped list. */
export const ViewAllLink = ({ href }: { href: string }) => (
  <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={href} />}>
    View all
  </Button>
);
