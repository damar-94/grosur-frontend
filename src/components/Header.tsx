// src/components/Header.tsx
import { useAppStore } from "@/store/useAppStore";

export default function Header() {
  const nearestStore = useAppStore((state) => state.nearestStore);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="flex items-center justify-between p-4 bg-[#00997a] text-white">
        <div className="text-xs">
          <p className="opacity-90">Dikirim ke:</p>
          <p className="font-bold text-sm truncate w-48">
            {nearestStore ? nearestStore.name : "Mencari lokasi terdekat..."}
          </p>
        </div>
        <button aria-label="Cart" className="text-xl">🛒</button>
      </div>
      <div className="p-3 bg-white">
        <input
          type="text"
          placeholder="Cari sayur, buah, daging..."
          className="w-full p-2 text-sm bg-[#f3f5f7] text-[#1a1a1a] placeholder-[#8e8e8e] border-none rounded-md focus:ring-2 focus:ring-[#59cfb7] outline-none"
        />
      </div>
    </header>
  );
}