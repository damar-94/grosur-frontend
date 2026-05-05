"use client";

import { Calendar, Filter, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SalesFiltersProps {
  month?: number;
  year?: number;
  storeId?: string;
  stores: Array<{ id: string; name: string }>;
  isSuperAdmin: boolean;
  onFilterChange: (filters: { month?: number | null; year?: number | null; storeId?: string | null; page?: number }) => void;
  onReset: () => void;
}

export function SalesFilters({
  month,
  year,
  storeId,
  stores,
  isSuperAdmin,
  onFilterChange,
  onReset,
}: SalesFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filter Laporan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Month Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Bulan
            </label>
            <Select
              value={month?.toString() || "all"}
              onValueChange={(value) =>
                onFilterChange({ month: value === "all" ? null : parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Bulan</SelectItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {new Date(2000, m - 1).toLocaleString("id-ID", { month: "long" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tahun
            </label>
            <Select
              value={year?.toString()}
              onValueChange={(value) => onFilterChange({ year: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tahun" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Store Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Store className="h-4 w-4" />
              Toko
            </label>
            <Select
              value={storeId || "all"}
              onValueChange={(value) =>
                onFilterChange({ storeId: value === "all" ? null : value })
              }
              disabled={!isSuperAdmin}
            >
              <SelectTrigger className={!isSuperAdmin ? "bg-slate-50 opacity-80" : ""}>
                <SelectValue placeholder="Pilih toko" />
              </SelectTrigger>
              <SelectContent>
                {isSuperAdmin && <SelectItem value="all">Semua Toko</SelectItem>}
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isSuperAdmin && (
              <p className="text-[10px] text-muted-foreground italic">
                *Terkunci pada toko yang Anda kelola
              </p>
            )}
          </div>

          {/* Reset Filters */}
          <div className="space-y-2 flex items-end">
            <Button
              variant="outline"
              onClick={onReset}
              className="w-full"
            >
              Reset Filter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
