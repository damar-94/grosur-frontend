"use client";

import { Search, Calendar, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StockFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  month: number;
  year: number;
  storeId: string;
  months: string[];
  years: number[];
  stores: { id: string; name: string }[];
  isSuperAdmin: boolean;
  onFilterChange: (key: string, value: string) => void;
}

export function StockFilters({
  searchTerm,
  onSearchChange,
  month,
  year,
  storeId,
  months,
  years,
  stores,
  isSuperAdmin,
  onFilterChange,
}: StockFiltersProps) {
  return (
    <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
              <Search className="h-3 w-3" /> Cari Produk
            </label>
            <Input
              placeholder="Nama produk..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="space-y-2 w-40">
            <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Bulan
            </label>
            <Select
              value={String(month)}
              onValueChange={(v) => onFilterChange("month", v)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={i} value={String(i + 1)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 w-32">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Tahun</label>
            <Select
              value={String(year)}
              onValueChange={(v) => onFilterChange("year", v)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isSuperAdmin && (
            <div className="space-y-2 w-64">
              <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                <Store className="h-3 w-3" /> Toko
              </label>
              <Select
                value={storeId || "all"}
                onValueChange={(v) => onFilterChange("storeId", v)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Semua Toko" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Toko</SelectItem>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
