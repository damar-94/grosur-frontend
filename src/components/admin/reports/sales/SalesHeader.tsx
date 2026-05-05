"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SalesHeaderProps {
  onExport: () => void;
  isExporting: boolean;
  hasData: boolean;
}

export function SalesHeader({ onExport, isExporting, hasData }: SalesHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Laporan Penjualan</h2>
        <p className="text-muted-foreground mt-1">
          Analisis dan pantau performa penjualan toko Anda
        </p>
      </div>
      <Button
        onClick={onExport}
        disabled={isExporting || !hasData}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        {isExporting ? "Mengunduh..." : "Export CSV"}
      </Button>
    </div>
  );
}
