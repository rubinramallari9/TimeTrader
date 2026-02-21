"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/auth";
import { AxiosError } from "axios";

type PublicRole = "buyer" | "seller" | "store" | "repair";

const ROLES: { value: PublicRole; label: string; description: string; icon: string }[] = [
  { value: "buyer", label: "Buyer", description: "Browse & purchase", icon: "🛒" },
  { value: "seller", label: "Seller", description: "List watches for sale", icon: "🏷️" },
  { value: "store", label: "Watch Store", description: "Advertise your store", icon: "🏪" },
  { value: "repair", label: "Repair Shop", description: "Offer repair services", icon: "🔧" },
];

const schema = z
  .object({
    email: z.string().email("Enter a valid email"),
    username: z.string().min(3, "At least 3 characters").max(30, "Max 30 characters").regex(/^\w+$/, "Only letters, numbers, underscores"),
    first_name: z.string().min(1, "Required"),
    last_name: z.string().min(1, "Required"),
    role: z.enum(["buyer", "seller", "store", "repair"] as const),
    password: z.string().min(8, "At least 8 characters"),
    password_confirm: z.string(),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: "Passwords do not match",
    path: ["password_confirm"],
  });

type FormData = z.infer<typeof schema>;

const inputCls =
  "w-full bg-[#0E1520] border border-[#1E2D40] rounded-lg px-4 py-3 text-sm text-white placeholder-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#B09145] focus:border-transparent transition-shadow";

const labelCls = "block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-1.5";

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "buyer" },
  });

  const selectedRole = watch("role") as PublicRole;

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await registerUser(data);
      setSuccess(true);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string; fields?: Record<string, string[]> }>;
      const fields = axiosErr.response?.data?.fields;
      const firstField = fields ? Object.values(fields)[0]?.[0] : null;
      setServerError(firstField ?? axiosErr.response?.data?.message ?? "Registration failed.");
    }
  };

  if (success) {
    return (
      <div className="bg-[#161E2E] border border-[#1E2D40] rounded-2xl p-8 shadow-2xl shadow-black/40 text-center">
        <div className="w-14 h-14 rounded-full bg-[#B09145]/10 border border-[#B09145]/30 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[#B09145]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Verify your email</h2>
        <p className="text-sm text-[#9E9585] mb-6">
          We sent a verification link to your email address. Click it to activate your account.
        </p>
        <Link
          href="/login"
          className="tt-btn-gold inline-block py-2.5 px-6 rounded-lg text-sm"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#161E2E] border border-[#1E2D40] rounded-2xl p-8 shadow-2xl shadow-black/40">
      <h2 className="text-xl font-semibold text-white mb-1">Join TimeTrader</h2>
      <p className="text-sm text-[#9E9585] mb-6">Create your account to get started</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm rounded-lg px-4 py-3">
            {serverError}
          </div>
        )}

        {/* Role selector */}
        <div>
          <label className={labelCls}>I am a...</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setValue("role", r.value)}
                className={`text-left p-3 rounded-xl border transition-all duration-200 ${
                  selectedRole === r.value
                    ? "border-[#B09145] bg-[#B09145]/10"
                    : "border-[#1E2D40] hover:border-[#2A3A50]"
                }`}
              >
                <span className="text-base mb-1 block">{r.icon}</span>
                <span className="font-semibold text-xs text-white block">{r.label}</span>
                <span className="text-[10px] text-[#9E9585]">{r.description}</span>
              </button>
            ))}
          </div>
          {errors.role && <p className="text-xs text-red-400 mt-1">{errors.role.message}</p>}
        </div>

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>First name</label>
            <input {...register("first_name")} className={inputCls} />
            {errors.first_name && <p className="text-xs text-red-400 mt-1">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Last name</label>
            <input {...register("last_name")} className={inputCls} />
            {errors.last_name && <p className="text-xs text-red-400 mt-1">{errors.last_name.message}</p>}
          </div>
        </div>

        <div>
          <label className={labelCls}>Username</label>
          <input
            {...register("username")}
            className={inputCls}
            placeholder="watchcollector42"
          />
          {errors.username && <p className="text-xs text-red-400 mt-1">{errors.username.message}</p>}
        </div>

        <div>
          <label className={labelCls}>Email</label>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            className={inputCls}
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className={labelCls}>Password</label>
          <input
            {...register("password")}
            type="password"
            autoComplete="new-password"
            className={inputCls}
          />
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className={labelCls}>Confirm password</label>
          <input
            {...register("password_confirm")}
            type="password"
            autoComplete="new-password"
            className={inputCls}
          />
          {errors.password_confirm && (
            <p className="text-xs text-red-400 mt-1">{errors.password_confirm.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="tt-btn-gold w-full py-3 rounded-lg text-sm disabled:opacity-50 mt-2"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-[#9E9585] mt-6">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#B09145] hover:text-[#C8A96E] transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
