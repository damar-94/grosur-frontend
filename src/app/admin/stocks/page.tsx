"use client";

import * as React from "react";
import { CopyPlus } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/stores/useAppStore";
import { Product, productService } from "@/services/productService";
import { StockTable } from "@/components/admin/stocks/StockTable";
import { StockAdjustmentModal } from "@/components/admin/stocks/StockAdjustmentModal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StockManagementPage() {
  const { user } = useAppStore();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const storeAdminId = user?.managedStore?.id;

  const [stores, setStores] = React.useState<{ id: string; name: string }[]>([]);
  const [selectedStoreId, setSelectedStoreId] = React.useState<string | undefined>(
    isSuperAdmin ? undefined : storeAdminId
  );

  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);

  // 1. Fetch Master Stores (Only relevant for SUPER_ADMIN)
  React.useEffect(() => {
    if (isSuperAdmin) {
      productService.getStores().then((res) => {
        if (res.success) {
          setStores(res.data);
          if (res.data.length > 0 && !selectedStoreId) {
            setSelectedStoreId(res.data[0].id); // Auto-select first store
          }
        }
      }).catch(() => {
        toast.error("Failed to load store list");
      });
    }
  }, [isSuperAdmin, selectedStoreId]);

  // 2. Fetch Products/Inventory when selectedStoreId changes
  const fetchInventory = React.useCallback(async () => {
    if (!selectedStoreId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Fetch products scoped by storeId to get their inventory quantity automatically
      const res = await productService.getProducts({ storeId: selectedStoreId, limit: 100 }); 
      // Limits to 100 arbitrarily. In real world, pagination needed.
      if (res.success) {
        setProducts(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      toast.error("Failed to fetch inventory details.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedStoreId]);

  React.useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleAdjustClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 mb-8 border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CopyPlus className="h-8 w-8 text-primary" />
            Stock Inventory
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage product quantities and trace manual stock adjustments.
          </p>
        </div>

        {/* Dynamic Context View */}
        <div className="flex items-center gap-3">
          {isSuperAdmin ? (
            <Select
              value={selectedStoreId}
              onValueChange={(val) => setSelectedStoreId(val)}
            >
              <SelectTrigger className="w-[300px] border-primary/50 shadow-sm">
                <SelectValue placeholder="Select a targeted store..." />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-lg border border-primary/20">
              Active Scope: {user?.managedStore?.name || "Unknown Store"}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <StockTable
            products={products}
            isLoading={isLoading}
            storeSelected={!!selectedStoreId}
            onAdjustStock={handleAdjustClick}
          />
        )}
      </div>

      <StockAdjustmentModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        product={selectedProduct}
        storeId={selectedStoreId || ""}
        onSuccess={fetchInventory}
      />
    </div>
  );
}
