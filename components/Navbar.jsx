"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { LogOut, ShoppingBag, Menu, X, Search, User, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { site, gstPercent } from "@/lib/site";
import { LogoMark } from "@/components/Logo";
import { formateCurrency } from "@/utils/formatCurrency";

const PRIMARY_LINKS = [
  { label: "Men", href: "/?gender=Men#products", gender: "men" },
  { label: "Women", href: "/?gender=Women#products", gender: "women" },
  { label: "All wigs", href: "/#products", gender: "" },
  { label: "Salon", href: "/salon" },
];

function SearchBox({ className = "", onSubmitted }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");

  useEffect(() => {
    setQ(params.get("q") || "");
  }, [params]);

  const submit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (q.trim()) next.set("q", q.trim());
    router.push(`/${next.toString() ? `?${next}` : ""}#products`);
    onSubmitted?.();
  };

  return (
    <form onSubmit={submit} className={`relative ${className}`} role="search">
      <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search wigs, colour, length"
        className="w-full border-b border-line bg-transparent py-2 pl-6 pr-2 text-sm placeholder:text-slate-400 focus:border-ink focus:outline-none"
        aria-label="Search wigs"
      />
    </form>
  );
}

function AccountLinks({ user, onNavigate, onLogout, itemClass }) {
  return (
    <>
      <Link href="/profile" onClick={onNavigate} className={itemClass}>
        My account
      </Link>
      <Link href="/my-orders" onClick={onNavigate} className={itemClass}>
        My orders
      </Link>
      {user.role === "admin" && (
        <>
          <Link href="/admin" onClick={onNavigate} className={itemClass}>
            Admin dashboard
          </Link>
          <Link href="/admin/manage-products" onClick={onNavigate} className={itemClass}>
            Manage products
          </Link>
          <Link href="/admin/orders" onClick={onNavigate} className={itemClass}>
            All orders
          </Link>
        </>
      )}
      <button onClick={onLogout} className={`${itemClass} w-full text-left text-red-700`}>
        <LogOut className="mr-2 inline h-4 w-4" />
        Log out
      </button>
    </>
  );
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const firstName = (user.name || user.username || "Account").split(" ")[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 items-center gap-1.5 text-sm font-medium hover:text-brand-ink"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <User className="h-[18px] w-[18px]" />
        <span className="max-w-[7rem] truncate">{firstName}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div role="menu" className="card absolute right-0 z-10 mt-1 w-56 py-1 text-sm">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate font-semibold">{user.name}</p>
            {user.username && <p className="truncate text-xs text-muted">@{user.username}</p>}
          </div>
          <AccountLinks
            user={user}
            onNavigate={() => setOpen(false)}
            onLogout={onLogout}
            itemClass="block px-4 py-2.5 hover:bg-slate-50"
          />
        </div>
      )}
    </div>
  );
}

