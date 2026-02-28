"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { repairsApi } from "@/lib/repairs-api";
import { RepairShopDetail, RepairService, RepairShowcase, Appointment } from "@/types";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS: Record<string, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
  fri: "Friday", sat: "Saturday", sun: "Sunday",
};

const inputCls =
  "w-full border border-[#EDE9E3] rounded-lg px-4 py-3 text-sm text-[#0E1520] placeholder-[#C8C0B0] focus:outline-none focus:ring-2 focus:ring-[#B09145] focus:border-transparent transition-shadow bg-white";
const labelCls = "block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-1.5";

type Tab = "overview" | "appointments" | "services" | "showcase" | "settings";

export default function RepairsDashboardPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const logoRef = useRef<HTMLInputElement>(null);

  const [shop, setShop]               = useState<RepairShopDetail | null>(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState<Tab>("overview");

  // Showcase state
  const [showcase, setShowcase]           = useState<RepairShowcase[]>([]);
  const [showUpload, setShowUpload]       = useState(false);
  const beforeRef                         = useRef<HTMLInputElement>(null);
  const afterRef                          = useRef<HTMLInputElement>(null);
  const [beforeFile, setBeforeFile]       = useState<File | null>(null);
  const [afterFile, setAfterFile]         = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview]   = useState<string | null>(null);
  const [showcaseForm, setShowcaseForm]   = useState({ title: "", description: "", watch_brand: "", watch_model: "" });
  const [showcaseError, setShowcaseError] = useState<string | null>(null);
  const [showcaseLoading, setShowcaseLoading] = useState(false);

  // Services state
  const [services, setServices]       = useState<RepairService[]>([]);
  const [addingService, setAddingService] = useState(false);
  const [editingService, setEditingService] = useState<RepairService | null>(null);
  const [serviceForm, setServiceForm] = useState({ name: "", description: "", price_from: "", price_to: "", duration_days: "" });
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [serviceLoading, setServiceLoading] = useState(false);

  // Appointments state
  const [appointments, setAppointments]       = useState<Appointment[]>([]);
  const [apptLoading, setApptLoading]         = useState(false);
  const [apptLoaded, setApptLoaded]           = useState(false);
  const [updatingAppt, setUpdatingAppt]       = useState<string | null>(null);

  // Settings state
  const [settingsForm, setSettingsForm] = useState({
    name: "", description: "", phone: "", email: "", address: "", city: "", country: "",
  });
  const [hours, setHours] = useState<Record<string, string>>({});
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved,  setSettingsSaved]  = useState(false);
  const [settingsError,  setSettingsError]  = useState<string | null>(null);

  // Logo state
  const [logoPreview,    setLogoPreview]    = useState<string | null>(null);
  const [logoUploading,  setLogoUploading]  = useState(false);
  const [logoError,      setLogoError]      = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "repair" && user.role !== "admin") { router.push("/"); return; }

    repairsApi.mine()
      .then(({ data }) => {
        setShop(data);
        setServices(data.services ?? []);
        repairsApi.getShowcase(data.slug).then(({ data: s }) => setShowcase(s)).catch(() => {});
        setSettingsForm({
          name:        data.name ?? "",
          description: data.description ?? "",
          phone:       data.phone ?? "",
          email:       data.email ?? "",
          address:     data.address ?? "",
          city:        data.city ?? "",
          country:     data.country ?? "",
        });
        setHours(data.opening_hours ?? {});
      })
      .catch(() => router.push("/repairs"))
      .finally(() => setLoading(false));
  }, [isInitialized, user, router]);

  // Load appointments when the tab is first activated
  useEffect(() => {
    if (activeTab !== "appointments" || apptLoaded || !shop) return;
    setApptLoading(true);
    repairsApi.getAppointments(shop.slug)
      .then(({ data }) => { setAppointments(data.results); setApptLoaded(true); })
      .catch(() => {})
      .finally(() => setApptLoading(false));
  }, [activeTab, apptLoaded, shop]);

  // ── Appointment status update ─────────────────────────────
  const updateApptStatus = async (appt: Appointment, newStatus: string) => {
    if (!shop) return;
    setUpdatingAppt(appt.id);
    try {
      const { data } = await repairsApi.updateAppointmentStatus(shop.slug, appt.id, newStatus);
      setAppointments((a) => a.map((x) => (x.id === data.id ? data : x)));
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdatingAppt(null);
    }
  };

  // ── Logo upload ──────────────────────────────────────────
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !shop) return;
    setLogoPreview(URL.createObjectURL(file));
    setLogoError(null);
    setLogoUploading(true);
    try {
      const { data } = await repairsApi.uploadLogo(file);
      setShop(data);
    } catch {
      setLogoError("Failed to upload logo. Try again.");
      setLogoPreview(null);
    } finally {
      setLogoUploading(false);
    }
  };

  // ── Services ─────────────────────────────────────────────
  const openAddService = () => {
    setEditingService(null);
    setServiceForm({ name: "", description: "", price_from: "", price_to: "", duration_days: "" });
    setServiceError(null);
    setAddingService(true);
  };

  const openEditService = (svc: RepairService) => {
    setEditingService(svc);
    setServiceForm({
      name:          svc.name,
      description:   svc.description,
      price_from:    svc.price_from ?? "",
      price_to:      svc.price_to ?? "",
      duration_days: svc.duration_days != null ? String(svc.duration_days) : "",
    });
    setServiceError(null);
    setAddingService(true);
  };

  const closeServiceForm = () => { setAddingService(false); setEditingService(null); };

  const submitService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !serviceForm.name.trim()) { setServiceError("Service name is required."); return; }
    setServiceLoading(true);
    setServiceError(null);
    const payload = {
      name:          serviceForm.name.trim(),
      description:   serviceForm.description,
      price_from:    serviceForm.price_from || null,
      price_to:      serviceForm.price_to || null,
      duration_days: serviceForm.duration_days ? parseInt(serviceForm.duration_days) : null,
    };
    try {
      if (editingService) {
        const { data } = await repairsApi.updateService(shop.slug, editingService.id, payload);
        setServices((s) => s.map((x) => (x.id === data.id ? data : x)));
      } else {
        const { data } = await repairsApi.addService(shop.slug, payload);
        setServices((s) => [...s, data]);
      }
      closeServiceForm();
    } catch {
      setServiceError("Failed to save service.");
    } finally {
      setServiceLoading(false);
    }
  };

  const deleteService = async (svc: RepairService) => {
    if (!shop || !confirm(`Delete "${svc.name}"?`)) return;
    try {
      await repairsApi.deleteService(shop.slug, svc.id);
      setServices((s) => s.filter((x) => x.id !== svc.id));
    } catch {
      alert("Failed to delete service.");
    }
  };

  // ── Settings save ────────────────────────────────────────
  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    setSettingsSaving(true);
    setSettingsError(null);
    setSettingsSaved(false);
    try {
      const { data } = await repairsApi.update(shop.slug, { ...settingsForm, opening_hours: hours });
      setShop(data);
      setSettingsSaved(true);
    } catch {
      setSettingsError("Failed to save changes.");
    } finally {
      setSettingsSaving(false);
    }
  };

  // ── Showcase helpers ─────────────────────────────────────
  const pickFile = (which: "before" | "after", file: File) => {
    const url = URL.createObjectURL(file);
    if (which === "before") { setBeforeFile(file); setBeforePreview(url); }
    else { setAfterFile(file); setAfterPreview(url); }
  };

  const resetShowcaseForm = () => {
    setShowUpload(false);
    setBeforeFile(null); setAfterFile(null);
    setBeforePreview(null); setAfterPreview(null);
    setShowcaseForm({ title: "", description: "", watch_brand: "", watch_model: "" });
    setShowcaseError(null);
  };

  const submitShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    if (!beforeFile) { setShowcaseError("Before image is required."); return; }
    if (!showcaseForm.title.trim()) { setShowcaseError("Title is required."); return; }
    setShowcaseLoading(true);
    setShowcaseError(null);
    const fd = new FormData();
    fd.append("title", showcaseForm.title.trim());
    fd.append("description", showcaseForm.description);
    fd.append("watch_brand", showcaseForm.watch_brand);
    fd.append("watch_model", showcaseForm.watch_model);
    fd.append("before_image", beforeFile);
    if (afterFile) fd.append("after_image", afterFile);
    try {
      const { data } = await repairsApi.addShowcase(shop.slug, fd);
      setShowcase((s) => [data, ...s]);
      resetShowcaseForm();
    } catch {
      setShowcaseError("Failed to upload. Try again.");
    } finally {
      setShowcaseLoading(false);
    }
  };

  const deleteShowcaseItem = async (item: RepairShowcase) => {
    if (!shop || !confirm(`Delete "${item.title}"?`)) return;
    try {
      await repairsApi.deleteShowcase(shop.slug, item.id);
      setShowcase((s) => s.filter((x) => x.id !== item.id));
    } catch {
      alert("Failed to delete.");
    }
  };

  // ── Loading skeleton ─────────────────────────────────────
  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="h-24 bg-[#EDE9E3] rounded-2xl" />
      <div className="h-64 bg-[#EDE9E3] rounded-2xl" />
    </div>
  );

  if (!shop) return null;

  const logoSrc = logoPreview ?? shop.logo_url;

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview",     label: "Overview" },
    { key: "appointments", label: "Appointments" },
    { key: "services",     label: "Services" },
    { key: "showcase",     label: "Showcase" },
    { key: "settings",     label: "Settings" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-start gap-5 mb-8">
        {/* Logo */}
        <div className="relative flex-shrink-0">
          <div
            onClick={() => logoRef.current?.click()}
            className="w-20 h-20 rounded-2xl overflow-hidden bg-[#F0EDE8] cursor-pointer ring-2 ring-[#EDE9E3] hover:ring-[#B09145] transition-all"
          >
            {logoSrc ? (
              <Image src={logoSrc} alt={shop.name} width={80} height={80} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#C8C0B0]">
                {shop.name[0]}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => logoRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#B09145] flex items-center justify-center shadow-md hover:bg-[#C8A96E] transition-colors"
            aria-label="Upload logo"
          >
            {logoUploading ? (
              <svg className="w-3.5 h-3.5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            )}
          </button>
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="tt-section-label text-[#B09145] mb-1">Repair Shop</p>
          <h1 className="font-display italic text-3xl text-[#0E1520]">{shop.name}</h1>
          {logoError && <p className="text-xs text-red-500 mt-1">{logoError}</p>}
          <p className="text-xs text-[#9E9585] mt-1">Click the logo to upload a new photo</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#EDE9E3] mb-6">
        {TABS.map((t) => {
          const pendingCount = t.key === "appointments"
            ? appointments.filter((a) => a.status === "pending").length
            : 0;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`relative px-5 py-2.5 text-xs font-semibold tracking-[0.08em] uppercase transition-colors border-b-2 -mb-px ${
                activeTab === t.key
                  ? "border-[#B09145] text-[#B09145]"
                  : "border-transparent text-[#9E9585] hover:text-[#0E1520]"
              }`}
            >
              {t.label}
              {pendingCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#B09145] text-white text-[9px] font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Overview tab ──────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Services", value: services.length },
              { label: "Rating", value: shop.average_rating > 0 ? shop.average_rating.toFixed(1) : "—" },
              { label: "Reviews", value: shop.review_count },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-[#EDE9E3] rounded-2xl p-5 text-center">
                <p className="text-2xl font-bold text-[#0E1520]">{s.value}</p>
                <p className="text-xs text-[#9E9585] mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 space-y-3">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-4">Quick Actions</p>
            <button
              onClick={() => setActiveTab("appointments")}
              className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-[#EDE9E3] hover:border-[#B09145] hover:bg-[#B09145]/5 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#F0EDE8] flex items-center justify-center group-hover:bg-[#B09145]/10 transition-colors">
                <svg className="w-4 h-4 text-[#B09145]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0E1520]">View Appointments</p>
                <p className="text-xs text-[#9E9585]">Manage booking requests from customers</p>
              </div>
            </button>
            <button
              onClick={() => { setActiveTab("services"); openAddService(); }}
              className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-[#EDE9E3] hover:border-[#B09145] hover:bg-[#B09145]/5 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#F0EDE8] flex items-center justify-center group-hover:bg-[#B09145]/10 transition-colors">
                <svg className="w-4 h-4 text-[#B09145]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0E1520]">Add a Service</p>
                <p className="text-xs text-[#9E9585]">List what repair services you offer</p>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-[#EDE9E3] hover:border-[#B09145] hover:bg-[#B09145]/5 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#F0EDE8] flex items-center justify-center group-hover:bg-[#B09145]/10 transition-colors">
                <svg className="w-4 h-4 text-[#B09145]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0E1520]">Edit Shop Details</p>
                <p className="text-xs text-[#9E9585]">Update contact info, hours, and description</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ── Appointments tab ──────────────────────────────── */}
      {activeTab === "appointments" && (
        <div>
          {apptLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-[#EDE9E3] rounded-2xl" />)}
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white border border-[#EDE9E3] rounded-2xl py-14 px-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#F0EDE8] flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#C8C0B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <p className="font-semibold text-[#0E1520] mb-1">No appointments yet</p>
              <p className="text-sm text-[#9E9585]">When customers book appointments they will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appt) => {
                const STATUS_STYLES: Record<string, string> = {
                  pending:   "bg-amber-50 text-amber-700 border-amber-200",
                  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
                  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  cancelled: "bg-red-50 text-red-500 border-red-200",
                };
                const isUpdating = updatingAppt === appt.id;
                return (
                  <div key={appt.id} className="bg-white border border-[#EDE9E3] rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      {/* Left: customer + details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm text-[#0E1520]">
                            {appt.customer.full_name || appt.customer.username}
                          </p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[appt.status] ?? ""}`}>
                            {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-xs text-[#9E9585]">
                          {new Date(appt.scheduled_at).toLocaleString(undefined, {
                            weekday: "short", year: "numeric", month: "short",
                            day: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                        {appt.service && (
                          <p className="text-xs text-[#B09145] mt-0.5">{appt.service.name}</p>
                        )}
                        {appt.customer.phone && (
                          <a
                            href={`tel:${appt.customer.phone}`}
                            className="inline-flex items-center gap-1 text-xs text-[#B09145] hover:text-[#C8A96E] mt-1 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                            </svg>
                            {appt.customer.phone}
                          </a>
                        )}
                        {appt.notes && (
                          <p className="text-xs text-[#9E9585] mt-1 italic">&ldquo;{appt.notes}&rdquo;</p>
                        )}
                      </div>

                      {/* Right: status actions */}
                      {appt.status === "pending" && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            disabled={isUpdating}
                            onClick={() => updateApptStatus(appt, "confirmed")}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            disabled={isUpdating}
                            onClick={() => updateApptStatus(appt, "cancelled")}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      {appt.status === "confirmed" && (
                        <button
                          disabled={isUpdating}
                          onClick={() => updateApptStatus(appt, "completed")}
                          className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#B09145]/10 text-[#B09145] border border-[#B09145]/20 hover:bg-[#B09145]/20 transition-colors disabled:opacity-50"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Services tab ──────────────────────────────────── */}
      {activeTab === "services" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-[#0E1520]">{services.length} service{services.length !== 1 ? "s" : ""}</p>
            {!addingService && (
              <button onClick={openAddService} className="tt-btn-gold py-2 px-4 rounded-xl text-xs">
                + Add Service
              </button>
            )}
          </div>

          {/* Add / Edit form */}
          {addingService && (
            <form onSubmit={submitService} className="bg-white border border-[#EDE9E3] rounded-2xl p-5 space-y-4">
              <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9E9585]">
                {editingService ? "Edit Service" : "New Service"}
              </p>
              {serviceError && <p className="text-xs text-red-500">{serviceError}</p>}

              <div>
                <label className={labelCls}>Service Name <span className="text-red-500">*</span></label>
                <input
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Full Service & Overhaul"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  rows={3}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What's included, brands supported..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Price From ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={serviceForm.price_from}
                    onChange={(e) => setServiceForm((f) => ({ ...f, price_from: e.target.value }))}
                    placeholder="150"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Price To ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={serviceForm.price_to}
                    onChange={(e) => setServiceForm((f) => ({ ...f, price_to: e.target.value }))}
                    placeholder="400"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Duration (days)</label>
                  <input
                    type="number"
                    min="1"
                    value={serviceForm.duration_days}
                    onChange={(e) => setServiceForm((f) => ({ ...f, duration_days: e.target.value }))}
                    placeholder="7"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-1">
                <button type="button" onClick={closeServiceForm} className="text-xs text-[#9E9585] hover:text-[#0E1520] px-4 py-2 border border-[#EDE9E3] rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={serviceLoading} className="tt-btn-gold py-2 px-5 rounded-lg text-xs disabled:opacity-50">
                  {serviceLoading ? "Saving…" : editingService ? "Update" : "Add Service"}
                </button>
              </div>
            </form>
          )}

          {/* Services list */}
          {services.length === 0 && !addingService ? (
            <div className="bg-white border border-[#EDE9E3] rounded-2xl py-14 px-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#F0EDE8] flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#C8C0B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <p className="font-semibold text-[#0E1520] mb-1">No services yet</p>
              <p className="text-sm text-[#9E9585]">Add the repair services you offer so customers know what you do.</p>
              <button onClick={openAddService} className="tt-btn-gold py-2.5 px-6 rounded-xl text-sm inline-block mt-4">
                Add First Service
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((svc) => (
                <div key={svc.id} className="bg-white border border-[#EDE9E3] rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0E1520]">{svc.name}</p>
                      {svc.description && (
                        <p className="text-sm text-[#9E9585] mt-0.5">{svc.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {(svc.price_from || svc.price_to) && (
                          <span className="text-xs text-[#B09145] font-semibold">
                            {svc.price_from && svc.price_to
                              ? `$${svc.price_from} – $${svc.price_to}`
                              : svc.price_from
                              ? `From $${svc.price_from}`
                              : `Up to $${svc.price_to}`}
                          </span>
                        )}
                        {svc.duration_days && (
                          <span className="text-xs text-[#9E9585]">{svc.duration_days} day{svc.duration_days !== 1 ? "s" : ""}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => openEditService(svc)}
                        className="text-xs text-[#9E9585] hover:text-[#0E1520] border border-[#EDE9E3] px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteService(svc)}
                        className="text-xs text-red-400 hover:text-red-600 border border-red-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Showcase tab ──────────────────────────────────── */}
      {activeTab === "showcase" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-[#0E1520]">{showcase.length} item{showcase.length !== 1 ? "s" : ""}</p>
            {!showUpload && (
              <button onClick={() => setShowUpload(true)} className="tt-btn-gold py-2 px-4 rounded-xl text-xs">
                + Add Work
              </button>
            )}
          </div>

          {/* Upload form */}
          {showUpload && (
            <form onSubmit={submitShowcase} className="bg-white border border-[#EDE9E3] rounded-2xl p-5 space-y-4">
              <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[#9E9585]">New Showcase Item</p>
              {showcaseError && <p className="text-xs text-red-500">{showcaseError}</p>}

              <div>
                <label className={labelCls}>Title <span className="text-red-500">*</span></label>
                <input
                  value={showcaseForm.title}
                  onChange={(e) => setShowcaseForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Patek Philippe Cal. 27SC Full Restoration"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  rows={3}
                  value={showcaseForm.description}
                  onChange={(e) => setShowcaseForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What was done, parts replaced, issues resolved..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Watch Brand</label>
                  <input
                    value={showcaseForm.watch_brand}
                    onChange={(e) => setShowcaseForm((f) => ({ ...f, watch_brand: e.target.value }))}
                    placeholder="Rolex"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Watch Model</label>
                  <input
                    value={showcaseForm.watch_model}
                    onChange={(e) => setShowcaseForm((f) => ({ ...f, watch_model: e.target.value }))}
                    placeholder="Submariner 5513"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Image pickers */}
              <div className="grid grid-cols-2 gap-4">
                {/* Before */}
                <div>
                  <label className={labelCls}>Before Image <span className="text-red-500">*</span></label>
                  <div
                    onClick={() => beforeRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-[#EDE9E3] hover:border-[#B09145] cursor-pointer overflow-hidden flex items-center justify-center bg-[#F9F8F6] transition-colors"
                  >
                    {beforePreview ? (
                      <Image src={beforePreview} alt="Before" width={200} height={200} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <svg className="w-8 h-8 text-[#C8C0B0] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        <p className="text-xs text-[#9E9585]">Before</p>
                      </div>
                    )}
                  </div>
                  <input ref={beforeRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && pickFile("before", e.target.files[0])} />
                </div>

                {/* After */}
                <div>
                  <label className={labelCls}>After Image</label>
                  <div
                    onClick={() => afterRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-[#EDE9E3] hover:border-[#B09145] cursor-pointer overflow-hidden flex items-center justify-center bg-[#F9F8F6] transition-colors"
                  >
                    {afterPreview ? (
                      <Image src={afterPreview} alt="After" width={200} height={200} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <svg className="w-8 h-8 text-[#C8C0B0] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        <p className="text-xs text-[#9E9585]">After</p>
                      </div>
                    )}
                  </div>
                  <input ref={afterRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && pickFile("after", e.target.files[0])} />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-1">
                <button type="button" onClick={resetShowcaseForm} className="text-xs text-[#9E9585] hover:text-[#0E1520] px-4 py-2 border border-[#EDE9E3] rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={showcaseLoading} className="tt-btn-gold py-2 px-5 rounded-lg text-xs disabled:opacity-50">
                  {showcaseLoading ? "Uploading…" : "Upload"}
                </button>
              </div>
            </form>
          )}

          {/* Showcase grid */}
          {showcase.length === 0 && !showUpload ? (
            <div className="bg-white border border-[#EDE9E3] rounded-2xl py-14 px-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#F0EDE8] flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#C8C0B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <p className="font-semibold text-[#0E1520] mb-1">No showcase items yet</p>
              <p className="text-sm text-[#9E9585]">Upload before/after photos to show customers the quality of your work.</p>
              <button onClick={() => setShowUpload(true)} className="tt-btn-gold py-2.5 px-6 rounded-xl text-sm inline-block mt-4">
                Add First Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {showcase.map((item) => (
                <div key={item.id} className="bg-white border border-[#EDE9E3] rounded-2xl overflow-hidden">
                  {/* Images */}
                  <div className="grid grid-cols-2">
                    <div className="relative aspect-square">
                      <Image src={item.before_image_url} alt="Before" fill className="object-cover" />
                      <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-black/50 text-white px-1.5 py-0.5 rounded">Before</span>
                    </div>
                    <div className="relative aspect-square bg-[#F0EDE8] flex items-center justify-center">
                      {item.after_image_url ? (
                        <>
                          <Image src={item.after_image_url} alt="After" fill className="object-cover" />
                          <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-[#B09145]/80 text-white px-1.5 py-0.5 rounded">After</span>
                        </>
                      ) : (
                        <span className="text-xs text-[#C8C0B0]">No after</span>
                      )}
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#0E1520] truncate">{item.title}</p>
                        {(item.watch_brand || item.watch_model) && (
                          <p className="text-xs text-[#B09145] mt-0.5">{[item.watch_brand, item.watch_model].filter(Boolean).join(" ")}</p>
                        )}
                        {item.description && (
                          <p className="text-xs text-[#9E9585] mt-1 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteShowcaseItem(item)}
                        className="flex-shrink-0 text-xs text-red-400 hover:text-red-600 border border-red-100 px-2 py-1 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Settings tab ──────────────────────────────────── */}
      {activeTab === "settings" && (
        <form onSubmit={saveSettings} className="space-y-4">
          {settingsError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{settingsError}</div>
          )}
          {settingsSaved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">Changes saved.</div>
          )}

          {/* Basic info */}
          <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 space-y-4">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-2">Basic Info</p>
            <div>
              <label className={labelCls}>Shop Name</label>
              <input
                value={settingsForm.name}
                onChange={(e) => setSettingsForm((f) => ({ ...f, name: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                rows={4}
                value={settingsForm.description}
                onChange={(e) => setSettingsForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Tell customers about your specialties, experience, and what makes your shop unique..."
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 space-y-4">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-2">Contact</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Phone</label>
                <input
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, phone: e.target.value }))}
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, email: e.target.value }))}
                  type="email"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 space-y-4">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-2">Location</p>
            <div>
              <label className={labelCls}>Address</label>
              <input
                value={settingsForm.address}
                onChange={(e) => setSettingsForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="123 Main Street"
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>City</label>
                <input
                  value={settingsForm.city}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, city: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Country</label>
                <input
                  value={settingsForm.country}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, country: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Opening hours */}
          <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-4">Opening Hours</p>
            <div className="space-y-2">
              {DAYS.map((d) => (
                <div key={d} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-[#9E9585]">{DAY_LABELS[d]}</span>
                  <input
                    type="text"
                    value={hours[d] ?? ""}
                    onChange={(e) => setHours((h) => ({ ...h, [d]: e.target.value }))}
                    placeholder="e.g. 9:00–18:00 or Closed"
                    className="flex-1 border border-[#EDE9E3] rounded-lg px-3 py-2 text-sm text-[#0E1520] placeholder-[#C8C0B0] focus:outline-none focus:ring-2 focus:ring-[#B09145] bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={settingsSaving}
              className="tt-btn-gold py-2.5 px-7 rounded-xl text-sm disabled:opacity-50"
            >
              {settingsSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
