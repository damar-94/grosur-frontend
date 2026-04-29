"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Form } from "@/components/ui/form";

import { productFormSchema, type ProductFormValues } from "@/schemas/product.schema";
import { productService, type Category } from "@/services/productService";
import { ProductFormFields } from "@/components/admin/products/ProductFormFields";
import { ImageDropzone } from "@/components/admin/products/ImageDropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/stores/useAppStore";

export default function CreateProductPage() {
  const router = useRouter();
  const { user, currentStore, setCurrentStore } = useAppStore();
  
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    user?.role === "STORE_ADMIN" 
      ? (user?.managedStore?.id ?? "") 
      : (currentStore?.id ?? "")
  );

  const storeId = selectedStoreId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
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

  // Sync Store ID when user state hydrates
  useEffect(() => {
    if (!selectedStoreId) {
      if (user?.role === "STORE_ADMIN" && user.managedStore?.id) {
        setSelectedStoreId(user.managedStore.id);
      } else if (user?.role === "SUPER_ADMIN" && currentStore?.id) {
        setSelectedStoreId(currentStore.id);
      }
    }
  }, [user, currentStore, selectedStoreId]);

  // Load categories and stores on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const catRes = await productService.getCategories();
        if (!isMounted) return;
        setCategories(catRes.data);
        
        if (user?.role === "SUPER_ADMIN") {
          setStoresLoading(true);
          const storeRes = await productService.getStores();
          if (!isMounted) return;
          if (storeRes.success) {
            setStores(storeRes.data);
            // If no store selected from global state, pick the first one
            if (!selectedStoreId && storeRes.data.length > 0) {
              setSelectedStoreId(storeRes.data[0].id);
              setCurrentStore(storeRes.data[0]);
            }
          }
        }
      } catch {
        if (isMounted) toast.error("Gagal memuat data pendukung");
      } finally {
        if (isMounted) {
          setCategoriesLoading(false);
          setStoresLoading(false);
        }
      }
    })();

    return () => { isMounted = false; };
  }, [user?.role, selectedStoreId, setCurrentStore]);

  const handleStoreChange = (val: string) => {
    setSelectedStoreId(val);
    const store = stores.find(s => s.id === val);
    if (store) {
      setCurrentStore(store);
    }
  };

  const onSubmit = async (values: ProductFormValues) => {
    if (!storeId) {
      toast.error("Toko belum dipilih. Silakan pilih toko terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1 — create the product record
      const createRes = await productService.adminCreateProduct({
        name: values.name,
        price: values.price,
        categoryId: values.categoryId,
        storeId,
        description: values.description,
      });

      const newProductId = createRes.data.id;

      // Step 2 — upload images if any
      if (pendingFiles.length > 0) {
        setIsUploading(true);
        try {
          await productService.uploadProductImages(newProductId, storeId, pendingFiles);
        } catch {
          toast.warning(
            "Produk berhasil dibuat, tapi ada masalah saat mengunggah gambar.",
          );
        } finally {
          setIsUploading(false);
        }
      }

      toast.success(`"${values.name}" berhasil ditambahkan!`);
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
          <h1 className="text-2xl font-bold tracking-tight">Tambah Produk</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">Toko:</span>
            {isSuperAdmin ? (
              <Select
                value={selectedStoreId}
                onValueChange={handleStoreChange}
                disabled={storesLoading}
              >
                <SelectTrigger className="h-7 w-[200px] text-xs font-semibold">
                  <SelectValue placeholder="Pilih Toko" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-sm font-semibold text-foreground">
                {user?.managedStore?.name || "Toko Regional"}
              </span>
            )}
          </div>
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
                  : "Simpan Produk"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
