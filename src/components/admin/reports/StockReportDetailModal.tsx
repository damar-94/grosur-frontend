"use client";

import * as React from "react";
import { format } from "date-fns";
import { ArrowRight, Loader2, FileText } from "lucide-react";
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
  const [journals, setJournals] = React.useState<StockDetailReport[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (isOpen && productId && storeId) {
      setIsLoading(true);
      reportService
        .getStockDetail({ productId, storeId, month, year })
        .then((res) => {
          if (res.success) {
            setJournals(res.data || []);
          }
        })
        .catch(() => {
          toast.error("Gagal memuat detail riwayat stok.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, productId, storeId, month, year]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-5xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-2xl">Detail Mutasi Stok</DialogTitle>
            <Badge variant="outline" className="bg-primary/5 text-primary text-xs font-normal">
              {month}/{year}
            </Badge>
          </div>
          <DialogDescription className="text-base">
            Riwayat lengkap pergerakan stok untuk <strong>{productName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto rounded-xl border border-muted shadow-inner bg-slate-50/30">
          <Table>
            <TableHeader className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b">
              <TableRow>
                <TableHead className="w-[180px]">Waktu</TableHead>
                <TableHead>User / Aktor</TableHead>
                <TableHead className="text-center">Aktivitas</TableHead>
                <TableHead>Perubahan (Old → New)</TableHead>
                <TableHead>Catatan / Alasan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white/50">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm font-medium text-muted-foreground">Menarik data dari database...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : journals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-60 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="bg-muted p-4 rounded-full">
                        <FileText className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-slate-800">Tidak Ada Rekaman</p>
                        <p className="text-sm text-muted-foreground">Belum ada mutasi stok terdeteksi pada bulan ini.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                journals.map((journal) => {
                  const isIncoming = journal.change > 0;
                  return (
                    <TableRow key={journal.id} className="hover:bg-muted/30 group transition-colors">
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        {format(new Date(journal.createdAt), "dd MMM yyyy, HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-slate-900 leading-tight">
                            {journal.userName}
                          </span>
                          {journal.order && (
                            <span className="text-[10px] text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded w-fit mt-1">
                              Order: {journal.order.orderNumber}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={isIncoming ? "default" : "destructive"}
                          className={`
                            ${isIncoming ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"}
                            text-[10px] font-bold tracking-wider uppercase
                          `}
                        >
                          {journal.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-400 font-medium">{journal.oldQty}</span>
                          <ArrowRight className="h-3 w-3 text-slate-300" />
                          <span className="font-extrabold text-slate-900">{journal.newQty}</span>
                          <span className={`
                            ml-2 text-xs font-black px-1.5 py-0.5 rounded
                            ${isIncoming ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}
                          `}>
                            {isIncoming ? "+" : ""}{journal.change}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[250px] text-sm text-slate-600 italic">
                        {journal.reason || "Manual Adjustment"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
