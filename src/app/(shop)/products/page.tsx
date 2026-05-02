"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { ShoppingBasket, Loader2 } from "lucide-react";

import { productService, Product, Pagination, Category } from "@/services/productService";
import { ProductCard } from "@/components/products/ProductCard";
import { useAppStore } from "@/stores/useAppStore";
import { cn } from "@/lib/utils";
import { 
  ChevronRight, 
  Search, 
  Filter, 
  X,
  LayoutGrid
} from "lucide-react";
import {
  Pagination as UIPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function ProductCatalogContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addToCart, currentStore, setCurrentStore } = useAppStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [activeStoreName, setActiveStoreName] = useState<string>("");

  // Filters from URL
  const search = searchParams.get("search") || searchParams.get("keyword") || undefined;
  const categoryId = searchParams.get("categoryId") || searchParams.get("category") || undefined;
  const page = parseInt(searchParams.get("page") || "1");

  const validStoreId = currentStore?.id || null;

  const fetchProducts = useCallback(async () => {
    if (!validStoreId) return;
    
    // Resolve category slug to ID
    let resolvedCategoryId = categoryId;
    if (categoryId && categories.length > 0) {
      const cat = categories.find(c => c.slug === categoryId || c.id === categoryId);
      if (cat) {
        resolvedCategoryId = cat.id;
      }
    }

    // Delay fetching if a category slug is provided but categories are not loaded yet
    if (categoryId && categories.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await productService.getProducts({
        storeId: validStoreId,
        search: search,
        categoryId: resolvedCategoryId,
        page,
        limit: 12,
      });
      setProducts(response.data.items);
      setPagination(response.data.meta);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        toast.error(
          axiosError.response?.data?.message || 
          "Failed to load products. Please ensure a valid Store ID is provided."
        );
      } else {
        console.error("Products Load Error:", error);
        toast.error("An unknown error occurred while loading products");
      }
    } finally {
      setIsLoading(false);
    }
  }, [validStoreId, search, categoryId, page, categories]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        const res = await productService.getCategories();
        if (res.success) {
          setCategories(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (validStoreId) {
      fetchProducts();
    }
  }, [fetchProducts, validStoreId]);

  const updateFilters = (newFilters: { search?: string; categoryId?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newFilters.search !== undefined) {
      if (newFilters.search) {
        params.set("search", newFilters.search);
        params.delete("keyword"); // Cleanup old param
      } else {
        params.delete("search");
        params.delete("keyword");
      }
      params.set("page", "1"); // Reset page on search
    }

    if (newFilters.categoryId !== undefined) {
      if (newFilters.categoryId) {
        params.set("categoryId", newFilters.categoryId);
        params.delete("category"); // Cleanup old param
      } else {
        params.delete("categoryId");
        params.delete("category");
      }
      params.set("page", "1"); // Reset page on category change
    }

    if (newFilters.page !== undefined) {
      params.set("page", String(newFilters.page));
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleAddToCart = (product: Product) => {
    const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;
    addToCart({
      productId: product.id,
      quantity: 1,
      product: { 
        id: product.id, 
        name: product.name, 
        price, 
        images: product.images?.map((img) => img.url) || (product.image ? [product.image] : undefined)
      },
    });
    toast.success(`${product.name} ditambahkan ke keranjang!`, {
      action: { label: "Lihat", onClick: () => router.push("/checkout") },
    });
  };

  // Sync store name for local display
  useEffect(() => {
    if (currentStore?.name) {
      setActiveStoreName(currentStore.name);
    }
  }, [currentStore?.name]);

  const resetFilters = () => {
    router.push(pathname);
  };

  const activeCategory = categories.find(c => c.slug === categoryId || c.id === categoryId);

  return (
    <div className="bg-background min-h-screen">
      {/* Search Result Banner */}
      {(search || categoryId) && (
        <div className="bg-card border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Katalog Produk</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              {search && (
                <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                  <Search className="h-3.5 w-3.5" />
                  <span>Pencarian: "{search}"</span>
                  <button onClick={() => updateFilters({ search: "" })} className="hover:bg-primary/20 p-0.5 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {categoryId && (
                <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>Kategori: {activeCategory?.name || "Memuat..."}</span>
                  <button onClick={() => updateFilters({ categoryId: "" })} className="hover:bg-primary/20 p-0.5 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            <button 
              onClick={resetFilters}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              Reset Semua Filter
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar - Desktop */}
          <aside className="hidden md:block w-64 shrink-0 space-y-6">
            <div className="bg-card rounded-xl border p-5 shadow-sm">
              <h3 className="font-bold flex items-center gap-2 mb-4 text-foreground">
                <Filter className="h-4 w-4 text-primary" />
                Semua Kategori
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => updateFilters({ categoryId: "" })}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                    !categoryId 
                      ? "bg-primary text-white font-bold shadow-md shadow-primary/20" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  Semua Produk
                </button>
                {isCategoriesLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-9 w-full bg-muted animate-pulse rounded-lg mt-1" />
                  ))
                ) : (
                  categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateFilters({ categoryId: cat.slug })}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                        (categoryId === cat.slug || categoryId === cat.id)
                          ? "bg-primary text-white font-bold shadow-md shadow-primary/20" 
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Store Badge */}
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-5">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBasket className="h-5 w-5 text-primary" />
                <span className="font-bold text-sm text-primary">Toko Terpilih</span>
              </div>
              <p className="text-xs font-medium text-foreground line-clamp-1">
                {activeStoreName || "Memuat toko..."}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Harga dan stok disesuaikan dengan cabang ini.
              </p>
            </div>
          </aside>

          {/* Sidebar - Mobile Horizontal Scroll */}
          <div className="md:hidden overflow-x-auto no-scrollbar pb-2">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => updateFilters({ categoryId: "" })}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                  !categoryId ? "bg-primary text-white" : "bg-card border text-muted-foreground"
                )}
              >
                Semua Produk
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateFilters({ categoryId: cat.slug })}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                    (categoryId === cat.slug || categoryId === cat.id) ? "bg-primary text-white" : "bg-card border text-muted-foreground"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                {search ? `Hasil untuk "${search}"` : activeCategory?.name || "Katalog Produk"}
              </h1>
              {pagination && (
                <p className="text-sm text-muted-foreground font-medium">
                  {pagination.total} Produk ditemukan
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                  {products.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {pagination && pagination.totalPage > 1 && (
                  <div className="mt-12 flex justify-center">
                    <UIPagination>
                      <PaginationContent className="bg-card border rounded-lg p-1 shadow-sm">
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              if (page > 1) updateFilters({ page: page - 1 });
                            }}
                            className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-muted transition-colors"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(pagination.totalPage, 5) }, (_, i) => i + 1).map((p) => (
                          <PaginationItem key={p}>
                            <PaginationLink 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                updateFilters({ page: p });
                              }}
                              isActive={page === p}
                              className={cn(
                                "transition-all",
                                page === p ? "bg-primary text-white hover:bg-primary/90 shadow-sm" : "hover:bg-muted"
                              )}
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
                            className={page >= pagination.totalPage ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-muted transition-colors"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </UIPagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 bg-card rounded-2xl border-2 border-dashed flex flex-col items-center shadow-sm">
                <div className="bg-muted p-4 rounded-full mb-4">
                   <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Produk Tidak Ditemukan</h3>
                <p className="text-muted-foreground max-w-md px-6">
                  Maaf, kami tidak bisa menemukan produk yang Anda cari. Coba ganti kata kunci atau pilih kategori lain.
                </p>
                <button 
                  onClick={resetFilters}
                  className="mt-6 bg-primary text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                >
                  Kembali ke Katalog Lengkap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
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
