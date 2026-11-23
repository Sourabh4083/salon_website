"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cleanAddress, EMPTY_ADDRESS, INDIAN_STATES, isValidPincode } from "@/lib/address";

/**
 * One delivery address, with separate fields for a courier's label.
 * Typing a PIN code fills in city and state from India Post's directory.
 *
 * `onSubmit(data)` gets the cleaned address (see lib/address.js) and may
 * return { error, field } to show a server-side problem on the right field.
 * `children` render above the buttons (e.g. "save this address" checkbox).
 */
export default function AddressForm({ initial, onSubmit, onCancel, submitLabel = "Save address", children }) {
  const uid = useId();
  const [form, setForm] = useState({ ...EMPTY_ADDRESS, ...initial });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  // idle | loading | found | notfound | unavailable
  const [pinStatus, setPinStatus] = useState("idle");
  const [areas, setAreas] = useState([]);
  // The PIN code city/state were last filled from, so a customer's own edits
  // to city/state are only replaced when they change the PIN code.
  const filledFor = useRef(isValidPincode(initial?.pincode) ? initial.pincode : "");
  const fieldRefs = useRef({});

  const pin = form.pincode;
  useEffect(() => {
    if (!isValidPincode(pin)) {
      setPinStatus("idle");
      setAreas([]);
      return;
    }
    const controller = new AbortController();
    setPinStatus("loading");
    fetch(`/api/pincode/${pin}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("unavailable");
        const data = await res.json();
        if (!data.found) {
          setPinStatus("notfound");
          setAreas([]);
          return;
        }
        setPinStatus("found");
        setAreas(data.areas || []);
        if (filledFor.current !== pin) {
          filledFor.current = pin;
          setForm((f) => ({ ...f, city: data.city || f.city, state: data.state || f.state }));
          setErrors((e) => ({ ...e, city: undefined, state: undefined, pincode: undefined }));
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") setPinStatus("unavailable");
      });
    return () => controller.abort();
  }, [pin]);

  const set = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "pincode" ? value.replace(/\D/g, "").slice(0, 6) : value }));
    if (errors[name]) setErrors((x) => ({ ...x, [name]: undefined }));
  };

  const showError = (field, message) => {
    setErrors({ [field]: message });
    fieldRefs.current[field]?.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // never submit an outer form (checkout)
    if (saving) return;

    const { data, error, field } = cleanAddress(form);
    if (error) return showError(field, error);
    if (pinStatus === "notfound") return showError("pincode", "This PIN code doesn't exist. Please check it.");

    setSaving(true);
    try {
      const result = await onSubmit(data);
      if (result?.error) showError(result.field || "name", result.error);
    } finally {
      setSaving(false);
    }
  };

  const id = (name) => `${uid}-${name}`;
  const ref = (name) => (el) => { fieldRefs.current[name] = el; };
  const errorProps = (name) =>
    errors[name]
      ? { "aria-invalid": true, "aria-describedby": `${id(name)}-error`, className: "input border-red-700 focus:border-red-700" }
      : { className: "input" };
  const err = (name) =>
    errors[name] ? <p id={`${id(name)}-error`} className="mt-1.5 text-xs font-medium text-red-700">{errors[name]}</p> : null;

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <p className="text-xs text-muted">
        Fields marked <span className="font-semibold text-red-600" aria-hidden="true">*</span> are required.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={id("name")} className="label req">Full name (receiver)</label>
          <input id={id("name")} aria-required="true" ref={ref("name")} name="name" autoComplete="name" value={form.name} onChange={set} maxLength={80} placeholder="Aarav Sharma" {...errorProps("name")} />
          {err("name")}
        </div>
        <div>
          <label htmlFor={id("phone")} className="label req">Mobile number</label>
          <input id={id("phone")} aria-required="true" ref={ref("phone")} name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" value={form.phone} onChange={set} maxLength={16} placeholder="98765 43210" {...errorProps("phone")} />
          {err("phone")}
        </div>
      </div>

      <div>
        <label htmlFor={id("line1")} className="label req">House / flat no., building</label>
        <input id={id("line1")} aria-required="true" ref={ref("line1")} name="line1" autoComplete="address-line1" value={form.line1} onChange={set} maxLength={120} placeholder="Flat 302, Sai Residency" {...errorProps("line1")} />
        {err("line1")}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
        <div>
          <label htmlFor={id("pincode")} className="label req">PIN code</label>
          <input id={id("pincode")} aria-required="true" ref={ref("pincode")} name="pincode" inputMode="numeric" autoComplete="postal-code" value={form.pincode} onChange={set} maxLength={6} placeholder="452001" {...errorProps("pincode")} />
          {err("pincode")}
          {!errors.pincode && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted" aria-live="polite">
              {pinStatus === "loading" && <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Looking up PIN code…</>}
              {pinStatus === "found" && <><CheckCircle2 className="h-3.5 w-3.5 text-success" /> City and state filled in. Change them if needed.</>}
              {pinStatus === "notfound" && <span className="flex items-center gap-1.5 font-medium text-red-700"><AlertCircle className="h-3.5 w-3.5" /> This PIN code doesn&apos;t exist. Please check it.</span>}
              {pinStatus === "unavailable" && "Couldn't look up this PIN code. Please type city and state."}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={id("type")} className="label">Address type</label>
          <select id={id("type")} name="type" value={form.type} onChange={set} className="input">
            <option value="home">Home</option>
            <option value="work">Work / office</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor={id("line2")} className="label req">Street, area, locality</label>
        <input id={id("line2")} aria-required="true" ref={ref("line2")} name="line2" autoComplete="address-line2" list={areas.length ? id("areas") : undefined} value={form.line2} onChange={set} maxLength={120} placeholder="MG Road, Vijay Nagar" {...errorProps("line2")} />
        {areas.length > 0 && (
          <datalist id={id("areas")}>
            {areas.map((a) => <option key={a} value={a} />)}
          </datalist>
        )}
        {err("line2")}
      </div>

      <div>
        <label htmlFor={id("landmark")} className="label">Landmark <span className="font-normal text-muted">(optional)</span></label>
        <input id={id("landmark")} name="landmark" value={form.landmark} onChange={set} maxLength={80} placeholder="Near SBI bank" className="input" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={id("city")} className="label req">City / district</label>
          <input id={id("city")} aria-required="true" ref={ref("city")} name="city" autoComplete="address-level2" value={form.city} onChange={set} maxLength={60} placeholder="Indore" {...errorProps("city")} />
          {err("city")}
        </div>
        <div>
          <label htmlFor={id("state")} className="label req">State</label>
          <select id={id("state")} aria-required="true" ref={ref("state")} name="state" autoComplete="address-level1" value={form.state} onChange={set} {...errorProps("state")}>
            <option value="">Choose state</option>
            {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {err("state")}
        </div>
      </div>

      <div>
        <label htmlFor={id("altPhone")} className="label">Alternate mobile <span className="font-normal text-muted">(optional)</span></label>
        <input id={id("altPhone")} ref={ref("altPhone")} name="altPhone" type="tel" inputMode="numeric" value={form.altPhone} onChange={set} maxLength={16} placeholder="In case we can't reach the number above" {...errorProps("altPhone")} />
        {err("altPhone")}
      </div>

      {children}

      <div className="flex flex-wrap gap-3 pt-1">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={saving} className="btn-outline">Cancel</button>
        )}
      </div>
    </form>
  );
}
