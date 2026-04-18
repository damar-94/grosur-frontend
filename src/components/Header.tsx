"use client";

import { useAppStore } from "@/stores/useAppStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axiosInstance";
import { ShoppingCart } from "lucide-react";

export default function Header() {
  const { user, logout, cartCount } = useAppStore();
  const router = useRouter();

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

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

            <Link href="/vouchers" className="text-sm font-bold text-amber-600 hover:text-amber-700">
              Klaim Voucher
            </Link>

            <Link href="/checkout" className="relative p-2 text-gray-600 hover:text-[#00997a] transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white translate-x-1/3 -translate-y-1/3">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
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