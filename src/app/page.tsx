import { redirect } from "next/navigation";

// The dashboard lands here later; until then the pets list is the home page.
export default function HomePage() {
  redirect("/pets");
}
