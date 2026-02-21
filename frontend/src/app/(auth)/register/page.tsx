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

const ROLES: { value: PublicRole; label: string; description: string }[] = [
  { value: "buyer", label: "Buyer", description: "Browse and purchase watches" },
  { value: "seller", label: "Seller", description: "List watches for sale" },
  { value: "store", label: "Watch Store", description: "Advertise your store" },
  { value: "repair", label: "Repair Shop", description: "Offer repair services" },
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h2>
        <p className="text-sm text-gray-500">
          We sent a verification link to your email. Click it to activate your account.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-gray-900 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Create account</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {serverError}
          </div>
        )}

        {/* Role selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setValue("role", r.value)}
                className={`text-left p-3 rounded-lg border text-sm transition-colors ${
                  selectedRole === r.value
                    ? "border-gray-900 bg-gray-50"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <span className="font-medium block">{r.label}</span>
                <span className="text-xs text-gray-500">{r.description}</span>
              </button>
            ))}
          </div>
          {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role.message}</p>}
        </div>

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
            <input
              {...register("first_name")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            {errors.first_name && <p className="text-xs text-red-600 mt-1">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
            <input
              {...register("last_name")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            {errors.last_name && <p className="text-xs text-red-600 mt-1">{errors.last_name.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            {...register("username")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="watchcollector42"
          />
          {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            {...register("password")}
            type="password"
            autoComplete="new-password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
          <input
            {...register("password_confirm")}
            type="password"
            autoComplete="new-password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          {errors.password_confirm && (
            <p className="text-xs text-red-600 mt-1">{errors.password_confirm.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors mt-2"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-gray-900 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
