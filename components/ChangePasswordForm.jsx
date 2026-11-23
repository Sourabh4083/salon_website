"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { passwordProblem, PASSWORD_HINT } from "@/lib/validate";

export default function ChangePasswordForm({ phone }) {
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const mismatch = form.confirmPassword !== "" && form.newPassword !== form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = passwordProblem(form.newPassword, phone);
    if (problem) {
      toast.error(problem);
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Password changed");
        window.location.assign("/");
      } else {
        toast.error(data.error || "Could not change your password");
        setLoading(false);
      }
    } catch {
      toast.error("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="You signed in with a temporary password. Pick your own so only you know it."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="newPassword" className="label req">New password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="newPassword"
              name="newPassword"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              placeholder={PASSWORD_HINT}
              value={form.newPassword}
              onChange={handleChange}
              className="input pl-10 pr-11"
              minLength={8}
              required
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink" aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-muted">{PASSWORD_HINT}.</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label req">Confirm new password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Type it again"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`input pl-10 ${mismatch ? "border-red-700 focus:border-red-700" : ""}`}
              aria-invalid={mismatch}
              required
            />
          </div>
          {mismatch && <p className="mt-1.5 text-xs font-medium text-red-700">Passwords do not match</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Save new password <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
    </AuthShell>
  );
}
