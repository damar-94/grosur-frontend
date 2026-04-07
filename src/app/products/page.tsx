"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { ShoppingBasket, Loader2 } from "lucide-react";

import { productService, Product, Pagination } from "@/services/productService";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilter } from "@/components/products/ProductFilter";
import { 
  Pagination as UIPagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

function ProductCatalogContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStoreName, setActiveStoreName] = useState<string>("");

  // Filters from URL
  const search = searchParams.get("search") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const storeId = searchParams.get("storeId");

  const fetchProducts = useCallback(async () => {
    if (!storeId) return;
    setIsLoading(true);
    try {
      const response = await productService.getProducts({
        storeId,
        search,
        categoryId,
        page,
        limit: 12,
      });
      setProducts(response.items);
      setPagination(response.meta);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as any;
        toast.error(
          axiosError.response?.data?.message || 
          "Failed to load products. Please ensure a valid Store ID is provided."
        );
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }, [storeId, search, categoryId, page]);

  useEffect(() => {
    const handleStoreSelection = async () => {
      try {
        const response = await productService.getStores();
        const stores = response.data;
        if (stores.length > 0) {
          if (!storeId) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("storeId", stores[0].id);
            router.replace(`${pathname}?${params.toString()}`);
          } else {
            const currentStore = stores.find((s: { id: string; name: string }) => s.id === storeId);
            if (currentStore) setActiveStoreName(currentStore.name);
          }
        }
      } catch (error) {
        console.error("Failed to fetch stores", error);
      }
    };

    handleStoreSelection();
  }, [storeId, pathname, router, searchParams]);

  useEffect(() => {
    if (storeId) {
      fetchProducts();
    }
  }, [fetchProducts, storeId]);

  const updateFilters = (newFilters: { search?: string; categoryId?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newFilters.search !== undefined) {
      if (newFilters.search) params.set("search", newFilters.search);
      else params.delete("search");
      params.set("page", "1"); // Reset page on search
    }

    if (newFilters.categoryId !== undefined) {
      if (newFilters.categoryId) params.set("categoryId", newFilters.categoryId);
      else params.delete("categoryId");
      params.set("page", "1"); // Reset page on category change
    }

    if (newFilters.page !== undefined) {
      params.set("page", String(newFilters.page));
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleAddToCart = (product: Product) => {
    toast.success(`Added ${product.name} to cart! (Feature coming soon)`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ShoppingBasket className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg line-clamp-2 leading-tight min-h-10">
            Product Catalog
          </h3>
          <p className="text-muted-foreground text-sm">
            {activeStoreName ? `Menampilkan produk dari ${activeStoreName}` : "Explore our fresh products from your local store."}
          </p>
        </div>
      </div>

      <ProductFilter 
        initialSearch={search}
        initialCategory={categoryId}
        onFilterChange={updateFilters}
        onReset={() => router.push(pathname + (storeId ? `?storeId=${storeId}` : ""))}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading amazing products...</p>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {pagination && pagination.totalPage > 1 && (
            <div className="mt-12">
              <UIPagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) updateFilters({ page: page - 1 });
                      }}
                      className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: pagination.totalPage }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p} className="hidden sm:inline-block">
                      <PaginationLink 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          updateFilters({ page: p });
                        }}
                        isActive={page === p}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < pagination.totalPage) updateFilters({ page: page + 1 });
                      }}
                      className={page >= pagination.totalPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </UIPagination>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24 bg-muted/30 rounded-2xl border-2 border-dashed">
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
}

export default function ProductCatalogPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-24 text-center">Loading Catalog...</div>}>
      <ProductCatalogContent />
    </Suspense>
  );
}
