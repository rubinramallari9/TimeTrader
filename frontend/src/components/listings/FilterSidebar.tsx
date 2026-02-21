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
        <h2 className="font-semibold text-gray-900">Filters</h2>
        <button onClick={onClear} className="text-xs text-gray-500 hover:text-gray-900 underline">
          Clear all
        </button>
      </div>

      {/* Price range */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Price</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.min_price ?? ""}
            onChange={(e) => onChange({ ...filters, min_price: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.max_price ?? ""}
            onChange={(e) => onChange({ ...filters, max_price: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      {/* Brand */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Brand</p>
        <input
          type="text"
          placeholder="e.g. Rolex, Omega..."
          value={filters.brand ?? ""}
          onChange={(e) => onChange({ ...filters, brand: e.target.value || undefined })}
          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      {/* Condition */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Condition</p>
        <div className="space-y-1.5">
          {CONDITIONS.map((c) => (
            <label key={c.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.condition?.includes(c.value) ?? false}
                onChange={() => onChange({ ...filters, condition: toggle(filters.condition, c.value) })}
                className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span className="text-sm text-gray-700">{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Movement */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Movement</p>
        <div className="space-y-1.5">
          {MOVEMENTS.map((m) => (
            <label key={m.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.movement_type?.includes(m.value) ?? false}
                onChange={() => onChange({ ...filters, movement_type: toggle(filters.movement_type, m.value) })}
                className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span className="text-sm text-gray-700">{m.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Authenticated only */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.is_authenticated ?? false}
            onChange={(e) => onChange({ ...filters, is_authenticated: e.target.checked || undefined })}
            className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
          />
          <span className="text-sm font-medium text-gray-700">Authenticated only</span>
        </label>
      </div>

      {/* Location */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Location</p>
        <input
          type="text"
          placeholder="City"
          value={filters.city ?? ""}
          onChange={(e) => onChange({ ...filters, city: e.target.value || undefined })}
          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 mb-2"
        />
        <input
          type="text"
          placeholder="Country"
          value={filters.country ?? ""}
          onChange={(e) => onChange({ ...filters, country: e.target.value || undefined })}
          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>
    </aside>
  );
}
