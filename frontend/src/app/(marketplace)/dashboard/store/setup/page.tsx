"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { storesApi } from "@/lib/stores-api";

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

const inputCls =
  "w-full border border-[#EDE9E3] bg-white rounded-lg px-4 py-3 text-sm text-[#0E1520] placeholder-[#C8C0B0] focus:outline-none focus:ring-2 focus:ring-[#B09145] focus:border-transparent transition-shadow";

const labelCls = "block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-1.5";

type Step = "identity" | "contact" | "location" | "hours";

const STEPS: { key: Step; label: string; description: string }[] = [
  { key: "identity",  label: "Your Store",  description: "Name, logo & description" },
  { key: "contact",   label: "Contact",     description: "Phone, email & website" },
  { key: "location",  label: "Location",    description: "Where to find you" },
  { key: "hours",     label: "Hours",       description: "When you're open" },
];

export default function StoreSetupPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [step, setStep]               = useState<Step>("identity");
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Logo
  const logoRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile]         = useState<File | null>(null);
  const [logoPreview, setLogoPreview]   = useState<string | null>(null);

  // Form fields
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone]             = useState("");
  const [email, setEmail]             = useState("");
  const [website, setWebsite]         = useState("");
  const [address, setAddress]         = useState("");
  const [city, setCity]               = useState("");
  const [country, setCountry]         = useState("");
  const [hours, setHours]             = useState<Record<string, string>>({
    mon: "", tue: "", wed: "", thu: "", fri: "", sat: "", sun: "",
  });

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "store" && user.role !== "admin") { router.push("/"); return; }
    // Pre-fill email from account
    setEmail(user.email ?? "");
  }, [user, router]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const next = () => {
    if (step === "identity" && !name.trim()) {
      setError("Store name is required.");
      return;
    }
    setError(null);
    setStep(STEPS[stepIndex + 1].key);
  };

  const back = () => setStep(STEPS[stepIndex - 1].key);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const openingHours: Record<string, string> = {};
      DAYS.forEach(({ key }) => { if (hours[key]) openingHours[key] = hours[key]; });

      const { data: store } = await storesApi.create({
        name: name.trim(),
        description,
        phone,
        email,
        website,
        address,
        city,
        country,
        opening_hours: openingHours,
      });

      if (logoFile) {
        await storesApi.uploadLogo(store.slug, logoFile);
      }

      router.push("/dashboard/store");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-start justify-center px-4 py-10 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-xl">
        <div className="mb-8">
          <p className="tt-section-label text-[#B09145] mb-1">Store Setup</p>
          <h1 className="font-display italic text-3xl text-[#0E1520]">Set up your store profile</h1>
        </div>

          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex-1">
                <div className={`h-1 rounded-full transition-all ${i <= stepIndex ? "bg-[#B09145]" : "bg-[#EDE9E3]"}`} />
                <p className={`text-[10px] font-semibold mt-1.5 hidden sm:block ${i === stepIndex ? "text-[#B09145]" : "text-[#9E9585]"}`}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Step heading */}
          <div className="mb-7">
            <h2 className="text-xl font-bold text-[#0E1520] mb-1">{STEPS[stepIndex].label}</h2>
            <p className="text-sm text-[#9E9585]">{STEPS[stepIndex].description}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          {/* ── Step: Identity ─────────────────────────────── */}
          {step === "identity" && (
            <div className="space-y-5">
              {/* Logo upload */}
              <div>
                <label className={labelCls}>Store Logo</label>
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => logoRef.current?.click()}
                    className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#EDE9E3] hover:border-[#B09145] transition-colors bg-[#F0EDE8] flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0"
                  >
                    {logoPreview ? (
                      <Image src={logoPreview} alt="Logo preview" width={80} height={80} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-7 h-7 text-[#4A5568]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => logoRef.current?.click()}
                      className="text-sm font-semibold text-[#B09145] hover:text-[#C8A96E] transition-colors"
                    >
                      {logoPreview ? "Change logo" : "Upload logo"}
                    </button>
                    <p className="text-xs text-[#4A5568] mt-0.5">PNG, JPG — optional, max 5 MB</p>
                  </div>
                  <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Store Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Geneva Watch House"
                  className={inputCls}
                  autoFocus
                />
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell buyers about your store — your specialties, history, and what makes you unique..."
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          )}

          {/* ── Step: Contact ──────────────────────────────── */}
          {step === "contact" && (
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className={inputCls}
                  autoFocus
                />
              </div>

              <div>
                <label className={labelCls}>Business Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@yourstore.com"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourstore.com"
                  className={inputCls}
                />
              </div>
            </div>
          )}

          {/* ── Step: Location ─────────────────────────────── */}
          {step === "location" && (
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Rue de Rhône"
                  className={inputCls}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Geneva"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Switzerland"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="bg-[#F0EDE8] border border-[#EDE9E3] rounded-xl px-4 py-3 text-xs text-[#9E9585]">
                Your location helps buyers find your store in the directory and plan visits.
              </div>
            </div>
          )}

          {/* ── Step: Hours ────────────────────────────────── */}
          {step === "hours" && (
            <div className="space-y-3">
              <p className="text-xs text-[#9E9585] mb-4">
                Enter your opening hours for each day. Leave blank for days you&apos;re closed.
              </p>
              {DAYS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[#9E9585] w-24 flex-shrink-0">{label}</span>
                  <input
                    type="text"
                    value={hours[key]}
                    onChange={(e) => setHours((h) => ({ ...h, [key]: e.target.value }))}
                    placeholder="e.g. 9:00 – 18:00"
                    className="flex-1 border border-[#EDE9E3] bg-white rounded-lg px-3 py-2 text-sm text-[#0E1520] placeholder-[#C8C0B0] focus:outline-none focus:ring-2 focus:ring-[#B09145] transition-shadow"
                  />
                </div>
              ))}
              <p className="text-[11px] text-[#4A5568] pt-1">You can update opening hours anytime from your store settings.</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={back}
                className="flex-1 tt-btn-outline py-3 rounded-xl text-sm"
              >
                Back
              </button>
            )}

            {step !== "hours" ? (
              <button
                type="button"
                onClick={next}
                className="flex-1 tt-btn-gold py-3 rounded-xl text-sm"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 tt-btn-gold py-3 rounded-xl text-sm disabled:opacity-50"
              >
                {submitting ? "Creating your store…" : "Launch My Store"}
              </button>
            )}
          </div>

          {step === "hours" && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full mt-2 text-xs text-[#4A5568] hover:text-[#9E9585] transition-colors"
            >
              Skip — I&apos;ll add hours later
            </button>
          )}
      </div>
    </div>
  );
}
