import { redirectIfSignedIn } from "@/lib/guestOnly";

export const metadata = { title: "Sign in" };

export default async function LoginLayout({ children }) {
  await redirectIfSignedIn();
  return children;
}
