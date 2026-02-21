import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0E1520] flex items-center justify-center p-4">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#132A24_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <Link href="/listings" className="inline-block group">
            <span className="font-display italic text-3xl text-white tracking-tight group-hover:text-[#C8A96E] transition-colors">
              TimeTrader
            </span>
            <span className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#B09145] mt-0.5">
              Luxury Watch Marketplace
            </span>
          </Link>
        </div>

        {/* Gold divider */}
        <div className="flex items-center justify-center mb-8">
          <div className="h-px w-16 bg-[#B09145]/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#B09145] mx-3" />
          <div className="h-px w-16 bg-[#B09145]/40" />
        </div>

        {children}
      </div>
    </div>
  );
}
