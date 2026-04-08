"use client";

import { useAppStore } from "@/stores/useAppStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axiosInstance";

export default function Header() {
  const { user, logout, cartCount } = useAppStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1. Call backend to clear the cookie
      await api.post("/auth/logout");
      // 2. Clear Zustand state
      logout();
      // 3. Go home
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm border-b sticky top-0 z-50">
      <Link href="/" className="text-xl font-bold text-[#00997a]">
        Grosur
      </Link>

      <nav className="flex items-center gap-6">
        {user ? (
          <>
            {/* Conditional Admin Link */}
            {(user.role === "SUPER_ADMIN" || user.role === "STORE_ADMIN") && (
              <Link href="/admin/dashboard" className="text-sm font-medium hover:text-[#00997a]">
                Dashboard
              </Link>
            )}

            <Link href="/cart" className="relative text-sm font-medium hover:text-[#00997a] flex items-center gap-1">
              Keranjang
              {cartCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link href="/profile" className="text-sm font-medium hover:text-[#00997a]">
              {user.email}
            </Link>

            <button
              onClick={handleLogout}
              className="text-sm font-bold text-red-500 hover:underline"
            >
              Keluar
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm font-medium hover:text-[#00997a]">
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-bold text-white bg-[#00997a] rounded-md hover:bg-[#008066]"
            >
              Daftar
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}