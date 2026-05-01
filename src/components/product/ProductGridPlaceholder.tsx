import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import AddToCartButton from "../cart/AddToCartButton";
import { productService, Product } from "@/services/productService";

export default function ProductGridPlaceholder() {
    const [products, setProducts] = useState<Product[]>([]);
    const [storeId, setStoreId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeGrid = async () => {
            try {
                // 1. Fetch available stores first
                const storeRes = await productService.getStores().catch(() => null);
                if (storeRes?.success && storeRes.data.length > 0) {
                    const activeStoreId = storeRes.data[0].id;
                    setStoreId(activeStoreId);

                    // 2. Fetch products for that store
                    const productRes = await productService.getProducts({ storeId: activeStoreId, limit: 12 });
                    if (productRes?.success) {
                        setProducts(productRes.data.items);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeGrid();
    }, []);

    if (isLoading) {
        return (
            <div className="flex w-full items-center justify-center p-8 text-sm text-gray-500 animate-pulse">
                Memuat produk...
            </div>
        );
    }

    if (!storeId || products.length === 0) {
        return (
            <div className="flex w-full items-center justify-center p-8 text-sm text-gray-500">
                Tidak ada produk tersedia di toko terdekat.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
            {products.map((product) => {
                const imageUrl = product.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400";
                const isOutOfStock = !product.inventory || product.inventory.quantity <= 0;

                return (
                    <div
                        key={product.id}
                        className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="relative aspect-square w-full bg-muted/10">
                            <img
                                src={imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                            {isOutOfStock && (
                                <div className="absolute left-0 top-2 rounded-r-md bg-gray-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm z-10">
                                    Stok Habis
                                </div>
                            )}
                        </div>
                        <div className="flex flex-1 flex-col p-3">
                            <h3 className="line-clamp-2 text-xs font-medium text-foreground md:text-sm">
                                {product.name}
                            </h3>
                            <div className="mt-auto pt-2">
                                <p className="text-sm font-bold text-primary md:text-base">
                                    Rp {Number(product.price).toLocaleString("id-ID")}
                                </p>
                            </div>
                            <AddToCartButton 
                               productId={product.id} 
                               storeId={storeId} 
                               stock={product.inventory?.quantity || 0} 
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}