"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StockPageHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Laporan Stok</h2>
        <p className="text-muted-foreground">Ringkasan mutasi stok produk per bulan.</p>
      </div>
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          onClick={() => window.print()}
          className="bg-white hover:bg-slate-50 border-slate-200 shadow-sm transition-all hover:shadow-md active:scale-95"
        >
          <Printer className="h-4 w-4 mr-2 text-indigo-600" />
          Cetak Laporan
        </Button>
      </div>
    </div>
  );
}
