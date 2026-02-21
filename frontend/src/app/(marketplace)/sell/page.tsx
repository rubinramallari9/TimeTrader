"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { listingsApi } from "@/lib/listings-api";
import { useAuthStore } from "@/store/auth";
import { AxiosError } from "axios";

const schema = z.object({
  title: z.string().min(5, "At least 5 characters"),
  brand: z.string().min(1, "Required"),
  model: z.string().min(1, "Required"),
  reference_number: z.string().optional(),
  year: z.number().min(1900).max(new Date().getFullYear()).optional().or(z.literal("")),
  condition: z.enum(["new", "excellent", "good", "fair", "poor"]),
  movement_type: z.enum(["automatic", "manual", "quartz", "solar"]).optional().or(z.literal("")),
  case_material: z.string().optional(),
  case_diameter_mm: z.number().min(10).max(60).optional().or(z.literal("")),
  price: z.number({ message: "Enter a valid price" }).positive("Must be greater than 0"),
  currency: z.string(),
  description: z.string().optional(),
  location_city: z.string().optional(),
  location_country: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SellPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: "USD", condition: "excellent" },
  });

  if (!user || (user.role !== "seller" && user.role !== "store" && user.role !== "admin")) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Only sellers and store owners can list watches.</p>
      </div>
    );
  }

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const combined = [...images, ...files].slice(0, 10);
    setImages(combined);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (i: number) => {
    const next = images.filter((_, idx) => idx !== i);
    setImages(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        year: data.year === "" ? undefined : data.year,
        case_diameter_mm: data.case_diameter_mm === "" ? undefined : data.case_diameter_mm,
        movement_type: data.movement_type === "" ? undefined : data.movement_type,
      };
      const { data: listing } = await listingsApi.create(payload as Parameters<typeof listingsApi.create>[0]);

      // Upload images sequentially
      for (const img of images) {
        await listingsApi.uploadImage(listing.id, img);
      }

      router.push(`/listings/${listing.id}`);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string; fields?: Record<string, string[]> }>;
      const fields = axiosErr.response?.data?.fields;
      const firstField = fields ? Object.values(fields)[0]?.[0] : null;
      setServerError(firstField ?? axiosErr.response?.data?.message ?? "Failed to create listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">List a Watch</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{serverError}</div>
        )}

        {/* Images */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Photos</h2>
          <p className="text-xs text-gray-400 mb-4">Up to 10 photos. First photo will be the cover.</p>
          <div className="grid grid-cols-4 gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <Image src={src} alt="" fill className="object-cover" sizes="100px" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full text-white text-xs flex items-center justify-center"
                >
                  ×
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                    Cover
                  </span>
                )}
              </div>
            ))}
            {previews.length < 10 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onImageChange} />
        </div>

        {/* Basic info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Listing title</label>
            <input {...register("title")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="e.g. Rolex Submariner 116610LN" />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input {...register("brand")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Rolex" />
              {errors.brand && <p className="text-xs text-red-600 mt-1">{errors.brand.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input {...register("model")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Submariner" />
              {errors.model && <p className="text-xs text-red-600 mt-1">{errors.model.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference No.</label>
              <input {...register("reference_number")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="116610LN" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input {...register("year", { valueAsNumber: true })} type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="2021" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
            <select {...register("condition")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
              <option value="new">New</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Movement</label>
              <select {...register("movement_type")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
                <option value="">— Select —</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
                <option value="quartz">Quartz</option>
                <option value="solar">Solar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Case Material</label>
              <input {...register("case_material")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Stainless Steel" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register("description")} rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" placeholder="Describe the watch, its history, any included accessories..." />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing</h2>
          <div className="flex gap-3">
            <select {...register("currency")} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CHF">CHF</option>
              <option value="AED">AED</option>
            </select>
            <div className="flex-1">
              <input {...register("price", { valueAsNumber: true })} type="number" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="0.00" />
              {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Location</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input {...register("location_city")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Dubai" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input {...register("location_country")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="UAE" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gray-900 text-white py-3.5 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Publishing..." : "Publish Listing"}
        </button>
      </form>
    </div>
  );
}
