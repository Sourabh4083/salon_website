import { Suspense } from "react";
import { Fraunces, DM_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
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
  const { id, email, name, role } = payload;
  return { id, email, name, role };
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
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: "2px",
              background: "#14233b",
              color: "#fff",
              fontSize: "14px",
            },
          }}
        />
        <CartProvider initialUser={user}>
          {/* Navbar reads useSearchParams, which needs a Suspense boundary. */}
          <Suspense fallback={<div className="h-[92px] border-b border-line bg-bg" />}>
            <Navbar categories={categories} />
          </Suspense>
          <div className="flex-1">{children}</div>
          <Footer categories={categories} user={user} />
          <WhatsAppFloat />
        </CartProvider>
      </body>
    </html>
  );
}
