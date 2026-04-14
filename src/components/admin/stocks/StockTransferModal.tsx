"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { stockService } from "@/services/stockService";
import { Product, productService } from "@/services/productService";

interface StoreData {
  id: string;
  name: string;
}

const transferSchema = z.object({
  fromStoreId: z.string().uuid("Toko asal harus dipilih"),
  toStoreId: z.string().uuid("Toko tujuan harus dipilih"),
  productId: z.string().uuid("Produk harus dipilih"),
  quantity: z.coerce.number().positive("Kuantitas minimal 1").int("Harus berupa bilangan bulat"),
  reason: z.string().min(5, "Alasan wajib diisi (min 5 karakter)"),
}).refine(data => data.fromStoreId !== data.toStoreId, {
  message: "Toko asal dan tujuan tidak boleh sama",
  path: ["toStoreId"],
});

type TransferFormValues = z.infer<typeof transferSchema>;

interface StockTransferModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  stores: StoreData[];
  onSuccess: () => void;
}

export function StockTransferModal({
  isOpen,
  onOpenChange,
  stores,
  onSuccess,
}: StockTransferModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isFetchingProducts, setIsFetchingProducts] = React.useState(false);

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromStoreId: "",
      toStoreId: "",
      productId: "",
      quantity: 0,
      reason: "Transfer logistik antar cabang",
    },
  });

  const fromStoreId = form.watch("fromStoreId");
  const productId = form.watch("productId");
  const quantity = form.watch("quantity");

  // Fetch products automatically when source store changes
  React.useEffect(() => {
    if (fromStoreId) {
      setIsFetchingProducts(true);
      // Reset product selection when store changes
      form.setValue("productId", "");
      productService.getProducts({ storeId: fromStoreId, limit: 100 })
        .then(res => {
          if (res.success) setProducts(res.items || []);
        })
        .catch(() => toast.error("Gagal memuat produk toko asal"))
        .finally(() => setIsFetchingProducts(false));
    } else {
      setProducts([]);
    }
  }, [fromStoreId, form]);

  const selectedProduct = products.find(p => p.id === productId);
  const maxStock = selectedProduct?.inventory?.quantity || 0;
  const isExceedingStock = quantity > maxStock;

  // Prevent UI rendering bugs on close
  React.useEffect(() => {
    if (!isOpen) {
      form.reset();
      setProducts([]);
    }
  }, [isOpen, form]);

  const onSubmit = async (values: TransferFormValues) => {
    if (isExceedingStock) {
      toast.error("Kuantitas transfer melebihi stok tersedia!");
      return;
    }

    try {
      setIsLoading(true);
      await stockService.transferStock({
        productId: values.productId,
        fromStoreId: values.fromStoreId,
        toStoreId: values.toStoreId,
        quantity: values.quantity,
        reason: values.reason,
      });

      toast.success(`Berhasil memindahkan ${values.quantity} unit ${selectedProduct?.name}.`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err.response?.data?.message || "Gagal melakukan transfer stok.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Transfer Stok Antar Cabang</DialogTitle>
          <DialogDescription>
            Pindahkan unit stok fisik dari satu toko ke toko lainnya secara aman.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fromStoreId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Toko Asal (Sumber)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih sumber..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stores.map(store => (
                          <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toStoreId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Toko Tujuan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tujuan..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stores
                          .filter(s => s.id !== fromStoreId) // UI Level Prevention
                          .map(store => (
                          <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {fromStoreId && (
              <div className="flex items-center justify-center -mt-2">
                <ArrowRight className="h-5 w-5 text-muted-foreground mr-6" />
              </div>
            )}

            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produk Terpilih</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value} 
                    disabled={isLoading || isFetchingProducts || !fromStoreId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !fromStoreId ? "Pilih sumber dahulu..." 
                          : isFetchingProducts ? "Memuat list produk..." 
                          : "Pilih produk dari inventori sumber..."
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem 
                          key={product.id} 
                          value={product.id}
                          disabled={(product.inventory?.quantity || 0) <= 0}
                        >
                          {product.name} — {(product.inventory?.quantity || 0)} unit
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {productId && (
              <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border">
                <span className="text-sm font-medium">Batas Maksimal Transfer:</span>
                <span className="font-bold text-lg text-primary">{maxStock} Unit</span>
              </div>
            )}

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kuantitas Transfer</FormLabel>
                  <FormControl>
                    <Input type="number" disabled={isLoading || !productId} {...field} />
                  </FormControl>
                  {isExceedingStock && (
                    <p className="text-xs text-destructive font-medium mt-1">
                      Kuantitas tidak valid! Melebihi plafon ketersediaan asal.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alasan (Catatan Operasional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Mutasi Gudang ID #772" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading || isExceedingStock || isFetchingProducts}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Eksekusi Transfer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
