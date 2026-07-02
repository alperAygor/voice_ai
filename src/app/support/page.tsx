import { redirect } from "next/navigation";

// Eski /support rotası artık /admin paneline taşındı.
export default function SupportPage() {
  redirect("/admin");
}
