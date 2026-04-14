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
    message: "Change quantity cannot be 0",
  }),
  reason: z.string().min(5, "Please provide a descriptive reason (min 5 chars)"),
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
      toast.error("Final stock cannot be negative!");
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
      toast.success(`Stock adjusted successfully. ${values.change > 0 ? '+' : ''}${values.change} units.`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err.response?.data?.message || "Failed to submit stock adjustment.";
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
          <DialogTitle>Adjust Stock Inventory</DialogTitle>
          <DialogDescription>
            Target item: <strong>{product.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
              <span className="text-sm font-medium text-muted-foreground">Current Base Stock:</span>
              <span className="font-bold text-lg">{currentStock}</span>
            </div>

            <FormField
              control={form.control}
              name="change"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment (Use negative for deduction)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="e.g. 10 or -5" 
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
                  <FormLabel>Reason for adjustment</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Broken package, RESTOCK#123" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormDescription>This will be logged for auditing</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between p-4 mt-2 rounded-lg border bg-muted/40">
              <span className="text-sm font-medium">Preview Final Stock:</span>
              <div className="flex items-center gap-2">
                {changeValue > 0 && <TrendingUp className="h-4 w-4 text-green-500" />}
                {changeValue < 0 && <TrendingDown className="h-4 w-4 text-red-500" />}
                <span className={`font-bold text-xl ${isInvalidStock ? 'text-destructive' : ''}`}>
                  {finalStock}
                </span>
              </div>
            </div>
            {isInvalidStock && (
              <p className="text-xs text-destructive text-right font-medium">Preview results in invalid negative value.</p>
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isInvalidStock}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Adjustment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
