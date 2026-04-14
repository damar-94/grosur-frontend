"use client";

import * as React from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { PlusCircle, Tag, Trash2 } from "lucide-react";

import { useAppStore } from "@/stores/useAppStore";
import { discountService, Discount } from "@/services/discountService";
import { productService } from "@/services/productService";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DiscountFormModal } from "@/components/admin/discounts/DiscountFormModal";

export default function DiscountManagementPage() {
  const { user } = useAppStore();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const storeAdminId = user?.managedStore?.id;

  const [stores, setStores] = React.useState<{ id: string; name: string }[]>([]);
  const [selectedStoreId, setSelectedStoreId] = React.useState<string | undefined>(
    isSuperAdmin ? undefined : storeAdminId
  );

  const [discounts, setDiscounts] = React.useState<Discount[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // 1. Fetch Stores for Super Admin
  React.useEffect(() => {
    if (isSuperAdmin) {
      productService.getStores().then((res) => {
        if (res.success) {
          setStores(res.data);
          if (res.data.length > 0 && !selectedStoreId) {
            setSelectedStoreId(res.data[0].id);
          }
        }
      }).catch(() => toast.error("Gagal memuat daftar toko"));
    }
  }, [isSuperAdmin, selectedStoreId]);

  // 2. Fetch Discounts
  const fetchDiscounts = React.useCallback(async () => {
    if (!selectedStoreId && isSuperAdmin) return;
    const targetStoreId = isSuperAdmin ? selectedStoreId : storeAdminId;

    if (!targetStoreId) return;

    try {
      setIsLoading(true);
      const res = await discountService.getStoreDiscounts(targetStoreId);
      if (res.success) {
        setDiscounts(res.data || []);
      }
    } catch (error) {
      toast.error("Gagal memuat daftar promosi diskon.");
    } finally {
      setIsLoading(false);
    }
  }, [isSuperAdmin, selectedStoreId, storeAdminId]);

  React.useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  // 3. Delete / Deactivate Discount
  const handleDelete = async (discountId: string) => {
    if (!confirm("Apakah Anda yakin ingin menonaktifkan kode promo ini secara permanen?")) return;
    try {
      await discountService.deleteDiscount(discountId);
      toast.success("Promo berhasil dinonaktifkan.");
      fetchDiscounts();
    } catch {
      toast.error("Gagal menghapus promo.");
    }
  };

  const getDiscountName = (d: Discount) => {
    const scopeName = d.product ? `Khusus ${d.product.name}` : "Seluruh Toko All-Items";
    if (d.type === "B1G1") {
      return `Buy ${d.buyQty} Get ${d.freeQty} (${scopeName})`;
    } else if (d.type === "PERCENT") {
      return `Potongan Promo ${Number(d.value)}% (${scopeName})`;
    } else {
      return `Korting Tunai Rp${Number(d.value).toLocaleString("id-ID")} (${scopeName})`;
    }
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Tag className="h-8 w-8 text-primary" />
            Manajemen Diskon
          </h2>
          <p className="text-muted-foreground mt-1">
            Membangun kampanye korting harga dan Bundle B1G1 adaptif lintas toko.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSuperAdmin ? (
            <Select value={selectedStoreId} onValueChange={(val) => setSelectedStoreId(val)}>
              <SelectTrigger className="w-[300px] border-primary/50 shadow-sm">
                <SelectValue placeholder="Pilih cabang penyelenggara..." />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-lg border border-primary/20">
              Cakupan Aktif: {user?.managedStore?.name || "Toko Regional"}
            </div>
          )}

          <Button 
            onClick={() => setIsModalOpen(true)}
            className="shadow-md bg-stone-900 hover:bg-stone-800"
            disabled={!selectedStoreId && isSuperAdmin}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Buat Promosi
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[50px] font-semibold">#</TableHead>
              <TableHead className="min-w-[300px] font-semibold">Identitas Promo & Target</TableHead>
              <TableHead className="font-semibold">Mekanisme</TableHead>
              <TableHead className="font-semibold">Periode Berlaku</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[250px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[70px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : discounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Tag className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="font-medium">Tidak ada kampanye diskon yang sedang berlangsung.</p>
                    <p className="text-sm mt-1">Buat diskon pertamamu dari tombol atas.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              discounts.map((discount, index) => {
                const expired = isExpired(discount.endDate);
                
                return (
                  <TableRow key={discount.id} className={expired || !discount.isActive ? "bg-muted/20" : ""}>
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold block text-stone-700">{getDiscountName(discount)}</span>
                      {discount.minSpend && (
                        <span className="text-xs text-muted-foreground">
                          Min. Belanja: Rp{Number(discount.minSpend).toLocaleString("id-ID")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        discount.type === "B1G1" ? "border-amber-500 text-amber-600 bg-amber-50" : 
                        discount.type === "PERCENT" ? "border-blue-500 text-blue-600 bg-blue-50" : 
                        "border-emerald-500 text-emerald-600 bg-emerald-50"
                      }>
                        {discount.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm flex flex-col gap-0.5">
                        <span className="font-medium whitespace-nowrap">
                          {format(new Date(discount.startDate), "dd MMM yyyy", { locale: id })}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          s/d {format(new Date(discount.endDate), "dd MMM yyyy", { locale: id })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {!discount.isActive ? (
                        <Badge variant="secondary">Dihentikan</Badge>
                      ) : expired ? (
                        <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">Expired</Badge>
                      ) : (
                        <Badge className="bg-green-500 hover:bg-green-600">Aktif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(discount.id)}
                        disabled={!discount.isActive}
                        title="Hentikan / Hapus Kuota"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <DiscountFormModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        stores={stores}
        preSelectedStoreId={isSuperAdmin ? selectedStoreId : storeAdminId}
        onSuccess={fetchDiscounts}
      />
    </div>
  );
}
