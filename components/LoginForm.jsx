"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Phone, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { normaliseMobile } from "@/lib/validate";
import { site, whatsappLink } from "@/lib/site";

export default function LoginForm() {
  const [form, setForm] = useState({ phone: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  // Only allow same-site paths, so ?redirect=https://evil.com cannot bounce a
  // freshly logged-in user to another origin.
  const rawRedirect = searchParams.get("redirect") || "/";
  const redirectPath =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/";
  const registerHref =
    redirectPath !== "/" ? `/register?redirect=${encodeURIComponent(redirectPath)}` : "/register";
  const forgotHref = whatsappLink("Hi, I forgot my password. Please help me reset it.");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!normaliseMobile(form.phone)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (res.ok) {
        // Full navigation (not router.push) so the new auth cookie is applied
        // to the middleware, the server-rendered layout and the cart provider
        // in one go.
        if (data.mustChangePassword) {
          window.location.assign("/change-password");
        } else {
          toast.success("Welcome back!");
          window.location.assign(redirectPath);
        }
      } else {
        toast.error(data.error || "Login failed. Please try again.");
        setLoading(false);
      }
    } catch {
      toast.error("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in with your mobile number."
      footer={
        <>
          New to {site.wordmark}?{" "}
          <Link href={registerHref} className="font-semibold text-brand-ink hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="phone" className="label req">Mobile number</label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="username"
              placeholder="98765 43210"
              value={form.phone}
              onChange={handleChange}
              className="input pl-10"
              maxLength={16}
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className="label req">Password</label>
            {forgotHref && (
              <a href={forgotHref} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-brand-ink hover:underline">
                Forgot password?
              </a>
            )}
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              className="input pl-10 pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
    </AuthShell>
  );
}
