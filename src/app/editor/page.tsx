import { redirect } from "next/navigation";

// Redirect /editor to homepage - sessions require a session ID
export default function EditorPage() {
  redirect("/");
}
