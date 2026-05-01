"use client";

import { useState } from "react";
import { FiPlus, FiCheck } from "react-icons/fi";
import { useAppStore } from "@/stores/useAppStore";
import { api } from "@/lib/axiosInstance";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AddToCartButtonProps {
  productId: string;
  storeId: string;
  stock: number;
}

export default function AddToCartButton({ productId, storeId, stock }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { user, cartCount, setCartCount } = useAppStore();
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!user) {
      toast.warning("Silakan masuk terlebih dahulu untuk menambahkan barang ke keranjang.", {
        action: {
          label: "Masuk",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }

    if (!user.isVerified) {
      toast.error("Silakan verifikasi email Anda terlebih dahulu.");
      return;
    }

    if (stock <= 0) {
      toast.error("Maaf, stok produk tidak tersedia.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.post("/cart/add", {
        productId,
        storeId,
        quantity: 1,
      });

      if (res.data.success) {
        setCartCount(cartCount + 1);
        setJustAdded(true);
        toast.success("Berhasil ditambahkan ke keranjang!", {
          description: "Produk berhasil masuk ke keranjang belanjamu.",
          action: {
            label: "Lihat Keranjang",
            onClick: () => router.push("/cart"),
          },
        });
        // Reset the "just added" state after 2s
        setTimeout(() => setJustAdded(false), 2000);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal menambahkan ke keranjang";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading || stock <= 0}
      className={`mt-3 flex w-full items-center justify-center gap-1 rounded-md border py-1.5 text-xs font-bold transition-all duration-200
        ${stock <= 0
          ? "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
          : justAdded
          ? "border-green-500 text-green-600 bg-green-50"
          : "border-[#00997a] text-[#00997a] hover:bg-[#00997a] hover:text-white"
        }
      `}
    >
      {isLoading ? (
        <span className="animate-pulse">Menambahkan...</span>
      ) : stock <= 0 ? (
        "Stok Habis"
      ) : justAdded ? (
        <><FiCheck /> Ditambahkan</>
      ) : (
        <><FiPlus /> Tambah</>
      )}
    </button>
  );
}
