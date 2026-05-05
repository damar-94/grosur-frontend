"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, PackageSearch, ImageIcon, StoreIcon } from "lucide-react";
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
import { type AdminProduct } from "@/services/productService";

interface ProductTableProps {
  storeId: string;
  isLoading: boolean;
  products: AdminProduct[];
  isSuperAdmin: boolean;
  isDeleting: string | null;
  page: number;
  totalPage: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  handleDelete: (product: AdminProduct) => void;
  formatRupiah: (value: number) => string;
}

export function ProductTable({
  storeId,
  isLoading,
  products,
  isSuperAdmin,
  isDeleting,
  page,
  totalPage,
  setPage,
  handleDelete,
  formatRupiah,
}: ProductTableProps) {
  const router = useRouter();

  if (!storeId) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <StoreIcon className="h-12 w-12 text-muted-foreground/20" />
        <h3 className="text-lg font-medium text-muted-foreground">Pilih Toko Terlebih Dahulu</h3>
        <p className="text-sm text-muted-foreground/60 max-w-xs">
          Silakan pilih toko dari menu di atas untuk mengelola daftar produk.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
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
    );
  }

  return (
    <>
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
                          router.push(`/admin/products/${product.slug}/edit`)
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
                            disabled={isDeleting === product.slug}
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
    </>
  );
}
