"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/auth";
import { usersApi } from "@/lib/auth-api";
import { AxiosError } from "axios";

const schema = z.object({
  username:   z.string().min(3).max(30).regex(/^\w+$/),
  first_name: z.string().min(1, "Required"),
  last_name:  z.string().min(1, "Required"),
  phone:      z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const ROLE_LABELS: Record<string, string> = {
  buyer:  "Buyer",
  seller: "Seller",
  store:  "Store Owner",
  repair: "Repair Shop",
  admin:  "Admin",
};

const inputCls =
  "w-full border border-[#EDE9E3] rounded-lg px-4 py-3 text-sm text-[#0E1520] placeholder-[#C8C0B0] focus:outline-none focus:ring-2 focus:ring-[#B09145] focus:border-transparent transition-shadow bg-white";

const labelCls = "block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-1.5";

export default function ProfilePage() {
  const router                        = useRouter();
  const { user, updateMe, fetchMe, logout, isLoading, isInitialized } = useAuthStore();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Avatar state
  const avatarRef                         = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError]     = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username:   user?.username ?? "",
      first_name: user?.first_name ?? "",
      last_name:  user?.last_name ?? "",
      phone:      user?.phone ?? "",
    },
  });

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) router.push("/login");
  }, [isInitialized, user, router]);

  if (!isInitialized || !user) return null;

  const currentAvatar = avatarPreview ?? user.avatar_url ?? null;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview immediately
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarError(null);
    setAvatarUploading(true);
    try {
      await usersApi.uploadAvatar(file);
      await fetchMe(); // refresh user in store so navbar updates
    } catch {
      setAvatarError("Failed to upload photo. Try again.");
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setSaveSuccess(false);
    try {
      await updateMe(data);
      setSaveSuccess(true);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setServerError(axiosErr.response?.data?.message ?? "Failed to update profile.");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <p className="tt-section-label text-[#B09145] mb-1">Account</p>
        <h1 className="font-display italic text-3xl text-[#0E1520]">My Profile</h1>
      </div>

      {/* Avatar + name card */}
      <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 mb-4 flex items-center gap-5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            onClick={() => avatarRef.current?.click()}
            className="w-20 h-20 rounded-full overflow-hidden bg-[#F0EDE8] cursor-pointer ring-2 ring-[#EDE9E3] hover:ring-[#B09145] transition-all"
          >
            {currentAvatar ? (
              <Image
                src={currentAvatar}
                alt="Profile photo"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#B09145] bg-[#B09145]/10">
                {user.username[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Upload overlay */}
          <button
            type="button"
            onClick={() => avatarRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#B09145] flex items-center justify-center shadow-md hover:bg-[#C8A96E] transition-colors"
            aria-label="Change photo"
          >
            {avatarUploading ? (
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

          <input
            ref={avatarRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#0E1520]">{user.full_name || user.username}</p>
          <p className="text-sm text-[#9E9585] truncate">{user.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F0EDE8] text-[#9E9585] border border-[#EDE9E3]">
              {ROLE_LABELS[user.role]}
            </span>
            {user.is_verified && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {avatarError && (
        <p className="text-xs text-red-500 mb-4 px-1">{avatarError}</p>
      )}

      <p className="text-[11px] text-[#9E9585] mb-6 px-1">
        Click your photo to upload a new one. JPG or PNG, max 5 MB.
      </p>

      {/* Profile form */}
      <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 mb-4">
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-5">Personal Info</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {serverError}
            </div>
          )}
          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3">
              Profile updated.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>First name</label>
              <input {...register("first_name")} className={inputCls} />
              {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Last name</label>
              <input {...register("last_name")} className={inputCls} />
              {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>}
            </div>
          </div>

          <div>
            <label className={labelCls}>Username</label>
            <input {...register("username")} className={inputCls} />
            {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Phone</label>
            <input {...register("phone")} type="tel" placeholder="+1 (555) 000-0000" className={inputCls} />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading || !isDirty}
              className="tt-btn-gold py-2.5 px-7 rounded-xl text-sm disabled:opacity-50"
            >
              {isLoading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Sign out */}
      <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6">
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-4">Account</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#0E1520]">Sign out</p>
            <p className="text-xs text-[#9E9585] mt-0.5">You will be redirected to the login page.</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-600 font-semibold border border-red-200 hover:border-red-300 px-4 py-2 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
