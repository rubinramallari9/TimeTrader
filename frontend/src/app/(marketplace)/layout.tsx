import Navbar from "@/components/shared/Navbar";

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F6F2]">
      <Navbar />
      <div className="pt-16">{children}</div>
    </div>
  );
}
