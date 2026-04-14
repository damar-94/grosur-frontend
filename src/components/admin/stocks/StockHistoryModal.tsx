"use client";

import * as React from "react";
import { format } from "date-fns";
import { ArrowRight, Loader2 } from "lucide-react";
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
import { Product } from "@/services/productService";
import { stockService, StockJournal } from "@/services/stockService";

interface StockHistoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  storeId: string;
}

export function StockHistoryModal({
  isOpen,
  onOpenChange,
  product,
  storeId,
}: StockHistoryModalProps) {
  const [journals, setJournals] = React.useState<StockJournal[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (isOpen && product && storeId) {
      setIsLoading(true);
      stockService
        .getStockJournals({ productId: product.id, storeId, limit: 50 })
        .then((res) => {
          if (res.success) {
            setJournals(res.data);
          }
        })
        .catch(() => {
          toast.error("Gagal memuat riwayat stok.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, product, storeId]);

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Riwayat Stok / Jurnal</DialogTitle>
          <DialogDescription>
            Audit riwayat perubahan stok untuk <strong>{product.name}</strong>. Data ini berifat read-only.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto mt-4 rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-[180px]">Waktu</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Perubahan (Old → New)</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Alasan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Memuat riwayat...</p>
                  </TableCell>
                </TableRow>
              ) : journals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <p className="text-muted-foreground font-medium">Belum ada riwayat mutasi stok untuk produk ini.</p>
                  </TableCell>
                </TableRow>
              ) : (
                journals.map((journal) => {
                  const isIncoming = journal.type === "IN";
                  return (
                    <TableRow key={journal.id}>
                      <TableCell className="text-sm">
                        {format(new Date(journal.createdAt), "dd MMM yyyy, HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {journal.user?.name || "System/Unknown"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{journal.oldQuantity}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="font-bold">{journal.newQuantity}</span>
                          <span className={`ml-2 font-medium ${isIncoming ? 'text-green-600' : 'text-red-500'}`}>
                            ({isIncoming ? "+" : "-"}{journal.quantity})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={isIncoming ? "default" : "destructive"}
                          className={isIncoming ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {journal.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[250px] text-sm text-muted-foreground">
                        {journal.reason || "-"}
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
