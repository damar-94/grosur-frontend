"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { id } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";

import { discountService, CreateDiscountRequest } from "@/services/discountService";
import { Product, productService } from "@/services/productService";

interface StoreData {
  id: string;
  name: string;
}

const discountSchema = z.object({
  storeId: z.string().uuid("Toko harus dipilih"),
  type: z.enum(["PERCENT", "NOMINAL", "B1G1"]),
  // Base fields
  productId: z.string().optional(),
  // Percentage / Nominal value
  value: z.coerce.number().min(0).optional(),
  minSpend: z.coerce.number().min(0).optional(),
  maxDiscount: z.coerce.number().min(0).optional(),
  // B1G1 fields
  buyQty: z.coerce.number().min(1).optional(),
  freeQty: z.coerce.number().min(1).optional(),
  // Date Range
  dateRange: z.object({
    from: z.date({
      required_error: "Tanggal mulai dibutuhkan.",
    }),
    to: z.date({
      required_error: "Tanggal berakhir dibutuhkan.",
    }),
  }).refine((data) => data.to > data.from, {
    message: "Periode promo harus valid (Selisih minimal 1 hari).",
    path: ["to"],
  }),
}).refine((data) => {
  if (data.type === "PERCENT") {
    if (!data.value || data.value <= 0 || data.value > 100) return false;
  }
  if (data.type === "NOMINAL") {
    if (!data.value || data.value <= 0) return false;
  }
  if (data.type === "B1G1") {
    if (!data.buyQty || !data.freeQty) return false;
    if (!data.productId) return false; // B1G1 Wajib spesifik produk
  }
  return true;
}, {
  message: "Mohon lengkapi isian wajib sesuai Tipe Promo.",
  path: ["value"],
});

type DiscountFormValues = z.infer<typeof discountSchema>;

interface DiscountFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  stores: StoreData[];
  preSelectedStoreId?: string;
  onSuccess: () => void;
}

