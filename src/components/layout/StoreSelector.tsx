"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { api } from "@/lib/axiosInstance";
import { 
  FiMapPin, 
  FiChevronDown, 
  FiCheck, 
  FiLoader,
  FiSearch
} from "react-icons/fi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Store {
  id: string;
  name: string;
  city: string;
}

export default function StoreSelector() {
  const { currentStore, setCurrentStore, isManualStore } = useAppStore();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/stores");
      setStores(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && stores.length === 0) {
      fetchStores();
    }
  }, [isOpen]);

  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (store: Store) => {
    setCurrentStore({ id: store.id, name: store.name }, true);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-all group">
          <FiMapPin className="text-primary shrink-0" size={14} />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Lokasi Belanja
            </span>
            <span className="text-sm font-bold text-foreground flex items-center gap-1">
              {currentStore?.name || "Pilih Toko"}
              <FiChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
            </span>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-4 border-b">
          <h3 className="font-bold text-sm">Pilih Lokasi Belanja</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Produk dan stok menyesuaikan dengan toko yang Anda pilih.
          </p>
          <div className="relative mt-3">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <input
              type="text"
              placeholder="Cari toko atau kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-muted/50 border rounded-md outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <FiLoader className="animate-spin text-primary" size={20} />
              <p className="text-xs text-muted-foreground">Memuat daftar toko...</p>
            </div>
          ) : filteredStores.length > 0 ? (
            <div className="py-2">
              {filteredStores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => handleSelect(store)}
                  className="w-full px-4 py-3 text-left hover:bg-primary/5 flex items-center justify-between group transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                      {store.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {store.city}
                    </p>
                  </div>
                  {currentStore?.id === store.id && (
                    <FiCheck className="text-primary" size={16} />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">Toko tidak ditemukan.</p>
            </div>
          )}
        </div>
        <div className="p-4 bg-muted/30 border-t">
          {isManualStore ? (
            <button 
              onClick={() => {
                setCurrentStore(null, false);
                setIsOpen(false);
              }}
              className="text-xs text-primary font-bold hover:underline"
            >
              Gunakan lokasi terdekat otomatis
            </button>
          ) : (
            <p className="text-[10px] text-muted-foreground">
              <FiMapPin className="inline mr-1" />
              Menggunakan toko terdekat dari lokasi Anda.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
