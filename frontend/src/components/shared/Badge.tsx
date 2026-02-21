import { ListingCondition } from "@/types";

const CONDITION_STYLES: Record<ListingCondition, string> = {
  new: "bg-emerald-100 text-emerald-800",
  excellent: "bg-blue-100 text-blue-800",
  good: "bg-yellow-100 text-yellow-800",
  fair: "bg-orange-100 text-orange-800",
  poor: "bg-red-100 text-red-800",
};

export function ConditionBadge({ condition }: { condition: ListingCondition }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${CONDITION_STYLES[condition]}`}>
      {condition}
    </span>
  );
}

export function AuthBadge() {
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 1l2.39 4.843 5.344.777-3.867 3.769.913 5.322L10 13.347l-4.78 2.514.913-5.322L2.266 6.62l5.344-.777L10 1z" clipRule="evenodd" />
      </svg>
      Authenticated
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-blue-600">
      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      Verified
    </span>
  );
}
