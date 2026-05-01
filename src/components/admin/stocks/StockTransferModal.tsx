"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowRight, Check, ChevronsUpDown, Search } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

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
  const [open, setOpen] = React.useState(false);

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema) as any,
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
          if (res.success && res.data) {
            setProducts(res.data.items || []);
          }
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
      <DialogContent className="sm:max-w-xl md:max-w-3xl">
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
                <FormItem className="flex flex-col">
                  <FormLabel>Produk Terpilih</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className={cn(
                            "w-full justify-between font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isLoading || isFetchingProducts || !fromStoreId}
                        >
                          {field.value
                            ? products.find((product) => product.id === field.value)?.name
                            : !fromStoreId 
                              ? "Pilih sumber dahulu..." 
                              : isFetchingProducts 
                                ? "Memuat list produk..." 
                                : "Pilih produk..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Cari produk..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>Produk tidak ditemukan.</CommandEmpty>
                          <CommandGroup>
                            {products.map((product) => (
                              <CommandItem
                                key={product.id}
                                value={product.name}
                                onSelect={() => {
                                  form.setValue("productId", product.id);
                                  setOpen(false);
                                }}
                                disabled={(product.inventory?.quantity || 0) <= 0}
                                className="flex items-center justify-between py-2.5 px-3 aria-selected:bg-primary/5 cursor-pointer transition-colors"
                              >
                                <div className="flex flex-col gap-1">
                                  <span className="font-medium">{product.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      "text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                                      (product.inventory?.quantity || 0) > 20 
                                        ? "bg-green-100 text-green-700" 
                                        : (product.inventory?.quantity || 0) > 0 
                                          ? "bg-orange-100 text-orange-700"
                                          : "bg-red-100 text-red-700"
                                    )}>
                                      {(product.inventory?.quantity || 0)} Unit
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">tersedia di inventori</span>
                                  </div>
                                </div>
                                {product.id === field.value && (
                                  <div className="bg-primary/10 p-1 rounded-full">
                                    <Check className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
