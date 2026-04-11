"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Form } from "@/components/ui/form";

import { productFormSchema, type ProductFormValues } from "@/schemas/product.schema";
import {
  productService,
  type AdminProduct,
  type Category,
  type ProductImage,
} from "@/services/productService";
import { ProductFormFields } from "@/components/admin/products/ProductFormFields";
import { ImageDropzone } from "@/components/admin/products/ImageDropzone";
import { useAppStore } from "@/stores/useAppStore";

interface EditProductPageProps {
  params: Promise<{ productId: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { productId } = use(params);
  const router = useRouter();
  const { nearestStore } = useAppStore();
  const storeId = nearestStore?.id ?? "";

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProductFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      name: "",
      price: 0,
      categoryId: "",
      description: "",
      isActive: true,
    },
  });

  // ── Load product & categories ─────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setPageLoading(true);
    try {
      const [productRes, catRes] = await Promise.all([
        productService.getProductById(productId),
        productService.getCategories(),
      ]);

      const p = productRes.data;
      setProduct(p);
      setExistingImages(p.images ?? []);
      setCategories(catRes.data);
      setCategoriesLoading(false);

      form.reset({
        name: p.name,
        price: p.price,
        categoryId: p.categoryId,
        description: p.description ?? "",
        isActive: p.isActive,
      });
    } catch {
      toast.error("Gagal memuat data produk");
      router.push("/admin/products");
    } finally {
      setPageLoading(false);
    }
  }, [productId, form, router]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleRemoveExisting = (imageId: string) => {
    // Optimistically remove from UI — actual deletion can be added if a
    // DELETE /products/images/:id endpoint is implemented later.
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    toast.info("Gambar dihapus dari tampilan. Perubahan tersimpan saat Simpan.");
  };

  const onSubmit = async (values: ProductFormValues) => {
    if (!storeId) {
      toast.error("Toko belum dipilih.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1 — update product details
      await productService.adminUpdateProduct(productId, {
        name: values.name,
        price: values.price,
        categoryId: values.categoryId,
        description: values.description,
        isActive: values.isActive,
        storeId,
      });

      // Step 2 — upload new images
      if (pendingFiles.length > 0) {
        setIsUploading(true);
        try {
          await productService.uploadProductImages(productId, storeId, pendingFiles);
          setPendingFiles([]);
        } catch {
          toast.warning("Produk diperbarui, tapi ada masalah saat mengunggah gambar.");
        } finally {
          setIsUploading(false);
        }
      }

      toast.success("Produk berhasil diperbarui!");
      router.push("/admin/products");
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string; errorCode?: string } };
      };
      const message = axiosErr.response?.data?.message;
      const code = axiosErr.response?.data?.errorCode;

      if (code === "PRODUCT_DUPLICATE") {
        form.setError("name", {
          message: message ?? "Nama produk sudah ada di toko ini",
        });
      } else {
        toast.error(message ?? "Terjadi kesalahan. Coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || isUploading;

  // ── Skeleton while loading ────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top nav */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Produk</h1>
          <p className="text-sm text-muted-foreground truncate max-w-xs">
            {product?.name}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Detail produk */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informasi Produk</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductFormFields
                form={form}
                categories={categories}
                categoriesLoading={categoriesLoading}
                showActiveToggle
              />
            </CardContent>
          </Card>

          {/* Gambar produk */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Foto Produk</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageDropzone
                pendingFiles={pendingFiles}
                onPendingFilesChange={setPendingFiles}
                existingImages={existingImages}
                onRemoveExisting={handleRemoveExisting}
                isUploading={isUploading}
                disabled={isBusy}
              />
            </CardContent>
          </Card>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/products")}
              disabled={isBusy}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isBusy}>
              {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading
                ? "Mengunggah gambar…"
                : isSubmitting
                  ? "Menyimpan…"
                  : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
