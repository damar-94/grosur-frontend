// src/components/Header.tsx
import { useAppStore } from "@/store/useAppStore";
import Link from "next/link";

export default function Header() {
  const { nearestStore, user, logout } = useAppStore();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="flex items-center justify-between p-4 bg-[#00997a] text-white">
        
        {/* Location Section */}
        <div className="text-xs">
          <p className="opacity-90">Dikirim ke:</p>
          <p className="font-bold text-sm truncate w-32 md:w-48">
            {nearestStore ? nearestStore.name : "Mencari lokasi..."}
          </p>
        </div>

        {/* Auth & Cart Section */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-2 text-xs">
              <span className="hidden md:inline font-medium">Hai, {user.email.split('@')[0]}</span>
              <button onClick={logout} className="opacity-80 hover:opacity-100 transition-opacity">Keluar</button>
            </div>
          ) : (
            <Link href="/login" className="bg-white text-[#00997a] px-3 py-1 rounded-full text-xs font-bold hover:bg-[#f3f5f7] transition-colors">
              Masuk
            </Link>
          )}
          <button aria-label="Cart" className="text-xl">🛒</button>
        </div>

      </div>

      {/* Search Bar */}
      <div className="p-3 bg-white border-b border-[#f3f5f7]">
        <input
          type="text"
          placeholder="Cari sayur, buah, daging..."
          className="w-full p-2.5 text-sm bg-[#f3f5f7] text-[#1a1a1a] placeholder-[#8e8e8e] border-none rounded-md focus:ring-2 focus:ring-[#59cfb7] outline-none"
        />
      </div>
    </header>
  );
}