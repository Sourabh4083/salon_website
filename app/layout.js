import { Suspense } from "react";
import { Fraunces, DM_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import CompleteProfileBanner from "@/components/CompleteProfileBanner";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";
import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/lib/products";
import { site } from "@/lib/site";

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s | ${site.shortName}`,
  },
  description: site.description,
  openGraph: {
    siteName: site.name,
    type: "website",
    images: [{ url: "/images/logo.png", width: 1254, height: 1254, alt: site.name }],
  },
};

// Strip JWT bookkeeping (iat/exp) and keep only what the UI needs.
function publicUser(payload) {
  if (!payload) return null;
  const { id, username, name, role, profileComplete } = payload;
  // Sessions from before the flag existed read as incomplete, which is right:
  // the extra profile fields did not exist then either.
  return { id, username, name, role, profileComplete: Boolean(profileComplete) };
}

export default async function RootLayout({ children }) {
  // Read the session cookie once on the server so the browser never has to
  // ask "who am I?" before it can render the navbar or load the cart.
  const [userPayload, categories] = await Promise.all([
    getCurrentUser(),
    getCategories().catch(() => []),
  ]);
  const user = publicUser(userPayload);

  return (
    <html lang="en" className={`${serif.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col">
        {/* Scroll-reveal content starts hidden; without JavaScript, show it. */}
        <noscript>
          <style>{".reveal{opacity:1;transform:none}"}</style>
        </noscript>
        <Toaster
          position="top-right"
          gutter={10}
          containerStyle={{ top: 16, right: 16, bottom: 16, left: 16 }}
          toastOptions={{
            duration: 3000,
            style: {
              maxWidth: "min(360px, calc(100vw - 32px))",
              padding: "12px 16px",
              borderRadius: "2px",
              border: "1px solid #ded6c8",
              borderLeft: "3px solid #a8843f",
              background: "#ffffff",
              color: "#14233b",
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: 1.4,
              boxShadow: "0 12px 32px -12px rgba(20, 35, 59, 0.35)",
            },
            success: {
              style: { borderLeft: "3px solid #2f6b4f" },
              iconTheme: { primary: "#2f6b4f", secondary: "#ffffff" },
            },
            error: {
              duration: 5000,
              style: { borderLeft: "3px solid #b91c1c" },
              iconTheme: { primary: "#b91c1c", secondary: "#ffffff" },
            },
          }}
        />
        <CartProvider initialUser={user}>
          {/* Navbar reads useSearchParams, which needs a Suspense boundary. */}
          <Suspense fallback={<div className="h-[92px] border-b border-line bg-bg" />}>
            <Navbar categories={categories} />
          </Suspense>
          <CompleteProfileBanner />
          <div className="flex-1">{children}</div>
          <Footer categories={categories} user={user} />
          <WhatsAppFloat />
        </CartProvider>
      </body>
    </html>
  );
}
