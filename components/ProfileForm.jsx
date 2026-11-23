"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Lock, User, Phone, Eye, EyeOff, Loader2,
  Package, ShoppingBag, LogOut, Check, ChevronDown,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { normaliseMobile, passwordProblem, PASSWORD_HINT } from "@/lib/validate";

const GENDERS = [
  { value: "", label: "Select" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const EMPTY_PASSWORDS = { currentPassword: "", newPassword: "", confirmPassword: "" };

function Field({ label, htmlFor, hint, required = false, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className={required ? "label req" : "label"}>{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

const iconClass = "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400";

// `children` (the address book) render between the summary and the details
// form: it has its own forms and saves on its own.
export default function ProfileForm({ initialProfile, account = {}, hasAddress = false, children }) {
  const router = useRouter();
  const { refreshUser, logout } = useCart();
  const [form, setForm] = useState(initialProfile);
  const [saved, setSaved] = useState(initialProfile);
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [show, setShow] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const phoneChanged = (normaliseMobile(form.phone) || form.phone.trim()) !== saved.phone;
  // The mobile number is the login ID, so changing it (or the password) needs
  // the current password.
  const needsCurrentPassword = phoneChanged || passwords.newPassword !== "";
  const showPasswordFields = changingPassword || needsCurrentPassword;
  const mismatch =
    passwords.confirmPassword !== "" && passwords.newPassword !== passwords.confirmPassword;
  const dirty =
    Object.keys(form).some((k) => String(form[k]).trim() !== String(saved[k]).trim()) ||
    passwords.newPassword !== "";

  const checklist = [
    { label: "Mobile number", done: Boolean(saved.phone) },
    { label: "Delivery address", done: hasAddress },
    { label: "Gender", done: Boolean(saved.gender) },
    { label: "Date of birth", done: Boolean(saved.dateOfBirth) },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePassword = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    const phone = normaliseMobile(form.phone);
    if (!phone) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    if (passwords.newPassword) {
      const problem = passwordProblem(passwords.newPassword, phone);
      if (problem) {
        toast.error(problem);
        return;
      }
    }
    if (needsCurrentPassword && !passwords.currentPassword) {
      toast.error("Enter your current password to confirm this change");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Could not save your details");
        return;
      }

      setForm(data.profile);
      setSaved(data.profile);
      setPasswords(EMPTY_PASSWORDS);
      setChangingPassword(false);
      toast.success("Your details are saved");
      // The API re-issued the session cookie; pick up the new name and
      // profile flag in the navbar, footer and the "complete profile" bar.
      await refreshUser();
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const initial = (saved.name || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="mt-6 space-y-6">
      {/* Who is signed in, at a glance */}
      <section className="card p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-ink text-2xl font-medium text-white" aria-hidden="true">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xl font-medium sm:text-2xl">{saved.name || "Your account"}</p>
            {saved.phone && <p className="truncate text-sm text-muted">{saved.phone}</p>}
            {account.memberSince && (
              <p className="mt-0.5 text-xs text-muted">Member since {account.memberSince}</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 text-sm">
          <Link href="/my-orders" className="flex min-h-11 flex-col items-center justify-center gap-1 border border-line bg-surface p-3 text-center transition-colors hover:border-ink">
            <Package className="h-5 w-5" />
            My orders
          </Link>
          <Link href="/cart" className="flex min-h-11 flex-col items-center justify-center gap-1 border border-line bg-surface p-3 text-center transition-colors hover:border-ink">
            <ShoppingBag className="h-5 w-5" />
            My cart
          </Link>
        </div>

        {doneCount < checklist.length && (
          <div className="mt-6 border-t border-line pt-5">
            <div className="flex items-center justify-between text-sm">
              <p className="font-medium">Complete your details</p>
              <p className="text-muted">{doneCount} of {checklist.length}</p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-brand-2 transition-all" style={{ width: `${(doneCount / checklist.length) * 100}%` }} />
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {checklist.map((c) => (
                <li key={c.label} className={`flex items-center gap-1.5 border px-2.5 py-1 text-xs ${c.done ? "border-line text-muted" : "border-ink font-medium"}`}>
                  {c.done && <Check className="h-3.5 w-3.5 text-brand-2" />}
                  {c.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {children}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="card p-6 sm:p-8">
          <h2 className="text-lg font-medium">Your details</h2>
          <p className="mt-1 text-sm text-muted">Your name and mobile number are filled in for you when you add an address.</p>

          <div className="mt-6 space-y-5">
            <Field label="Full name" htmlFor="name" required>
              <div className="relative">
                <User className={iconClass} />
                <input id="name" name="name" autoComplete="name" value={form.name} onChange={handleChange} required className="input pl-10" placeholder="Aarav Sharma" />
              </div>
            </Field>

            <Field label="Mobile number" htmlFor="phone" required hint="You sign in with this number, and we call it about your delivery.">
              <div className="relative">
                <Phone className={iconClass} />
                <input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="username" value={form.phone} onChange={handleChange} required maxLength={16} className="input pl-10" placeholder="98765 43210" />
              </div>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Gender" htmlFor="gender">
                <select id="gender" name="gender" value={form.gender} onChange={handleChange} className="input">
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Date of birth" htmlFor="dateOfBirth">
                <input id="dateOfBirth" name="dateOfBirth" type="date" autoComplete="bday" max={today} value={form.dateOfBirth} onChange={handleChange} className="input" />
              </Field>
            </div>
          </div>
        </section>

        <section className="card p-6 sm:p-8">
          <button
            type="button"
            onClick={() => setChangingPassword((v) => !v)}
            className="flex w-full items-center justify-between gap-4 text-left"
            aria-expanded={showPasswordFields}
            disabled={needsCurrentPassword}
          >
            <span>
              <span className="block text-lg font-medium">Password</span>
              <span className="mt-1 block text-sm text-muted">
                {needsCurrentPassword && !changingPassword
                  ? "Enter your current password to confirm your new mobile number."
                  : "Change the password you sign in with."}
              </span>
            </span>
            {!needsCurrentPassword && (
              <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${showPasswordFields ? "rotate-180" : ""}`} />
            )}
          </button>

          {showPasswordFields && (
            <div className="mt-6 space-y-5">
              <Field label="Current password" htmlFor="currentPassword" required={needsCurrentPassword}>
                <div className="relative">
                  <Lock className={iconClass} />
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    value={passwords.currentPassword}
                    onChange={handlePassword}
                    className="input pl-10 pr-11"
                    required={needsCurrentPassword}
                  />
                  <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center text-slate-400 hover:text-ink" aria-label={show ? "Hide passwords" : "Show passwords"}>
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              {(changingPassword || passwords.newPassword) && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="New password" htmlFor="newPassword">
                    <div className="relative">
                      <Lock className={iconClass} />
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={show ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder={PASSWORD_HINT}
                        value={passwords.newPassword}
                        onChange={handlePassword}
                        className="input pl-10"
                        minLength={8}
                      />
                    </div>
                  </Field>
                  <div>
                    <label htmlFor="confirmPassword" className={passwords.newPassword ? "label req" : "label"}>Confirm new password</label>
                    <div className="relative">
                      <Lock className={iconClass} />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={show ? "text" : "password"}
                        autoComplete="new-password"
                        value={passwords.confirmPassword}
                        onChange={handlePassword}
                        className={`input pl-10 ${mismatch ? "border-red-700 focus:border-red-700" : ""}`}
                        aria-invalid={mismatch}
                        aria-describedby={mismatch ? "confirmPassword-error" : undefined}
                        required={passwords.newPassword !== ""}
                      />
                    </div>
                    {mismatch && (
                      <p id="confirmPassword-error" className="mt-1.5 text-xs font-medium text-red-700">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="submit" disabled={saving || !dirty} className="btn-primary w-full py-3.5 text-base sm:w-auto sm:px-10">
            {saving ? <><Loader2 className="h-5 w-5 animate-spin" /> Saving…</> : "Save changes"}
          </button>
          {!dirty && !saving && <p className="text-center text-sm text-muted sm:text-left">No changes to save</p>}
          {dirty && !saving && (
            <button type="button" onClick={() => { setForm(saved); setPasswords(EMPTY_PASSWORDS); setChangingPassword(false); }} className="text-sm text-muted underline hover:text-ink">
              Undo changes
            </button>
          )}
        </div>
      </form>

      {/* Kept apart from the save button so it isn't tapped by mistake. */}
      <section className="border-t border-line pt-6">
        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-11 w-full items-center justify-center gap-2 border border-line bg-surface px-6 py-3 text-sm font-medium transition-colors border-red-700 text-red-700 sm:w-auto"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </section>
    </div>
  );
}
