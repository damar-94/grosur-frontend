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

interface Address {
  id: string;
  label: string;
  city: string;
  detail: string;
  latitude: number;
  longitude: number;
}

interface StoreSelectorProps {
  trigger?: React.ReactNode;
}

export default function StoreSelector({ trigger }: StoreSelectorProps) {
  const { currentStore, setCurrentStore, isManualStore, isAuthenticated, setSelectedAddress, selectedAddress } = useAppStore();
  const [stores, setStores] = useState<Store[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddrLoading, setIsAddrLoading] = useState(false);
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

  const fetchAddresses = async () => {
    setIsAddrLoading(true);
    try {
      const res = await api.get("/addresses");
      setAddresses(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setIsAddrLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (stores.length === 0) fetchStores();
      if (isAuthenticated && addresses.length === 0) fetchAddresses();
    }
  }, [isOpen, isAuthenticated]);

  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStoreSelect = (store: Store) => {
    setCurrentStore({ id: store.id, name: store.name }, true);
    setSelectedAddress(null); // Clear address choice if store picked manually
    setIsOpen(false);
  };

  const handleAddressSelect = async (addr: Address) => {
    setIsAddrLoading(true);
    try {
      // Find nearest store for this address
      const res = await api.post("/stores/nearest", {
        latitude: addr.latitude,
        longitude: addr.longitude
      });
      
      if (res.data.success) {
        setSelectedAddress({
          id: addr.id,
          label: addr.label || "Alamat Saya",
          latitude: addr.latitude,
          longitude: addr.longitude
        });
        setCurrentStore({ id: res.data.data.id, name: res.data.data.name }, false);
      }
    } catch (error) {
      console.error("Failed to find store for address:", error);
    } finally {
      setIsAddrLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-all group text-left">
            <FiMapPin className="text-primary shrink-0" size={14} />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Lokasi Belanja
              </span>
              <span className="text-sm font-bold text-foreground flex items-center gap-1">
                {currentStore?.name || "Pilih Toko"}
                <FiChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
              </span>
            </div>
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-4 border-b">
          <h3 className="font-bold text-sm">Pilih Lokasi</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Produk dan stok menyesuaikan dengan lokasi yang Anda pilih.
          </p>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {/* Adresses Section */}
          {isAuthenticated && (
            <div className="p-2 border-b">
              <p className="text-[10px] font-bold text-muted-foreground uppercase px-2 mb-1">Alamat Pengiriman</p>
              {isAddrLoading ? (
                <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                  <FiLoader className="animate-spin" /> Memuat alamat...
                </div>
              ) : addresses.length > 0 ? (
                addresses.map(addr => (
                  <button
                    key={addr.id}
                    onClick={() => handleAddressSelect(addr)}
                    className="w-full px-2 py-2 text-left hover:bg-primary/5 rounded-md flex items-center justify-between group transition-colors"
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate">{addr.label || "Alamat Saya"}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{addr.detail}, {addr.city}</p>
                    </div>
                    {selectedAddress?.id === addr.id && (
                      <FiCheck className="text-primary shrink-0" size={14} />
                    )}
                  </button>
                ))
              ) : (
                <p className="text-[10px] text-muted-foreground px-2 py-1">Belum ada alamat tersimpan.</p>
              )}
            </div>
          )}

          {/* Stores Section */}
          <div className="p-2">
            <div className="relative mb-2">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input
                type="text"
                placeholder="Cari toko atau kota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-muted/50 border rounded-md outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-4 gap-2">
                <FiLoader className="animate-spin text-primary" size={16} />
                <p className="text-[10px] text-muted-foreground">Memuat daftar toko...</p>
              </div>
            ) : filteredStores.length > 0 ? (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase px-2 mb-1">Pilih Toko Langsung</p>
                {filteredStores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => handleStoreSelect(store)}
                    className="w-full px-2 py-2 text-left hover:bg-primary/5 rounded-md flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold group-hover:text-primary transition-colors">
                        {store.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {store.city}
                      </p>
                    </div>
                    {(currentStore?.id === store.id && !selectedAddress) && (
                      <FiCheck className="text-primary" size={14} />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs text-muted-foreground">Toko tidak ditemukan.</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 bg-muted/30 border-t">
          {isManualStore || selectedAddress ? (
            <button 
              onClick={() => {
                setCurrentStore(null, false);
                setSelectedAddress(null);
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
