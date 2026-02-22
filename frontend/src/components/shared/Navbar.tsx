"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/listings", label: "Browse" },
  { href: "/stores", label: "Stores" },
  { href: "/repairs", label: "Repairs" },
  { href: "/authenticate", label: "Authenticate" },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#user-menu")) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0E1520]/95 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-[#0E1520]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/listings" className="flex items-center gap-2 group">
          <span className="font-display italic text-2xl text-white tracking-tight group-hover:text-[#C8A96E] transition-colors">
            TimeTrader
          </span>
          <span className="hidden sm:block text-[10px] font-semibold tracking-[0.15em] uppercase text-[#B09145] mt-1">
            Luxury Watches
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-xs font-semibold tracking-[0.12em] uppercase transition-colors ${
                pathname.startsWith(href)
                  ? "text-[#B09145]"
                  : "text-[#9E9585] hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {(user.role === "seller" || user.role === "store" || user.role === "admin") && (
                <Link href="/sell" className="hidden sm:inline-flex tt-btn-gold text-xs py-2 px-4">
                  + List Watch
                </Link>
              )}

              {/* User menu */}
              <div id="user-menu" className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-[#B09145] flex items-center justify-center text-xs font-bold uppercase text-white">
                    {user.username[0]}
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-11 w-48 bg-[#0E1520] border border-[#1E2D40] rounded-xl shadow-2xl py-1.5">
                    <div className="px-4 py-2 border-b border-[#1E2D40]">
                      <p className="text-xs font-semibold text-white truncate">{user.username}</p>
                      <p className="text-[10px] text-[#9E9585] truncate">{user.email}</p>
                    </div>
                    <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-xs text-[#9E9585] hover:text-white hover:bg-white/5 transition-colors">Profile</Link>
                    <Link href="/listings/saved" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-xs text-[#9E9585] hover:text-white hover:bg-white/5 transition-colors">Saved Watches</Link>
                    <hr className="my-1 border-[#1E2D40]" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors">
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-xs font-semibold tracking-wider uppercase text-[#9E9585] hover:text-white transition-colors hidden sm:block">
                Sign in
              </Link>
              <Link href="/register" className="tt-btn-gold text-xs py-2 px-4">
                Join
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-[#9E9585] hover:text-white p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0E1520] border-t border-[#1E2D40] px-4 py-4 space-y-3">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="block text-xs font-semibold tracking-[0.12em] uppercase text-[#9E9585] hover:text-white py-2"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
