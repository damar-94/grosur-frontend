"use client";

import * as React from "react";
import Image from "next/image";
import { Edit3 } from "lucide-react";
import { Product } from "@/services/productService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StockTableProps {
  products: Product[];
  onAdjustStock: (product: Product) => void;
  isLoading: boolean;
  storeSelected: boolean;
}

export function StockTable({
  products,
  onAdjustStock,
  isLoading,
  storeSelected,
}: StockTableProps) {
  if (!storeSelected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20">
        <p className="text-muted-foreground font-medium">
          Tidak ada toko yang dipilih.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Silakan pilih toko dari dropdown untuk melihat inventori toko.
        </p>
      </div>
    );
  }

  if (products.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20">
        <p className="text-muted-foreground font-medium">
          Tidak ada produk aktif yang ditemukan di toko ini.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">#</TableHead>
            <TableHead className="w-[300px]">Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Current Stock</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => {
            const qty = product.inventory?.quantity ?? 0;
            const isOutOfStock = qty <= 0;
            const isLowStock = qty > 0 && qty <= 5; // Arbitrary low stock threshold

            return (
              <TableRow key={product.id}>
                <TableCell className="font-medium text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 flex-shrink-0 bg-muted rounded-md overflow-hidden border">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                          IMG
                        </div>
                      )}
                    </div>
                    <span
                      className="font-medium line-clamp-1"
                      title={product.name}
                    >
                      {product.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      isOutOfStock
                        ? "destructive"
                        : isLowStock
                          ? "warning"
                          : "default"
                    }
                    className={
                      !isOutOfStock && !isLowStock
                        ? "bg-green-500 hover:bg-green-600"
                        : ""
                    }
                  >
                    {qty} Units
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAdjustStock(product)}
                  >
                    <Edit3 className="mr-2 h-3.5 w-3.5" /> Sesuaikan
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
