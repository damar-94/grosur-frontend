"use client";

import * as React from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { 
  ArrowRight, 
  Loader2, 
  FileText, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { reportService, StockDetailReport } from "@/services/reportService";

interface StockReportDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  storeId: string;
  month: number;
  year: number;
}

export function StockReportDetailModal({
  isOpen,
  onOpenChange,
  productId,
  productName,
  storeId,
  month,
  year,
}: StockReportDetailModalProps) {
  // Filters and Pagination State
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  
  // Data State
  const [journals, setJournals] = React.useState<StockDetailReport[]>([]);
  const [meta, setMeta] = React.useState<{ total: number; totalPages: number } | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Initialize dates based on selected month/year from parent
  React.useEffect(() => {
    if (isOpen) {
      const start = startOfMonth(new Date(year, month - 1));
      const end = endOfMonth(new Date(year, month - 1));
      setStartDate(format(start, "yyyy-MM-dd"));
      setEndDate(format(end, "yyyy-MM-dd"));
      setPage(1);
    }
  }, [isOpen, month, year]);

  const fetchHistory = React.useCallback(async () => {
    if (!productId || !storeId) return;
    
    setIsLoading(true);
    try {
      const res = await reportService.getStockDetail({
        productId,
        storeId,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        page,
        limit,
      });

      if (res.success) {
        setJournals(res.data || []);
        setMeta(res.meta);
      }
    } catch (error) {
      console.error("Failed to fetch stock history:", error);
      toast.error("Gagal memuat detail riwayat stok.");
    } finally {
      setIsLoading(false);
    }
  }, [productId, storeId, startDate, endDate, page, limit]);

  React.useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, page, fetchHistory]);

  const handleApplyFilter = () => {
    setPage(1);
    fetchHistory();
  };

  const handleResetFilter = () => {
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(new Date(year, month - 1));
    setStartDate(format(start, "yyyy-MM-dd"));
    setEndDate(format(end, "yyyy-MM-dd"));
    setPage(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-6xl max-h-[92vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        {/* Header Section */}
        <div className="p-6 pb-4 border-b bg-white">
          <DialogHeader className="mb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <RefreshCw className={`h-5 w-5 text-indigo-600 ${isLoading ? 'animate-spin' : ''}`} />
                  Detail Riwayat Stok
                </DialogTitle>
                <DialogDescription className="text-slate-500">
                  Riwayat pergerakan stok untuk <span className="font-bold text-slate-800">{productName}</span> 
                  {storeId === "all" ? " (Semua Toko)" : ""}
                </DialogDescription>
              </div>
              <Badge variant="secondary" className="w-fit h-7 px-3 bg-indigo-50 text-indigo-700 border-indigo-100 font-semibold">
                {format(new Date(year, month - 1), "MMMM yyyy")}
              </Badge>
            </div>
          </DialogHeader>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-end gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="space-y-1.5 flex-1 min-w-[150px]">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 ml-1">
                <CalendarIcon className="h-3 w-3" /> Dari Tanggal
              </label>
              <Input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 bg-white border-slate-200 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5 flex-1 min-w-[150px]">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 ml-1">
                <CalendarIcon className="h-3 w-3" /> Sampai Tanggal
              </label>
              <Input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 bg-white border-slate-200 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleApplyFilter}
                className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleResetFilter}
                className="h-9 border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-6 pt-0 bg-slate-50/50">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mt-4">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b">
                <TableRow>
                  <TableHead className="w-[180px] font-bold text-slate-700">Waktu</TableHead>
                  <TableHead className="font-bold text-slate-700">Admin / Aktor</TableHead>
                  <TableHead className="text-center font-bold text-slate-700">Tipe</TableHead>
                  <TableHead className="font-bold text-slate-700">Perubahan</TableHead>
                  <TableHead className="min-w-[200px] font-bold text-slate-700">Alasan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    </TableRow>
                  ))
                ) : journals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="bg-slate-100 p-4 rounded-full">
                          <FileText className="h-8 w-8 text-slate-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-slate-800">Tidak ada riwayat</p>
                          <p className="text-sm text-slate-500">Coba ubah filter rentang tanggal Anda.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  journals.map((journal) => {
                    const isIncoming = journal.change > 0;
                    return (
                      <TableRow key={journal.id} className="hover:bg-slate-50 transition-colors group">
                        <TableCell className="text-[13px] text-slate-500 font-medium">
                          {format(new Date(journal.createdAt), "dd MMM yyyy, HH:mm")}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-800 tracking-tight">
                              {journal.userName}
                            </span>
                            {journal.order && (
                              <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50/50 px-1.5 py-0.5 rounded border border-indigo-100 w-fit mt-1">
                                ORD: {journal.order.orderNumber}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            className={`
                              ${isIncoming ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-rose-100 text-rose-700 border-rose-200"}
                              text-[10px] font-bold tracking-wider uppercase border px-2 py-0.5
                            `}
                          >
                            {journal.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-[13px]">
                            <span className="text-slate-400">{journal.oldQty}</span>
                            <ArrowRight className="h-3 w-3 text-slate-300" />
                            <span className="font-bold text-slate-900">{journal.newQty}</span>
                            <span className={`
                              ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded
                              ${isIncoming ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}
                            `}>
                              {isIncoming ? "+" : ""}{journal.change}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 py-4 italic">
                          {journal.reason || "Manual adjustment"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer with Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="p-4 border-t bg-white flex items-center justify-between px-6">
            <p className="text-xs text-slate-500 font-medium font-mono">
              Halaman <span className="text-indigo-600">{page}</span> dari {meta.totalPages} • Total {meta.total} rekaman
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="h-8 border-slate-200 text-slate-600 hover:bg-slate-50 px-3 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages || isLoading}
                className="h-8 border-slate-200 text-slate-600 hover:bg-slate-50 px-3 transition-colors"
              >
                Berikutnya
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

