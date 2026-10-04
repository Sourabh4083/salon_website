"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { site } from "@/lib/site";

function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  // Only same-site paths, so ?redirect=https://evil.com cannot bounce users.
  const rawRedirect = searchParams.get("redirect") || "/";
  const redirectPath =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/";
  const loginHref = redirectPath !== "/" ? `/login?redirect=${encodeURIComponent(redirectPath)}` : "/login";
  const score = strength(form.password);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-700", "bg-accent", "bg-brand-2", "bg-success"];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Welcome to ${site.wordmark}!`);
        // The API already set the session cookie. Full navigation so the
        // middleware, layout and cart provider all see it at once.
        window.location.assign(redirectPath);
      } else {
        toast.error(data.error || "Something went wrong.");
        setLoading(false);
      }
    } catch {
      toast.error("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Track your orders and check out faster next time."
      footer={
        <>
          Already have an account?{" "}
          <Link href={loginHref} className="font-semibold text-brand-ink hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="label">Full name</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="name" name="name" autoComplete="name" placeholder="Aarav Sharma" value={form.name} onChange={handleChange} className="input pl-10" required />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="label">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className="input pl-10" required />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
              className="input pl-10 pr-11"
              minLength={6}
              required
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink" aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= score ? colors[score] : "bg-slate-200"}`} />
                ))}
              </div>
              <span className="text-xs text-muted">{labels[score]}</span>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
    </AuthShell>
  );
}

// useSearchParams needs a Suspense boundary.
export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="container-x py-16">
          <div className="card mx-auto h-[560px] max-w-5xl animate-pulse" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