export default function Navbar({ categories = [] }) {
  const { totalItem, logout, user } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const progressRef = useRef(null);
  const pathname = usePathname();
  const params = useSearchParams();
  const activeCategory = (params.get("category") || "").toLowerCase();
  const activeGender = (params.get("gender") || "").toLowerCase();

  useEffect(() => setIsOpen(false), [pathname, params]);

  // Stop the page behind the mobile menu from scrolling.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Gold line along the bottom of the header that fills as the page scrolls.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const done = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${done})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname, params]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    window.location.href = "/";
  };

  const isAdminArea = pathname.startsWith("/admin");
  const onHome = pathname === "/";
  // Send people back to where they were after signing in.
  const loginHref =
    pathname && pathname !== "/" && !pathname.startsWith("/login") && !pathname.startsWith("/register")
      ? `/login?redirect=${encodeURIComponent(pathname)}`
      : "/login";
  const registerHref = loginHref.replace("/login", "/register");

  const isActive = (link) => {
    if (link.href === "/salon") return pathname === "/salon";
    if (!onHome) return false;
    return link.gender ? activeGender === link.gender : false;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg">
      {/* Announcement line */}
      <div className="bg-ink text-white">
        <p className="container-x py-1.5 text-center text-[11px] uppercase tracking-[0.16em]">
          Free delivery over {formateCurrency(site.shipping.freeAt)}
          {/* One line only: the mobile menu below is pinned to this header's height. */}
          <span className="hidden sm:inline">
            <span className="mx-2 text-brand-2">|</span>
            Prices include {gstPercent}% GST
          </span>
        </p>
      </div>

      <div className="container-x grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        {/* Left: menu button on mobile, links on desktop */}
        <div className="flex items-center">
          <button
            className="-ml-2 grid h-11 w-11 place-items-center md:hidden"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {!isAdminArea && (
            <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Main">
              {PRIMARY_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`nav-link py-1 ${isActive(link) ? "is-active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Centre: logo and wordmark */}
        <Link href="/" className="group flex items-center gap-2.5 leading-none sm:gap-3">
          <LogoMark
            priority
            className="h-9 w-auto shrink-0 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 sm:h-12"
          />
          <span>
            <span className="display block whitespace-nowrap text-xl font-medium sm:text-[28px]">{site.wordmark}</span>
            <span className="mt-1 hidden whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.26em] text-accent min-[380px]:block sm:text-[10px] sm:tracking-[0.28em]">
              {site.strapline}
            </span>
          </span>
        </Link>

        {/* Right: search, account, cart */}
        <div className="flex items-center justify-end gap-5">
          {!isAdminArea && <SearchBox className="hidden w-48 lg:block" />}

          <div className="hidden md:block">
            {user ? (
              <UserMenu user={user} onLogout={handleLogout} />
            ) : (
              <Link href={loginHref} className="flex min-h-11 items-center gap-1.5 text-sm font-medium hover:text-brand-ink">
                <User className="h-[18px] w-[18px]" /> Sign in
              </Link>
            )}
          </div>

          <Link
            href="/cart"
            className="relative -mr-2 grid h-11 w-11 place-items-center hover:text-brand-ink"
            aria-label={`Cart, ${totalItem} ${totalItem === 1 ? "item" : "items"}`}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItem > 0 && (
              <span className="absolute right-0 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {totalItem}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Search on tablet and mobile, where it does not fit in the bar */}
      {!isAdminArea && onHome && (
        <div className="container-x pb-3 lg:hidden">
          <SearchBox />
        </div>
      )}

      {/* Category line */}
      {!isAdminArea && categories.length > 0 && (
        <div className="hidden border-t border-line md:block">
          <nav
            className="container-x no-scrollbar flex justify-center gap-7 overflow-x-auto py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"
            aria-label="Categories"
          >
            {categories.map((c) => (
              <Link
                key={c}
                href={`/?category=${encodeURIComponent(c)}#products`}
                className={`whitespace-nowrap transition-colors hover:text-ink ${
                  onHome && activeCategory === c.toLowerCase() ? "text-ink" : ""
                }`}
              >
                {c}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Mobile menu: full-height panel */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[92px] z-50 overflow-y-auto border-t border-line bg-bg md:hidden">
          <div className="container-x flex min-h-full flex-col py-6">
            {!isAdminArea && (
              <nav className="divide-y divide-line border-y border-line" aria-label="Main">
                {PRIMARY_LINKS.map((link) => (
                  <Link key={link.label} href={link.href} className="display block py-4 text-2xl">
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}

            {!isAdminArea && categories.length > 0 && (
              <div className="mt-8">
                <p className="eyebrow">Categories</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <Link
                      key={c}
                      href={`/?category=${encodeURIComponent(c)}#products`}
                      className="flex min-h-11 items-center border border-line bg-surface px-4 text-sm"
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <p className="eyebrow">Account</p>
              {user ? (
                <div className="mt-3 divide-y divide-line border-y border-line text-sm">
                  <div className="py-3">
                    <p className="truncate font-semibold">{user.name}</p>
                    {user.username && <p className="truncate text-xs text-muted">@{user.username}</p>}
                  </div>
                  <AccountLinks
                    user={user}
                    onNavigate={() => setIsOpen(false)}
                    onLogout={handleLogout}
                    itemClass="block py-3.5"
                  />
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Link href={loginHref} className="btn-outline">
                    Sign in
                  </Link>
                  <Link href={registerHref} className="btn-primary">
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <span
        ref={progressRef}
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-px left-0 h-0.5 w-full origin-left scale-x-0 bg-brand-2"
      />
    </header>
  );
}
