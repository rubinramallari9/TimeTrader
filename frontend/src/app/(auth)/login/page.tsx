"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/auth";
import { AxiosError } from "axios";

const schema = z.object({
  email: z.string().min(1, "Enter your email or username"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

const inputCls =
  "w-full bg-[#0E1520] border border-[#1E2D40] rounded-lg px-4 py-3 text-sm text-white placeholder-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#B09145] focus:border-transparent transition-shadow";

const labelCls = "block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-1.5";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/listings";
  const { login, isLoading } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
      const { user } = useAuthStore.getState();
      if (user?.role === "store" && from === "/listings") router.push("/dashboard/store");
      else if (user?.role === "repair" && from === "/listings") router.push("/dashboard/repairs");
      else router.push(from);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string; non_field_errors?: string[] }>;
      const msg =
        axiosErr.response?.data?.message ??
        axiosErr.response?.data?.non_field_errors?.[0] ??
        "Login failed. Please try again.";
      setServerError(msg);
    }
  };

  return (
    <div className="bg-[#161E2E] border border-[#1E2D40] rounded-2xl p-8 shadow-2xl shadow-black/40">
      <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
      <p className="text-sm text-[#9E9585] mb-6">Sign in to your TimeTrader account</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm rounded-lg px-4 py-3">
            {serverError}
          </div>
        )}

        <div>
          <label className={labelCls}>Email or Username</label>
          <input
            {...register("email")}
            type="text"
            autoComplete="username"
            className={inputCls}
            placeholder="you@example.com or watchcollector42"
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className={labelCls}>Password</label>
          <input
            {...register("password")}
            type="password"
            autoComplete="current-password"
            className={inputCls}
            placeholder="••••••••"
          />
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex justify-end">
          <Link href="/reset-password" className="text-[10px] font-semibold tracking-widest uppercase text-[#9E9585] hover:text-[#B09145] transition-colors">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="tt-btn-gold w-full py-3 rounded-lg text-sm disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#1E2D40]" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 text-[10px] text-[#4A5568] bg-[#161E2E] tracking-widest uppercase">or</span>
        </div>
      </div>

      <p className="text-center text-sm text-[#9E9585]">
        New to TimeTrader?{" "}
        <Link href="/register" className="font-semibold text-[#B09145] hover:text-[#C8A96E] transition-colors">
          Create account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-[#161E2E] border border-[#1E2D40] rounded-2xl p-8 h-96 animate-pulse" />}>
      <LoginForm />
    </Suspense>
  );
}
