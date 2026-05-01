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
  Filter,
  Printer,
  Download,
  TrendingUp,
  Package
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

import { Suspense } from "react";

function StockReportContent() {
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
      {/* Print-only Report Header */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold">Laporan Mutasi Stok - Grosur</h1>
        <div className="flex justify-between mt-2 text-sm">
          <div>
            <p><span className="font-semibold">Periode:</span> {months[month - 1]} {year}</p>
            <p><span className="font-semibold">Toko:</span> {storeId === "all" ? "Semua Toko" : stores.find(s => s.id === storeId)?.name || user?.managedStore?.name || "Toko Utama"}</p>
          </div>
          <div className="text-right">
            <p><span className="font-semibold">Tanggal Cetak:</span> {new Date().toLocaleDateString("id-ID")}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Stok</h2>
          <p className="text-muted-foreground"> Ringkasan mutasi stok produk per bulan.</p>
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

      {/* Filter Section */}
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-emerald-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Total Masuk</p>
                <h3 className="text-2xl font-bold text-emerald-700 mt-1">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : reports.reduce((s, r) => s + r.totalIn, 0)}
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
                  {isLoading ? <Skeleton className="h-8 w-16" /> : reports.reduce((s, r) => s + r.totalOut, 0)}
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
                  {isLoading ? <Skeleton className="h-8 w-16" /> : reports.reduce((s, r) => s + (r.totalIn - r.totalOut), 0)}
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
                  {isLoading ? <Skeleton className="h-8 w-16" /> : reports.filter(r => r.totalIn > 0 || r.totalOut > 0).length}
                </h3>
              </div>
              <div className="bg-slate-200 p-2 rounded-lg">
                <Package className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            <TableHeader className="bg-muted/50 border-b">
              <TableRow>
                <TableHead className="w-12 text-center print:hidden">No</TableHead>
                <TableHead className="font-bold whitespace-nowrap">Bulan</TableHead>
                <TableHead className="font-bold min-w-[200px]">Produk</TableHead>
                {user?.role === "SUPER_ADMIN" && <TableHead className="font-bold whitespace-nowrap">Toko</TableHead>}
                <TableHead className="text-center font-bold whitespace-nowrap">Stok Awal</TableHead>
                <TableHead className="text-center font-bold text-emerald-600 whitespace-nowrap">Total Masuk (+)</TableHead>
                <TableHead className="text-center font-bold text-rose-600 whitespace-nowrap">Total Keluar (-)</TableHead>
                <TableHead className="text-center font-bold bg-muted/30 whitespace-nowrap">Stok Akhir</TableHead>
                <TableHead className="text-right print:hidden">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton roles={user?.role} />
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={user?.role === "SUPER_ADMIN" ? 9 : 8} className="h-60 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <FileText className="h-12 w-12 text-muted-foreground/30" />
                      <p className="text-muted-foreground font-medium">Tidak ada data mutasi stok pada periode ini.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report, index) => (
                  <TableRow key={`${report.productId}-${report.storeName}`} className="hover:bg-muted/30 transition-colors border-b last:border-0 group">
                    <TableCell className="text-center text-muted-foreground print:hidden">{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {months[month - 1]} {year}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{report.productName}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{report.unit}</div>
                    </TableCell>
                    {user?.role === "SUPER_ADMIN" && <TableCell className="text-sm text-muted-foreground">{report.storeName}</TableCell>}
                    <TableCell className="text-center font-medium text-slate-600">
                      {report.initialStock}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold shadow-sm border ${
                        report.totalIn > 0 
                          ? "text-emerald-700 bg-emerald-50 border-emerald-100" 
                          : "text-slate-300 bg-slate-50/50 border-slate-100"
                      }`}>
                        <ArrowUpCircle className={`h-3.5 w-3.5 ${report.totalIn > 0 ? "text-emerald-600" : "text-slate-300"}`} />
                        {report.totalIn}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold shadow-sm border ${
                        report.totalOut > 0 
                          ? "text-rose-700 bg-rose-50 border-rose-100" 
                          : "text-slate-300 bg-slate-50/50 border-slate-100"
                      }`}>
                        <ArrowDownCircle className={`h-3.5 w-3.5 ${report.totalOut > 0 ? "text-rose-600" : "text-slate-300"}`} />
                        {report.totalOut}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold text-lg bg-slate-50/50">
                      {report.endStock}
                    </TableCell>
                    <TableCell className="text-right print:hidden">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium"
                        onClick={() => handleViewDetail(report.productId, report.productName)}
                      >
                        <History className="h-4 w-4 mr-2" /> Detail
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
          storeId={storeId || user?.managedStore?.id || ""}
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
          <TableCell className="print:hidden"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          {roles === "SUPER_ADMIN" && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
          <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-8 w-20 mx-auto rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-8 w-20 mx-auto rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
          <TableCell className="text-right print:hidden"><Skeleton className="h-9 w-32 ml-auto" /></TableCell>
        </TableRow>
      ))}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden, 
          button, 
          aside, 
          nav, 
          header,
          .fixed,
          [role="dialog"] {
            display: none !important;
          }
          .main-content, 
          .container, 
          .space-y-6 {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .card, .shadow-xl, .shadow-sm {
            box-shadow: none !important;
            border: 1px solid #eee !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th {
            background-color: #f8fafc !important;
            -webkit-print-color-adjust: exact;
          }
          .text-emerald-700 { color: #065f46 !important; }
          .bg-emerald-50 { background-color: #ecfdf5 !important; -webkit-print-color-adjust: exact; }
          .text-rose-700 { color: #9f1239 !important; }
          .bg-rose-50 { background-color: #fff1f2 !important; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </>
  );
}

export default function StockReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Report...</div>}>
      <StockReportContent />
    </Suspense>
  );
}
