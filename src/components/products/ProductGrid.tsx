"use client";

import { useEffect, useState, useCallback } from "react";
import { productService, Product } from "@/services/productService";
import { ProductCard } from "./ProductCard";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/axiosInstance";
import { useAppStore } from "@/stores/useAppStore";
import { useRouter } from "next/navigation";

interface ProductGridProps {
  storeId: string;
  limit?: number;
}

export function ProductGrid({ storeId, limit = 8 }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, cartCount, setCartCount } = useAppStore();
  const router = useRouter();

  const fetchProducts = useCallback(async () => {
    if (!storeId) return;
    setIsLoading(true);
    try {
      const response = await productService.getProducts({
        storeId,
        page: 1,
        limit,
      });

      // Data is nested under the 'data' property in ProductListResponse
      if (response.success && response.data) {
        setProducts(response.data.items);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      console.error("Failed to fetch products for grid", error);
      toast.error("Gagal memuat produk.");
    } finally {
      setIsLoading(false);
    }
  }, [storeId, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast.warning("Silakan masuk terlebih dahulu untuk belanja.", {
        action: { label: "Masuk", onClick: () => router.push("/login") },
      });
      return;
    }

    if (!user.isVerified) {
      toast.error("Silakan verifikasi email Anda terlebih dahulu.");
      return;
    }

    try {
      const res = await api.post("/cart/add", {
        productId: product.id,
        storeId: storeId,
        quantity: 1,
      });

      if (res.data.success) {
        setCartCount(cartCount + 1);
        toast.success(`${product.name} berhasil ditambahkan!`, {
          action: { label: "Lihat Keranjang", onClick: () => router.push("/cart") },
        });
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal menambahkan ke keranjang";
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 bg-muted/10 rounded-xl border border-dashed">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Mencari produk segar untukmu...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/10 rounded-xl border border-dashed">
        <p className="text-sm text-muted-foreground">Tidak ada produk tersedia di toko ini.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  );
}
