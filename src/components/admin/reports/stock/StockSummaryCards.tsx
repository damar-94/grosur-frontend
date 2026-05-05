"use client";

import { ArrowUpCircle, ArrowDownCircle, TrendingUp, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { StockSummaryReport } from "@/services/reportService";

interface StockSummaryCardsProps {
  reports: StockSummaryReport[];
  isLoading: boolean;
}

export function StockSummaryCards({ reports, isLoading }: StockSummaryCardsProps) {
  const totalIn = reports.reduce((s, r) => s + r.totalIn, 0);
  const totalOut = reports.reduce((s, r) => s + r.totalOut, 0);
  const netMutation = totalIn - totalOut;
  const activeProducts = reports.filter(r => r.totalIn > 0 || r.totalOut > 0).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-none shadow-sm bg-emerald-50/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Total Masuk</p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-1">
                {isLoading ? <Skeleton className="h-8 w-16" /> : totalIn}
              </h3>
            </div>
            <div className="bg-emerald-100 p-2 rounded-lg">
              <ArrowUpCircle className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-rose-50/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-rose-600 uppercase tracking-wider">Total Keluar</p>
              <h3 className="text-2xl font-bold text-rose-700 mt-1">
                {isLoading ? <Skeleton className="h-8 w-16" /> : totalOut}
              </h3>
            </div>
            <div className="bg-rose-100 p-2 rounded-lg">
              <ArrowDownCircle className="h-6 w-6 text-rose-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-blue-50/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">Net Mutasi</p>
              <h3 className="text-2xl font-bold text-blue-700 mt-1">
                {isLoading ? <Skeleton className="h-8 w-16" /> : netMutation}
              </h3>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-slate-50/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 uppercase tracking-wider">Produk Aktif</p>
              <h3 className="text-2xl font-bold text-slate-700 mt-1">
                {isLoading ? <Skeleton className="h-8 w-16" /> : activeProducts}
              </h3>
            </div>
            <div className="bg-slate-200 p-2 rounded-lg">
              <Package className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
