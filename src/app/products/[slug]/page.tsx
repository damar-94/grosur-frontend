"use client";

import * as React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { productService, Product } from "@/services/productService";
import { ProductGallery } from "@/components/products/ProductGallery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Ban, ChevronLeft, Store } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const storeId = searchParams.get("storeId");

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeStoreName, setActiveStoreName] = React.useState<string>("");

  React.useEffect(() => {
    const fetchData = async () => {
      if (!slug || !storeId) {
        // If no storeId, we should handle it like the catalog page
        // But for now, let's just wait or redirect if we had a better store management
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch product detail
        const [productRes, storesRes] = await Promise.all([
          productService.getProductDetail(slug, storeId),
          productService.getStores()
        ]);

        if (productRes.success) {
          setProduct(productRes.data);
        }

        // Find store name
        const currentStore = storesRes.data.find(s => s.id === storeId);
        if (currentStore) {
          setActiveStoreName(currentStore.name);
        }
      } catch (error) {
        console.error("Failed to fetch product details", error);
        toast.error("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, storeId]);

  if (loading) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The product you are looking for does not exist or is not available in this store.
        </p>
        <Button asChild>
          <Link href="/products">Back to Catalog</Link>
        </Button>
      </div>
    );
  }

  const isOutOfStock = product.inventory.quantity <= 0;
  const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs / Back */}
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 text-primary">
          <Link href="/products" className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to Catalog
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Gallery */}
          <section>
            <ProductGallery 
              images={product.images || (product.image ? [{ id: "main", url: product.image }] : [])} 
              productName={product.name} 
            />
          </section>

          {/* Right: Info */}
          <section className="flex flex-col">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {product.category}
                </Badge>
                {isOutOfStock && (
                  <Badge variant="destructive">OUT OF STOCK</Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-primary">
                  Rp {price.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-muted w-fit">
                <Store className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Available at: {activeStoreName || "Selected Store"}</span>
                <Separator orientation="vertical" className="h-4 mx-2" />
                <span className={cn("text-sm font-bold", isOutOfStock ? "text-destructive" : "text-primary")}>
                  Stock: {product.inventory.quantity}
                </span>
              </div>

              <Separator className="my-2" />

              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Description</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {product.description || "No description provided for this product."}
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <Button 
                  size="lg" 
                  className="w-full text-base font-bold py-6 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isOutOfStock}
                  onClick={() => toast.success(`Added ${product.name} to cart! (Feature coming soon)`)}
                >
                  {isOutOfStock ? (
                    <><Ban className="mr-2 h-5 w-5" /> Product Unavailable</>
                  ) : (
                    <><ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart</>
                  )}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground italic">
                  * Prices and availability are subject to change based on the selected store location.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-32 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-3/4" />
          </div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
