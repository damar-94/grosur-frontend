"use client";

import { FileText, ArrowUpCircle, ArrowDownCircle, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StockSummaryReport } from "@/services/reportService";
import { StockTableSkeleton } from "./StockTableSkeleton";

interface StockTableProps {
  reports: StockSummaryReport[];
  isLoading: boolean;
  isSuperAdmin: boolean;
  monthName: string;
  year: number;
  onViewDetail: (productId: string, productName: string) => void;
}

export function StockTable({
  reports,
  isLoading,
  isSuperAdmin,
  monthName,
  year,
  onViewDetail,
}: StockTableProps) {
  return (
    <Card className="border-none shadow-xl">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/50 border-b">
            <TableRow>
              <TableHead className="w-12 text-center print:hidden">No</TableHead>
              <TableHead className="font-bold whitespace-nowrap">Bulan</TableHead>
              <TableHead className="font-bold min-w-[200px]">Produk</TableHead>
              {isSuperAdmin && <TableHead className="font-bold whitespace-nowrap">Toko</TableHead>}
              <TableHead className="text-center font-bold whitespace-nowrap">Stok Awal</TableHead>
              <TableHead className="text-center font-bold text-emerald-600 whitespace-nowrap">Total Masuk (+)</TableHead>
              <TableHead className="text-center font-bold text-rose-600 whitespace-nowrap">Total Keluar (-)</TableHead>
              <TableHead className="text-center font-bold bg-muted/30 whitespace-nowrap">Stok Akhir</TableHead>
              <TableHead className="text-right print:hidden">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <StockTableSkeleton isSuperAdmin={isSuperAdmin} />
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isSuperAdmin ? 9 : 8} className="h-60 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <FileText className="h-12 w-12 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-medium">Tidak ada data mutasi stok pada periode ini.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report, index) => (
                <TableRow key={`${report.productId}-${report.storeName}`} className="hover:bg-muted/30 transition-colors border-b last:border-0 group">
                  <TableCell className="text-center text-muted-foreground print:hidden">{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    {monthName} {year}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{report.productName}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{report.unit}</div>
                  </TableCell>
                  {isSuperAdmin && <TableCell className="text-sm text-muted-foreground">{report.storeName}</TableCell>}
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
                      onClick={() => onViewDetail(report.productId, report.productName)}
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
  );
}
