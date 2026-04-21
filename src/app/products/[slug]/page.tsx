"use client";

import * as React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { productService, Product } from "@/services/productService";
import { ProductGallery } from "@/components/products/ProductGallery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Ban, ChevronLeft, Store, CheckCircle, XCircle, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";

import { Suspense } from "react";

function ProductDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const storeId = searchParams.get("storeId");

  const { addToCart, setCurrentStore, cart } = useAppStore();

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeStoreName, setActiveStoreName] = React.useState<string>("");
  const [qty, setQty] = React.useState(1);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!slug || !storeId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [productRes, storesRes] = await Promise.all([
          productService.getProductDetail(slug, storeId),
          productService.getStores(),
        ]);

        if (productRes.success) {
          setProduct(productRes.data);
        }

        const currentStore = storesRes.data.find((s) => s.id === storeId);
        if (currentStore) {
          setActiveStoreName(currentStore.name);
          setCurrentStore({ id: currentStore.id, name: currentStore.name });
        }
      } catch (error: unknown) {
        console.error("Failed to fetch product details", error);
        const errorMessage = error && typeof error === 'object' && 'response' in error 
          ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message
          : "Gagal memuat detail produk.";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, storeId, setCurrentStore]);

  const handleAddToCart = () => {
    if (!product) return;

    const price =
      typeof product.price === "string"
        ? parseFloat(product.price)
        : product.price;

    addToCart({
      productId: product.id,
      quantity: qty,
      product: {
        id: product.id,
        name: product.name,
        price,
        images: product.images?.map((img) => img.url),
      },
    });

    toast.success(`${qty}x ${product.name} ditambahkan ke keranjang!`, {
      action: {
        label: "Lihat Keranjang",
        onClick: () => router.push("/checkout"),
      },
    });
  };

  // Get current qty already in cart
  const cartItem = cart.find((c) => c.productId === product?.id);
  const cartQty = cartItem?.quantity ?? 0;

  if (loading) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Produk Tidak Ditemukan</h1>
        <p className="text-muted-foreground mb-8">
          Produk yang Anda cari tidak tersedia di toko ini.
        </p>
        <Button asChild>
          <Link href="/products">Kembali ke Katalog</Link>
        </Button>
      </div>
    );
  }

  const isOutOfStock = product.inventory.quantity <= 0;
  const price =
    typeof product.price === "string"
      ? parseFloat(product.price)
      : product.price;
  const maxQty = Math.min(product.inventory.quantity, 99);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
        {/* Back Button - Mobile Optimized */}
        <Button variant="ghost" size="sm" asChild className="mb-4 md:mb-6 -ml-2 text-primary">
          <Link href={`/products${storeId ? `?storeId=${storeId}` : ""}`} className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Kembali ke Katalog</span>
            <span className="sm:hidden">Kembali</span>
          </Link>
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-16">
          {/* ── Left: Gallery ───────────────────────────────────────── */}
          <section className="md:sticky md:top-4">
            <ProductGallery
              images={product.images && product.images.length > 0
                ? product.images
                : product.image
                ? [{ id: "main", url: product.image }]
                : []}
              productName={product.name}
            />
          </section>

          {/* ── Right: Info ─────────────────────────────────────────── */}
          <section className="flex flex-col gap-4 md:gap-5">
            {/* Category & Out of Stock Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {product.category}
              </Badge>
              {isOutOfStock && (
                <Badge variant="destructive" className="animate-pulse">Stok Habis</Badge>
              )}
            </div>

            {/* Product Name - Mobile Optimized Typography */}
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>

            {/* Price - Mobile Optimized */}
            <div className="flex flex-col p-3 md:p-0 rounded-lg md:rounded-none bg-muted/30 md:bg-transparent -mx-3 md:mx-0 px-3 md:px-0">
              {product.discount && product.discount.type !== "B1G1" && (
                <span className="text-sm md:text-lg text-muted-foreground line-through">
                  Rp {price.toLocaleString("id-ID")}
                </span>
              )}
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <span className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-[#00997a]">
                  Rp {(() => {
                    if (!product.discount) return price.toLocaleString("id-ID");
                    
                    if (product.discount.type === "PERCENT") {
                      const val = typeof product.discount.value === "string" ? parseFloat(product.discount.value) : product.discount.value;
                      const calculated = (price * val) / 100;
                      const actualDiscount = product.discount.maxDiscount 
                        ? Math.min(calculated, typeof product.discount.maxDiscount === "string" ? parseFloat(product.discount.maxDiscount) : product.discount.maxDiscount)
                        : calculated;
                      return (price - actualDiscount).toLocaleString("id-ID");
                    }
                    
                    if (product.discount.type === "NOMINAL") {
                      const val = typeof product.discount.value === "string" ? parseFloat(product.discount.value) : product.discount.value;
                      return Math.max(0, price - val).toLocaleString("id-ID");
                    }
                    
                    return price.toLocaleString("id-ID");
                  })()}
                </span>
                {product.discount && product.discount.type === "PERCENT" && (
                  <Badge className="bg-red-500 text-white border-none font-bold">
                    HEMAT {product.discount.value}%
                  </Badge>
                )}
                {product.discount && product.discount.type === "B1G1" && (
                  <Badge className="bg-amber-500 text-white border-none font-bold">
                    PROMO BELI 1 GRATIS 1
                  </Badge>
                )}
              </div>
            </div>

            {/* Stock Indicator - Enhanced Visual Feedback */}
            <div
              className={cn(
                "flex items-start gap-3 p-3 md:p-4 rounded-xl border",
                isOutOfStock
                  ? "bg-red-50 border-red-200"
                  : product.inventory.quantity <= 5
                  ? "bg-amber-50 border-amber-200"
                  : "bg-emerald-50 border-emerald-200"
              )}
            >
              {isOutOfStock ? (
                <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={cn(
                    "text-sm md:text-base font-bold",
                    isOutOfStock
                      ? "text-red-700"
                      : product.inventory.quantity <= 5
                      ? "text-amber-700"
                      : "text-emerald-700"
                  )}
                >
                  {isOutOfStock
                    ? "Stok Habis di Toko Ini"
                    : product.inventory.quantity <= 5
                    ? `Sisa ${product.inventory.quantity} item — Stok Terbatas!`
                    : `Stok Tersedia (${product.inventory.quantity} item)`}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Store className="h-3 w-3" />
                  {activeStoreName || "Toko Pilihan"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Description - Better Readability */}
            <div className="space-y-2">
              <h2 className="text-sm md:text-base font-semibold">Deskripsi Produk</h2>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                {product.description || "Belum ada deskripsi untuk produk ini."}
              </p>
            </div>

            {/* Qty Picker + Add to Cart - Mobile Optimized */}
            <div className="mt-2 md:mt-4 space-y-3 md:space-y-4">
              {!isOutOfStock && (
                <div className="flex items-center justify-between gap-3 p-3 md:p-0 rounded-lg md:rounded-none bg-muted/30 md:bg-transparent -mx-3 md:mx-0 px-3 md:px-0">
                  <span className="text-sm font-medium text-muted-foreground">Jumlah:</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-lg overflow-hidden bg-background">
                      <button
                        className="px-3 py-2 bg-muted hover:bg-muted/80 transition-colors disabled:opacity-40 active:bg-muted/60"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={qty <= 1}
                        aria-label="Kurangi jumlah"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 font-bold text-sm w-12 text-center bg-background">
                        {qty}
                      </span>
                      <button
                        className="px-3 py-2 bg-muted hover:bg-muted/80 transition-colors disabled:opacity-40 active:bg-muted/60"
                        onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                        disabled={qty >= maxQty}
                        aria-label="Tambah jumlah"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    {cartQty > 0 && (
                      <span className="text-xs text-primary font-medium hidden sm:inline">
                        {cartQty} sudah di keranjang
                      </span>
                    )}
                  </div>
                </div>
              )}

              <Button
                size="lg"
                className="w-full text-base md:text-lg font-bold py-5 md:py-6 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] sticky bottom-4 md:bottom-auto z-10"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
              >
                {isOutOfStock ? (
                  <><Ban className="mr-2 h-5 w-5" /> Produk Tidak Tersedia</>
                ) : (
                  <><ShoppingCart className="mr-2 h-5 w-5" /> Tambah ke Keranjang</>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground italic px-2">
                * Harga dan ketersediaan bergantung pada lokasi toko yang dipilih.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailContent />
    </Suspense>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Skeleton className="h-8 w-36 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="space-y-5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-14 w-full mt-4" />
        </div>
      </div>
    </div>
  );
}
