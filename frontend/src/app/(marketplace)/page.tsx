import { redirect } from "next/navigation";

// Home page is served from app/page.tsx to avoid route-group conflicts.
// This file should not be reached.
export default function Page() {
  redirect("/listings");
}
