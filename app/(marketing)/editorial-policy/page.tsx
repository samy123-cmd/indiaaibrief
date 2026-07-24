import { redirect } from "next/navigation";

/** Legacy URL — canonical editorial policy lives at /editorial. */
export default function EditorialPolicyRedirect() {
  redirect("/editorial");
}
