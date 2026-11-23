import { redirectIfSignedIn } from "@/lib/guestOnly";

export const metadata = { title: "Create account" };

export default async function RegisterLayout({ children }) {
  await redirectIfSignedIn();
  return children;
}
