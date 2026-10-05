"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AtSign, Lock, User, Phone, MapPin, Eye, EyeOff, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { normaliseUsername, normaliseMobile, USERNAME_HINT } from "@/lib/validate";

const GENDERS = [
  { value: "", label: "Select" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const EMPTY_PASSWORDS = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function ProfileForm({ initialProfile }) {
  const router = useRouter();
  const { refreshUser } = useCart();
  const [form, setForm] = useState(initialProfile);
  const [savedUsername, setSavedUsername] = useState(initialProfile.username);
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const usernameChanged = form.username.trim().toLowerCase() !== savedUsername;
  const mismatch =
    passwords.confirmPassword !== "" && passwords.newPassword !== passwords.confirmPassword;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePassword = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (!normaliseUsername(form.username)) {
      toast.error(`Username must be ${USERNAME_HINT}`);
      return;
    }
    if (!normaliseMobile(form.phone)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    if ((usernameChanged || passwords.newPassword) && !passwords.currentPassword) {
      toast.error("Enter your current password to change your username or password");
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
      setSavedUsername(data.profile.username);
      setPasswords(EMPTY_PASSWORDS);
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

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <section className="card p-6 sm:p-8">
        <h2 className="text-lg font-medium">Your details</h2>
        <p className="mt-1 text-sm text-muted">Your address is filled in for you at checkout.</p>

        <div className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="label">Full name</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input id="name" name="name" autoComplete="name" value={form.name} onChange={handleChange} required className="input pl-10" placeholder="Aarav Sharma" />
              </div>
            </div>
            <div>
              <label htmlFor="username" className="label">Username</label>
              <div className="relative">
                <AtSign className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input id="username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} value={form.username} onChange={handleChange} required minLength={3} maxLength={20} pattern="[A-Za-z0-9_]+" title={USERNAME_HINT} className="input pl-10" placeholder="aarav_sharma" />
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="gender" className="label">Gender</label>
              <select id="gender" name="gender" value={form.gender} onChange={handleChange} className="input">
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="label">Date of birth</label>
              <input id="dateOfBirth" name="dateOfBirth" type="date" autoComplete="bday" max={today} value={form.dateOfBirth} onChange={handleChange} className="input" />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="label">Mobile number</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" value={form.phone} onChange={handleChange} required maxLength={16} className="input pl-10" placeholder="98765 43210" />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="label">Delivery address</label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <textarea
                id="address"
                name="address"
                rows={4}
                autoComplete="street-address"
                value={form.address}
                onChange={handleChange}
                className="input resize-none pl-10"
                placeholder="House / flat, street, city, state, PIN code"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="text-lg font-medium">Password</h2>
        <p className="mt-1 text-sm text-muted">
          Only needed if you are changing your username or setting a new password.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="currentPassword" className="label">Current password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="currentPassword"
                name="currentPassword"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={passwords.currentPassword}
                onChange={handlePassword}
                className="input pl-10 pr-11"
                required={usernameChanged || passwords.newPassword !== ""}
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink" aria-label={show ? "Hide passwords" : "Show passwords"}>
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="newPassword" className="label">New password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="newPassword"
                  name="newPassword"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={passwords.newPassword}
                  onChange={handlePassword}
                  className="input pl-10"
                  minLength={6}
                />
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="label">Confirm new password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
        </div>
      </section>

      <button type="submit" disabled={saving} className="btn-primary w-full py-3.5 text-base sm:w-auto sm:px-10">
        {saving ? <><Loader2 className="h-5 w-5 animate-spin" /> Saving…</> : "Save changes"}
      </button>
    </form>
  );
}
