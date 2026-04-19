"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Product } from "@/services/productService";
import { stockService } from "@/services/stockService";

const stockAdjustmentSchema = z.object({
  change: z.coerce.number().refine((val) => val !== 0, {
    message: "Jumlah perubahan tidak boleh 0",
  }),
  reason: z.string().min(5, "Harap berikan alasan deskriptif (min 5 karakter)"),
});

type StockAdjustmentValues = z.infer<typeof stockAdjustmentSchema>;

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  storeId: string;
  onSuccess: () => void;
}

export function StockAdjustmentModal({
  isOpen,
  onOpenChange,
  product,
  storeId,
  onSuccess,
}: StockAdjustmentModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const currentStock = product?.inventory?.quantity || 0;

  const form = useForm<StockAdjustmentValues>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      change: 0,
      reason: "",
    },
  });

  const changeValue = form.watch("change");
  const finalStock = currentStock + (Number(changeValue) || 0);
  const isInvalidStock = finalStock < 0;

  React.useEffect(() => {
    if (isOpen) {
      form.reset({ change: 0, reason: "" });
    }
  }, [isOpen, form]);

  const onSubmit = async (values: StockAdjustmentValues) => {
    if (!product || !storeId) return;

    if (finalStock < 0) {
      toast.error("Stok akhir tidak boleh negatif!");
      return;
    }

    try {
      setIsLoading(true);
      await stockService.updateStock({
        productId: product.id,
        storeId,
        change: values.change,
        reason: values.reason,
      });
      toast.success(`Stok berhasil disesuaikan. ${values.change > 0 ? '+' : ''}${values.change} unit.`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err.response?.data?.message || "Gagal menyimpan penyesuaian stok.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sesuaikan Inventori Stok</DialogTitle>
          <DialogDescription>
            Item target: <strong>{product.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
              <span className="text-sm font-medium text-muted-foreground">Stok Dasar Saat Ini:</span>
              <span className="font-bold text-lg">{currentStock}</span>
            </div>

            <FormField
              control={form.control}
              name="change"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Penyesuaian (Gunakan angka negatif untuk pengurangan)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="misal: 10 atau -5" 
                      disabled={isLoading} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alasan penyesuaian</FormLabel>
                  <FormControl>
                    <Input placeholder="misal: Kemasan rusak, RESTOCK#123" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormDescription>Catatan ini akan disimpan untuk audit</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between p-4 mt-2 rounded-lg border bg-muted/40">
              <span className="text-sm font-medium">Pratinjau Stok Akhir:</span>
              <div className="flex items-center gap-2">
                {changeValue > 0 && <TrendingUp className="h-4 w-4 text-green-500" />}
                {changeValue < 0 && <TrendingDown className="h-4 w-4 text-red-500" />}
                <span className={`font-bold text-xl ${isInvalidStock ? 'text-destructive' : ''}`}>
                  {finalStock}
                </span>
              </div>
            </div>
            {isInvalidStock && (
              <p className="text-xs text-destructive text-right font-medium">Pratinjau menghasilkan nilai negatif yang tidak valid.</p>
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading || isInvalidStock}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Penyesuaian
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
