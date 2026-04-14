"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductFormValues } from "@/schemas/product.schema";
import type { Category } from "@/services/productService";

interface ProductFormFieldsProps {
  form: UseFormReturn<ProductFormValues>;
  categories: Category[];
  categoriesLoading?: boolean;
  /** Show isActive toggle (only needed in Edit mode) */
  showActiveToggle?: boolean;
}

export function ProductFormFields({
  form,
  categories,
  categoriesLoading = false,
  showActiveToggle = false,
}: ProductFormFieldsProps) {
  return (
    <div className="space-y-5">
      {/* Name */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nama Produk <span className="text-destructive">*</span></FormLabel>
            <FormControl>
              <Input placeholder="Contoh: Beras Premium 5kg" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Price */}
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Harga (Rp) <span className="text-destructive">*</span></FormLabel>
            <FormControl>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Rp
                </span>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  className="pl-9"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category */}
      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kategori <span className="text-destructive">*</span></FormLabel>
            {categoriesLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Deskripsi</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Deskripsikan produk secara singkat…"
                className="min-h-[100px] resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Active toggle (Edit only) */}
      {showActiveToggle && (
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <FormLabel className="text-base">Produk Aktif</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Produk non-aktif tidak akan tampil di katalog
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
