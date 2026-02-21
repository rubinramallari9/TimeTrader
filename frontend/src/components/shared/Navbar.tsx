"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/listings" className="text-xl font-bold text-gray-900 tracking-tight">
          Adriel
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/listings" className="hover:text-gray-900 transition-colors">Browse</Link>
          <Link href="/stores" className="hover:text-gray-900 transition-colors">Stores</Link>
          <Link href="/repairs" className="hover:text-gray-900 transition-colors">Repairs</Link>
          <Link href="/authenticate" className="hover:text-gray-900 transition-colors">Authenticate</Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {(user.role === "seller" || user.role === "store") && (
                <Link
                  href="/sell"
                  className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  + List Watch
                </Link>
              )}
              <div className="relative group">
                <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold uppercase">
                    {user.username[0]}
                  </div>
                </button>
                <div className="absolute right-0 top-10 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 hidden group-hover:block z-50">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                  <Link href="/listings/saved" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Saved</Link>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                    Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
              <Link href="/register" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
