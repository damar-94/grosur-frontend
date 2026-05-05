"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Store as StoreIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { productService, type AdminProduct } from "@/services/productService";
import { useAppStore } from "@/stores/useAppStore";
import { ProductTable } from "@/components/admin/products/ProductTable";

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

export default function AdminProductsPage() {
  const { user, nearestStore, setCurrentStore } = useAppStore();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");

  const storeId = user?.role === "STORE_ADMIN" 
    ? (user?.managedStore?.id ?? "")
    : (selectedStoreId || (nearestStore?.id ?? ""));

  useEffect(() => {
    if (user?.role === "SUPER_ADMIN") {
      productService.getStores().then((res) => {
        if (res.success) {
          setStores(res.data);
          if (!selectedStoreId && res.data.length > 0) {
            setSelectedStoreId(res.data[0].id);
            setCurrentStore(res.data[0]);
          }
        }
      });
    }
  }, [user, selectedStoreId, setCurrentStore]);

  const handleStoreChange = (storeId: string) => {
    setSelectedStoreId(storeId);
    const store = stores.find((s) => s.id === storeId);
    if (store) {
      setCurrentStore(store);
    }
  };

  const fetchProducts = useCallback(
    async (currentPage: number) => {
      if (!storeId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await productService.getProducts({
          storeId,
          page: currentPage,
          limit: 10,
        });
        if (res.success && res.data) {
          setProducts(res.data.items as unknown as AdminProduct[]);
          setTotalPage(res.data.meta.totalPage);
        } else {
          setProducts([]);
        }
      } catch {
        toast.error("Gagal memuat daftar produk");
      } finally {
        setIsLoading(false);
      }
    },
    [storeId],
  );

  useEffect(() => {
    fetchProducts(page);
  }, [page, fetchProducts]);

  const handleDelete = async (product: AdminProduct) => {
    if (!storeId) return;
    setIsDeleting(product.slug);
    try {
      await productService.adminDeleteProduct(product.slug, storeId);
      toast.success(`"${product.name}" berhasil dihapus`);
      fetchProducts(page);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message ?? "Gagal menghapus produk");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produk</h1>
          <p className="text-muted-foreground text-sm">
            Kelola produk yang tersedia di toko Anda
          </p>
        </div>
        {isSuperAdmin && (
          <Button asChild>
            <Link href="/admin/products/create">
              <Plus className="mr-2 h-4 w-4" /> Tambah Produk
            </Link>
          </Button>
        )}
      </div>

      {/* Filter Section (Super Admin only) */}
      {user?.role === "SUPER_ADMIN" && (
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground whitespace-nowrap">
                <StoreIcon className="h-4 w-4" /> PILIH TOKO:
              </div>
              <Select
                value={selectedStoreId}
                onValueChange={handleStoreChange}
              >
                <SelectTrigger className="max-w-xs bg-white">
                  <SelectValue placeholder="Pilih Toko" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Produk</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Memuat…"
                  : `${products.length} produk ditemukan`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProductTable 
            storeId={storeId}
            isLoading={isLoading}
            products={products}
            isSuperAdmin={isSuperAdmin}
            isDeleting={isDeleting}
            page={page}
            totalPage={totalPage}
            setPage={setPage}
            handleDelete={handleDelete}
            formatRupiah={formatRupiah}
          />
        </CardContent>
      </Card>
    </div>
  );
}
