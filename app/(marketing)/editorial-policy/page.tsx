import { permanentRedirect } from "next/navigation";

/** Legacy URL — canonical editorial policy lives at /editorial. */
export default function EditorialPolicyRedirect() {
  permanentRedirect("/editorial");
}
