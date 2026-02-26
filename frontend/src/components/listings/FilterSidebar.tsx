"use client";

import { ListingFilters, ListingCondition, MovementType } from "@/types";

const CONDITIONS: { value: ListingCondition; label: string }[] = [
  { value: "new", label: "New" },
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

const MOVEMENTS: { value: MovementType; label: string }[] = [
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
  { value: "quartz", label: "Quartz" },
  { value: "solar", label: "Solar" },
];

const inputCls =
  "w-full border border-[#EDE9E3] rounded-lg px-3 py-1.5 text-sm bg-white text-[#0E1520] placeholder-[#C8C0B0] focus:outline-none focus:ring-2 focus:ring-[#B09145] focus:border-transparent transition-shadow";

interface Props {
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
  onClear: () => void;
}

export default function FilterSidebar({ filters, onChange, onClear }: Props) {
  const toggle = <T extends string>(arr: T[] | undefined, value: T): T[] => {
    const current = arr ?? [];
    return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
  };

  return (
    <aside className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#0E1520]">Filters</h2>
        <button onClick={onClear} className="text-[10px] font-semibold tracking-widest uppercase text-[#B09145] hover:text-[#C8A96E] transition-colors">
          Clear all
        </button>
      </div>

      {/* Price range */}
      <div>
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-2">Price (USD)</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.min_price ?? ""}
            onChange={(e) => onChange({ ...filters, min_price: e.target.value ? Number(e.target.value) : undefined })}
            className={inputCls}
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.max_price ?? ""}
            onChange={(e) => onChange({ ...filters, max_price: e.target.value ? Number(e.target.value) : undefined })}
            className={inputCls}
          />
        </div>
      </div>

      {/* Brand */}
      <div>
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-2">Brand</p>
        <input
          type="text"
          placeholder="e.g. Rolex, Omega..."
          value={filters.brand ?? ""}
          onChange={(e) => onChange({ ...filters, brand: e.target.value || undefined })}
          className={inputCls}
        />
      </div>

      {/* Condition */}
      <div>
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-2">Condition</p>
        <div className="space-y-1.5">
          {CONDITIONS.map((c) => (
            <label key={c.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.condition?.includes(c.value) ?? false}
                onChange={() => onChange({ ...filters, condition: toggle(filters.condition, c.value) })}
                className="rounded border-[#C8C0B0] text-[#B09145] focus:ring-[#B09145]"
              />
              <span className="text-sm text-[#9E9585] group-hover:text-[#0E1520] transition-colors">{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Movement */}
      <div>
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-2">Movement</p>
        <div className="space-y-1.5">
          {MOVEMENTS.map((m) => (
            <label key={m.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.movement_type?.includes(m.value) ?? false}
                onChange={() => onChange({ ...filters, movement_type: toggle(filters.movement_type, m.value) })}
                className="rounded border-[#C8C0B0] text-[#B09145] focus:ring-[#B09145]"
              />
              <span className="text-sm text-[#9E9585] group-hover:text-[#0E1520] transition-colors">{m.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9E9585] mb-2">Location</p>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="City"
            value={filters.city ?? ""}
            onChange={(e) => onChange({ ...filters, city: e.target.value || undefined })}
            className={inputCls}
          />
          <input
            type="text"
            placeholder="Country"
            value={filters.country ?? ""}
            onChange={(e) => onChange({ ...filters, country: e.target.value || undefined })}
            className={inputCls}
          />
        </div>
      </div>
    </aside>
  );
}
