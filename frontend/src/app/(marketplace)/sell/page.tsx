"use client";

import { useState, useRef, useEffect } from "react";
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

const inputCls =
  "w-full border border-[#EDE9E3] rounded-lg px-3 py-2.5 text-sm bg-white text-[#0E1520] placeholder-[#C8C0B0] focus:outline-none focus:ring-2 focus:ring-[#B09145] focus:border-transparent transition-shadow";

const labelCls = "block text-[10px] font-semibold tracking-[0.1em] uppercase text-[#9E9585] mb-1.5";

const sectionCls = "bg-white border border-[#EDE9E3] rounded-2xl p-6 space-y-4";

export default function SellPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: "USD", condition: "excellent" },
  });

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) router.push("/login?from=/sell");
  }, [isInitialized, user, router]);

  if (!isInitialized || !user) return null;

  if (user.role !== "seller" && user.role !== "store" && user.role !== "admin") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="font-display italic text-2xl text-[#9E9585] mb-2">Access restricted</p>
        <p className="text-sm text-[#9E9585]">Only sellers and store owners can list watches.</p>
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
      <div className="mb-8">
        <p className="tt-section-label text-[#B09145] mb-2">Seller Portal</p>
        <h1 className="font-display italic text-4xl text-[#0E1520]">List a Timepiece</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{serverError}</div>
        )}

        {/* Images */}
        <div className={sectionCls}>
          <div>
            <h2 className="font-semibold text-[#0E1520] mb-0.5">Photos</h2>
            <p className="text-xs text-[#9E9585]">Up to 10 photos. First photo will be the cover image.</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#F0EDE8] border border-[#EDE9E3]">
                <Image src={src} alt="" fill className="object-cover" sizes="100px" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full text-white text-xs flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  ×
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 text-[10px] bg-[#B09145] text-white px-1.5 py-0.5 rounded font-semibold">
                    Cover
                  </span>
                )}
              </div>
            ))}
            {previews.length < 10 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-[#EDE9E3] hover:border-[#B09145] flex items-center justify-center text-[#C8C0B0] hover:text-[#B09145] transition-colors"
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
        <div className={sectionCls}>
          <h2 className="font-semibold text-[#0E1520]">Details</h2>

          <div>
            <label className={labelCls}>Listing title</label>
            <input {...register("title")} className={inputCls} placeholder="e.g. Rolex Submariner 116610LN" />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Brand</label>
              <input {...register("brand")} className={inputCls} placeholder="Rolex" />
              {errors.brand && <p className="text-xs text-red-600 mt-1">{errors.brand.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Model</label>
              <input {...register("model")} className={inputCls} placeholder="Submariner" />
              {errors.model && <p className="text-xs text-red-600 mt-1">{errors.model.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Reference No.</label>
              <input {...register("reference_number")} className={inputCls} placeholder="116610LN" />
            </div>
            <div>
              <label className={labelCls}>Year</label>
              <input {...register("year", { valueAsNumber: true })} type="number" className={inputCls} placeholder="2021" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Condition</label>
            <select {...register("condition")} className={inputCls}>
              <option value="new">New</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Movement</label>
              <select {...register("movement_type")} className={inputCls}>
                <option value="">— Select —</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
                <option value="quartz">Quartz</option>
                <option value="solar">Solar</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Case Material</label>
              <input {...register("case_material")} className={inputCls} placeholder="Stainless Steel" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Case Diameter (mm)</label>
            <input {...register("case_diameter_mm", { valueAsNumber: true })} type="number" className={inputCls} placeholder="41" />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              {...register("description")}
              rows={4}
              className={`${inputCls} resize-none`}
              placeholder="Describe the watch, its history, any included accessories..."
            />
          </div>
        </div>

        {/* Pricing */}
        <div className={sectionCls}>
          <h2 className="font-semibold text-[#0E1520]">Pricing</h2>
          <div className="flex gap-3">
            <select {...register("currency")} className="border border-[#EDE9E3] rounded-lg px-3 py-2.5 text-sm bg-white text-[#0E1520] focus:outline-none focus:ring-2 focus:ring-[#B09145] cursor-pointer">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CHF">CHF</option>
              <option value="AED">AED</option>
            </select>
            <div className="flex-1">
              <input
                {...register("price", { valueAsNumber: true })}
                type="number"
                step="0.01"
                className={inputCls}
                placeholder="0.00"
              />
              {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className={sectionCls}>
          <h2 className="font-semibold text-[#0E1520]">Location</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>City</label>
              <input {...register("location_city")} className={inputCls} placeholder="Dubai" />
            </div>
            <div>
              <label className={labelCls}>Country</label>
              <input {...register("location_country")} className={inputCls} placeholder="UAE" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="tt-btn-gold w-full py-4 rounded-xl text-sm disabled:opacity-50"
        >
          {isSubmitting ? "Publishing..." : "Publish Listing"}
        </button>
      </form>
    </div>
  );
}
