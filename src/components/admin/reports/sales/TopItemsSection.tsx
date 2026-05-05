"use client";

import { Package, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SalesReportResponse } from "@/services/salesService";

type ProductAggregation = SalesReportResponse["data"]["byProduct"][0];
type CategoryAggregation = SalesReportResponse["data"]["byCategory"][0];

interface TopItemsSectionProps {
  byProduct: ProductAggregation[];
  byCategory: CategoryAggregation[];
  formatCurrency: (amount: number) => string;
}

export function TopItemsSection({ byProduct, byCategory, formatCurrency }: TopItemsSectionProps) {
  if (byProduct.length === 0 && byCategory.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-[#00997a]" />
            Produk Terlaris
          </CardTitle>
        </CardHeader>
        <CardContent>
          {byProduct.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {byProduct.slice(0, 5).map((item, index) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all group"
                >
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="object-cover h-full w-full group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400">
                        <Package className="h-6 w-6" />
                      </div>
                    )}
                    <div className="absolute top-0 left-0 bg-[#00997a] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg shadow-sm">
                      #{index + 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate group-hover:text-[#00997a] transition-colors">
                      {item.productName}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.productName} {/* Should be category name if available, fallback to product name or empty */}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
                        <ShoppingCart className="h-3 w-3 text-blue-500" />
                        {item.quantity} terjual
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-[#00997a]">
                        {formatCurrency(item.revenue)}
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block">
                    <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00997a]"
                        style={{
                          width: `${Math.min(
                            100,
                            (item.revenue / byProduct[0].revenue) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-slate-50 p-4 rounded-full mb-4">
                <Package className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Belum ada data produk terlaris.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori Populer</CardTitle>
        </CardHeader>
        <CardContent>
          {byCategory.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byCategory.slice(0, 5).map((item) => (
                    <TableRow key={item.categoryId}>
                      <TableCell className="font-medium">
                        {item.categoryName}
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(item.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground italic">
              Belum ada data kategori untuk periode ini.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
