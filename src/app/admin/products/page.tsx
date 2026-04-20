"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  PackageSearch,
  ImageIcon,
  Store as StoreIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { productService, type AdminProduct } from "@/services/productService";
import { useAppStore } from "@/stores/useAppStore";

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, nearestStore, setCurrentStore } = useAppStore();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");

  // Derive storeId based on role and selection
  // 1. If Store Admin, use their managed store
  // 2. If Super Admin, use the selected store from the dropdown
  // 3. Fallback to nearestStore if nothing else is available
  const storeId = user?.role === "STORE_ADMIN" 
    ? (user?.managedStore?.id ?? "")
    : (selectedStoreId || (nearestStore?.id ?? ""));

  // Fetch stores for Super Admin
  useEffect(() => {
    if (user?.role === "SUPER_ADMIN") {
      productService.getStores().then((res) => {
        if (res.success) {
          setStores(res.data);
          // If no store selected and we have stores, pick the first one as default
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
    setIsDeleting(product.id);
    try {
      await productService.adminDeleteProduct(product.id, storeId);
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
          {!storeId ? (
             <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <StoreIcon className="h-12 w-12 text-muted-foreground/20" />
                <h3 className="text-lg font-medium text-muted-foreground">Pilih Toko Terlebih Dahulu</h3>
                <p className="text-sm text-muted-foreground/60 max-w-xs">
                  Silakan pilih toko dari menu di atas untuk mengelola daftar produk.
                </p>
             </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <PackageSearch className="h-12 w-12 opacity-40" />
              <p className="text-sm font-medium">Belum ada produk</p>
              {isSuperAdmin && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/products/create">
                    <Plus className="mr-1.5 h-4 w-4" /> Tambah Produk Pertama
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Foto</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead className="hidden md:table-cell">Kategori</TableHead>
                    <TableHead className="hidden sm:table-cell">Harga</TableHead>
                    <TableHead className="hidden lg:table-cell">Status</TableHead>
                    {isSuperAdmin && <TableHead className="text-right">Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const thumbnail =
                      (product as unknown as { image?: string }).image ??
                      product.images?.[0]?.url;
                    const price =
                      typeof product.price === "number"
                        ? product.price
                        : Number(product.price);

                    return (
                      <TableRow key={product.id}>
                        {/* Thumbnail */}
                        <TableCell>
                          <div className="relative h-10 w-10 rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                            {thumbnail ? (
                              <Image
                                src={thumbnail}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                            )}
                          </div>
                        </TableCell>

                        {/* Name */}
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>

                        {/* Category */}
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {(product as unknown as { category: string | { name: string } }).category &&
                            typeof (product as unknown as { category: string | { name: string } }).category === "object"
                            ? ((product as unknown as { category: { name: string } }).category.name)
                            : (product as unknown as { category: string }).category}
                        </TableCell>

                        {/* Price */}
                        <TableCell className="hidden sm:table-cell">
                          {formatRupiah(price)}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="hidden lg:table-cell">
                          <Badge
                            variant={
                              product.isActive !== false ? "default" : "secondary"
                            }
                          >
                            {product.isActive !== false ? "Aktif" : "Non-aktif"}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        {isSuperAdmin && (
                          <TableCell className="text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(`/admin/products/${product.id}/edit`)
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  disabled={isDeleting === product.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus produk?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tindakan ini akan menghapus{" "}
                                    <span className="font-semibold">
                                      &quot;{product.name}&quot;
                                    </span>{" "}
                                    secara permanen dan tidak dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => handleDelete(product)}
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPage > 1 && (
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-muted-foreground">
                Halaman {page} / {totalPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
                disabled={page >= totalPage || isLoading}
              >
                Berikutnya
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
