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
  const { user } = useAppStore();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // For STORE_ADMIN the storeId comes from the nearest store in app state;
  // for SUPER_ADMIN we still need a storeId — use nearestStore if set.
  const { nearestStore } = useAppStore();
  const storeId = nearestStore?.id ?? "";

  const fetchProducts = useCallback(
    async (currentPage: number) => {
      if (!storeId) return;
      setIsLoading(true);
      try {
        const res = await productService.getProducts({
          storeId,
          page: currentPage,
          limit: 10,
        });
        // getProducts returns public format; cast as AdminProduct for display
        setProducts(res.items as unknown as AdminProduct[]);
        setTotalPage(res.meta.totalPage);
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
        <Button asChild>
          <Link href="/admin/products/create">
            <Plus className="mr-2 h-4 w-4" /> Tambah Produk
          </Link>
        </Button>
      </div>

      {/* Table card */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>
            {isLoading
              ? "Memuat…"
              : `${products.length} produk ditemukan`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <PackageSearch className="h-12 w-12 opacity-40" />
              <p className="text-sm font-medium">Belum ada produk</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/products/create">
                  <Plus className="mr-1.5 h-4 w-4" /> Tambah Produk Pertama
                </Link>
              </Button>
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
                    <TableHead className="text-right">Aksi</TableHead>
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