export function DiscountFormModal({
  isOpen,
  onOpenChange,
  stores,
  preSelectedStoreId,
  onSuccess,
}: DiscountFormModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isFetchingProducts, setIsFetchingProducts] = React.useState(false);

  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      storeId: preSelectedStoreId || "",
      type: "PERCENT",
      productId: "",
      value: 0,
      minSpend: 0,
      maxDiscount: 0,
      buyQty: 1,
      freeQty: 1,
    },
  });

  const selectedType = form.watch("type");
  const selectedStoreId = form.watch("storeId");

  // Fetch products automatically when store changes (For specific product discounts)
  React.useEffect(() => {
    if (selectedStoreId) {
      setIsFetchingProducts(true);
      productService.getProducts({ storeId: selectedStoreId, limit: 1000 })
        .then(res => {
          if (res.success) setProducts(res.items || []);
        })
        .catch(() => toast.error("Gagal memuat produk cabang"))
        .finally(() => setIsFetchingProducts(false));
    } else {
      setProducts([]);
    }
  }, [selectedStoreId]);

  // Reset logic when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      form.reset({
        storeId: preSelectedStoreId || "",
        type: "PERCENT",
        productId: "",
        value: 0,
        minSpend: 0,
        maxDiscount: 0,
        buyQty: 1,
        freeQty: 1,
      });
    } else if (preSelectedStoreId) {
      form.setValue("storeId", preSelectedStoreId);
    }
  }, [isOpen, form, preSelectedStoreId]);

  const onSubmit = async (values: DiscountFormValues) => {
    try {
      setIsLoading(true);
      
      const payload: CreateDiscountRequest = {
        storeId: values.storeId,
        type: values.type,
        startDate: values.dateRange.from.toISOString(),
        endDate: values.dateRange.to.toISOString(),
        // Mandatory positive value workaround for B1G1 in Zod backend schema constraints:
        value: values.type === "B1G1" ? 1 : Number(values.value),
      };

      if (values.productId && values.productId !== "all") {
        payload.productId = values.productId;
      }

      if (values.minSpend && values.minSpend > 0) payload.minSpend = Number(values.minSpend);
      if (values.maxDiscount && values.maxDiscount > 0) payload.maxDiscount = Number(values.maxDiscount);
      
      if (values.type === "B1G1") {
        payload.buyQty = Number(values.buyQty);
        payload.freeQty = Number(values.freeQty);
      }

      await discountService.createDiscount(payload);
      toast.success("Promo diskon berhasil dibuat dan diaktfikan!");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal menyimpan promo diskon.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Event Promo Baru</DialogTitle>
          <DialogDescription>
            Definisikan aturan korting dinamis sesuai tipe insentif.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
            
            <div className="grid grid-cols-2 gap-4">
              {/* STORE SELECTION */}
              <FormField
                control={form.control}
                name="storeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Toko Penyelenggara</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || !!preSelectedStoreId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih cabang..." />
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

              {/* DISCOUNT TYPE */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Potongan</FormLabel>
                    <Select onValueChange={(val) => {
                      field.onChange(val);
                      // Reset contextual fields
                      form.setValue("value", 0);
                      form.setValue("productId", "");
                    }} value={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih mekanisme..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENT">Potongan Persen (%)</SelectItem>
                        <SelectItem value="NOMINAL">Potongan Langsung (Rp)</SelectItem>
                        <SelectItem value="B1G1">Buy 1 Get 1 (Bundle)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* PRODUCT SELECTOR (Searchable Combobox) */}
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Cakupan Produk
                    {selectedType === "B1G1" && <span className="text-destructive ml-1">*Wajib Spesifik</span>}
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isLoading || isFetchingProducts || !selectedStoreId}
                        >
                          {field.value && field.value !== "all"
                            ? products.find((product) => product.id === field.value)?.name 
                              ? products.find((product) => product.id === field.value)?.name.substring(0, 45) + "..."
                              : "Produk Tidak Ditemukan"
                            : field.value === "all" ? "Promo Store-wide (Semua Produk)"
                            : selectedType === "B1G1" ? "Pilih produk bundle..." : "Semua Produk / Spesifik..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[450px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Cari ketik nama produk..." />
                        <CommandList>
                          <CommandEmpty>Produk tidak ditemukan.</CommandEmpty>
                          <CommandGroup heading="Akses Global">
                            <CommandItem
                              value="all"
                              onSelect={() => {
                                field.onChange("all");
                              }}
                              disabled={selectedType === "B1G1"}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === "all" ? "opacity-100" : "opacity-0"
                                )}
                              />
                              Promo Keseluruhan (Seluruh SKU Cabang Ini)
                            </CommandItem>
                          </CommandGroup>
                          <CommandGroup heading="Produk Spesifik">
                            {products.map((product) => (
                              <CommandItem
                                value={product.id}
                                key={product.id}
                                onSelect={() => {
                                  field.onChange(product.id);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    product.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {product.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    {selectedType === "B1G1" ? "Promo B1G1 hanya dapat diterapkan pada 1 SKU yang sejenis." : "Bisa dipilih untuk promo eksklusif item tertentu saja."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DYNAMIC FORMS BASED ON TYPE */}
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 shadow-sm space-y-4">
              
              {selectedType === "PERCENT" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Besaran Persentase (%)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="number" min={1} max={100} placeholder="15" className="pl-8" disabled={isLoading} {...field} />
                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-medium">%</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minSpend"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimal Belanja</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Rp 50.000 (Opsional)" disabled={isLoading} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxDiscount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maksimal Potongan</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Rp 15.000 (Opsional)" disabled={isLoading} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {selectedType === "NOMINAL" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Potongan Nominal (Rp)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-medium">Rp</span>
                            <Input type="number" min={500} placeholder="10000" className="pl-9" disabled={isLoading} {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minSpend"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimal Belanja</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-medium">Rp</span>
                            <Input type="number" placeholder="50000 (Opsional)" className="pl-9" disabled={isLoading} {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {selectedType === "B1G1" && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <FormField
                    control={form.control}
                    name="buyQty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Syarat Beli (Buy Qty)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} placeholder="2" disabled={isLoading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="freeQty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gratis Hadiah (Free Qty)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} placeholder="1" disabled={isLoading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* DATE RANGE PICKER */}
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="flex flex-col mt-2">
                  <FormLabel>Periode Aktivasi Promo</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isLoading}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "LLL dd, y", { locale: id })} -{" "}
                                {format(field.value.to, "LLL dd, y", { locale: id })}
                              </>
                            ) : (
                              format(field.value.from, "LLL dd, y", { locale: id })
                            )
                          ) : (
                            <span>Pancangkan rentang waktu berjalan...</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={field.value?.from}
                        selected={{
                          from: field.value?.from,
                          to: field.value?.to,
                        }}
                        onSelect={field.onChange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Buat Promo Diskon
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
