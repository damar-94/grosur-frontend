"use client";

import * as React from "react";
import { 
  FileText, 
  Search, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  History,
  Store,
  Calendar,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { reportService, StockSummaryReport } from "@/services/reportService";
import { salesService } from "@/services/salesService";
import { useAppStore } from "@/stores/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StockReportDetailModal } from "@/components/admin/reports/StockReportDetailModal";

const months = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function StockReportPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAppStore();

  const [reports, setReports] = React.useState<StockSummaryReport[]>([]);
  const [stores, setStores] = React.useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  
  // Detail Modal State
  const [selectedProduct, setSelectedProduct] = React.useState<{ id: string; name: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Filters from URL
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") || String(currentYear));
  const storeId = searchParams.get("storeId") || "";

  React.useEffect(() => {
    if (user?.role === "SUPER_ADMIN") {
      salesService.getStores().then((res) => {
        if (res.success) setStores(res.data);
      });
    }
  }, [user]);

  const fetchReport = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await reportService.getStockSummary({
        month,
        year,
        storeId: storeId || undefined,
      });
      if (response.success) {
        setReports(response.data);
      }
    } catch (error) {
      toast.error("Gagal memuat laporan stok");
    } finally {
      setIsLoading(false);
    }
  }, [month, year, storeId]);

  React.useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const filteredReports = reports.filter((r) =>
    r.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetail = (productId: string, productName: string) => {
    setSelectedProduct({ id: productId, name: productName });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Stok</h2>
          <p className="text-muted-foreground"> Ringkasan mutasi stok produk per bulan.</p>
        </div>
      </div>

      {/* Filter Section */}
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="space-y-2 w-40">
              <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Bulan
              </label>
              <Select
                value={String(month)}
                onValueChange={(v) => updateFilters("month", v)}
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
                onValueChange={(v) => updateFilters("year", v)}
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

            {user?.role === "SUPER_ADMIN" && (
              <div className="space-y-2 w-64">
                <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                  <Store className="h-3 w-3" /> Toko
                </label>
                <Select
                  value={storeId || "all"}
                  onValueChange={(v) => updateFilters("storeId", v)}
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

      {/* Main Table */}
      <Card className="border-none shadow-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-12 text-center">No</TableHead>
                <TableHead>Produk</TableHead>
                {user?.role === "SUPER_ADMIN" && <TableHead>Toko</TableHead>}
                <TableHead className="text-center font-bold text-green-600">Total Masuk</TableHead>
                <TableHead className="text-center font-bold text-red-600">Total Keluar</TableHead>
                <TableHead className="text-center font-bold bg-muted/30">Stok Akhir</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton roles={user?.role} />
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={user?.role === "SUPER_ADMIN" ? 7 : 6} className="h-60 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <FileText className="h-12 w-12 text-muted-foreground/30" />
                      <p className="text-muted-foreground font-medium">Tidak ada data mutasi stok pada periode ini.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report, index) => (
                  <TableRow key={`${report.productId}-${report.storeName}`} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-semibold">{report.productName}</TableCell>
                    {user?.role === "SUPER_ADMIN" && <TableCell className="text-sm text-muted-foreground">{report.storeName}</TableCell>}
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-green-700 bg-green-50 border border-green-100 font-medium">
                        <ArrowUpCircle className="h-3.5 w-3.5" />
                        {report.totalIn}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-red-700 bg-red-50 border border-red-100 font-medium">
                        <ArrowDownCircle className="h-3.5 w-3.5" />
                        {report.totalOut}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold text-lg bg-muted/10">
                      {report.endStock}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleViewDetail(report.productId, report.productName)}
                      >
                        <History className="h-4 w-4 mr-2" /> Detail Riwayat
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedProduct && (
        <StockReportDetailModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          storeId={storeId || user?.managedStoreId || ""}
          month={month}
          year={year}
        />
      )}
    </div>
  );
}

function TableSkeleton({ roles }: { roles?: string }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          {roles === "SUPER_ADMIN" && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
          <TableCell><Skeleton className="h-8 w-20 mx-auto rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-8 w-20 mx-auto rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-9 w-32 ml-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}
