"use client";

import * as React from "react";
import { toast } from "sonner";
import { CopyPlus, CheckCircle2, Ticket, ShoppingBag, Truck } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { voucherService, Voucher } from "@/services/voucherService";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock public voucher templates waiting to be claimed
const PUBLIC_VOUCHERS = [
  {
    id: "WELCOME",
    title: "Voucher Pengguna Baru",
    description: "Nikmati potongan belanja khusus member prioritas.",
    type: "TOTAL",
    value: 20000,
    minSpend: 50000,
    expiryDays: 14,
  },
  {
    id: "FREEONGKIR",
    title: "Gratis Ongkir Bebas Kapanpun",
    description: "Potongan biaya pengiriman tunai tanpa banyak syarat.",
    type: "SHIPPING",
    value: 15000,
    minSpend: 30000,
    expiryDays: 7,
  },
  {
    id: "SUPERPAYDAY",
    title: "Diskon Gajian Habis-habisan",
    description: "Promo akhir bulan potongan mutlak.",
    type: "TOTAL",
    value: 50000,
    minSpend: 250000,
    expiryDays: 3,
  },
  {
    id: "ONGKIRXTRA",
    title: "Subsidi Ekspedisi Jumbo",
    description: "Potongan harga tarif ekspedisi ke seluruh Indonesia.",
    type: "SHIPPING",
    value: 30000,
    minSpend: 100000,
    expiryDays: 30,
  },
];

export default function VoucherMarketplacePage() {
  const { user } = useAppStore();
  const [claimedVouchers, setClaimedVouchers] = React.useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [claimingId, setClaimingId] = React.useState<string | null>(null);

  const fetchMyVouchers = React.useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await voucherService.getUserVouchers();
      if (res.success) {
        setClaimedVouchers(res.data);
      }
    } catch {
      toast.error("Gagal memuat status voucher.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchMyVouchers();
  }, [fetchMyVouchers]);

  const handleClaim = async (template: typeof PUBLIC_VOUCHERS[0]) => {
    if (!user) {
      toast.error("Mohon login untuk mengklaim voucher.");
      return;
    }
    
    try {
      setClaimingId(template.id);
      await voucherService.claimVoucher({
        id: template.id,
        type: template.type,
        value: template.value,
        minSpend: template.minSpend,
        expiryDays: template.expiryDays,
      });
      
      toast.success(`Berhasil mengamankan '${template.title}' ke dalam saku Anda!`);
      fetchMyVouchers(); // Refresh claimed bounds
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal mengklaim voucher.");
    } finally {
      setClaimingId(null);
    }
  };

  // Check if a specific public voucher has already been claimed by deriving unique code logic 
  // (In real apps this evaluates against actual template_id mapping in backend)
  const isClaimed = (templateId: string) => {
    if (!user) return false;
    const assumedCode = `${templateId}-${user.id.substring(0, 5)}`.toUpperCase();
    return claimedVouchers.some(v => v.code === assumedCode);
  };

  const renderVoucherGrid = (filterType: "ALL" | "SHIPPING" | "TOTAL") => {
    const list = PUBLIC_VOUCHERS.filter(
      (v) => filterType === "ALL" || v.type === filterType
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 pb-8">
        {list.map((template) => {
          const claimed = isClaimed(template.id);
          const icon = template.type === "SHIPPING" ? <Truck className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />;

          return (
            <Card 
              key={template.id} 
              className={`flex flex-col overflow-hidden transition-all duration-300 ${
                claimed ? "grayscale opacity-75 border-muted bg-muted/20" : "hover:shadow-lg border-primary/20"
              }`}
            >
              <CardHeader className={`${claimed ? "bg-muted" : "bg-primary/5"} border-b pb-4`}>
                <div className="flex justify-between items-start gap-4">
                  <div className={`p-2 rounded-lg ${claimed ? "bg-stone-200 text-stone-500" : "bg-primary/10 text-primary"}`}>
                    {icon}
                  </div>
                  <Badge variant={claimed ? "secondary" : "default"} className={claimed ? "" : "bg-emerald-500 hover:bg-emerald-600"}>
                    {template.type === "SHIPPING" ? "ONKIR" : "DISKON"}
                  </Badge>
                </div>
                <CardTitle className={`text-xl mt-3 ${claimed ? "text-stone-600" : ""}`}>
                  {template.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 py-5">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Potongan</span>
                    <span className="font-bold text-lg text-primary">Rp{template.value.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Min. Belanja</span>
                    <span className="font-medium">Rp{template.minSpend.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Masa Aktif</span>
                    <span className="font-medium">{template.expiryDays} Hari Sejak Klaim</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0 pb-5">
                <Button 
                  onClick={() => handleClaim(template)}
                  disabled={claimed || claimingId === template.id || !user}
                  className={`w-full font-bold uppercase tracking-wider ${
                    claimed ? "bg-stone-300 text-stone-600 hover:bg-stone-300" : ""
                  }`}
                  variant={claimed ? "secondary" : "default"}
                >
                  {claimed ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Disimpan Dalam Saku
                    </>
                  ) : claimingId === template.id ? (
                    "Mengamankan..."
                  ) : (
                    <>
                      <CopyPlus className="mr-2 h-4 w-4" /> Klaim Sekarang
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-10 text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
          <Ticket className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-stone-900">Pusat Hadiah & Voucher</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Klaim segera berbagai voucer menarik untuk mendapatkan potongan harga mutlak dan subsidi bebas biaya kurir ke berbagai wilayah!
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3].map(n => (
            <Skeleton key={n} className="h-[320px] rounded-xl" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="ALL" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="ALL">Semua Promo</TabsTrigger>
              <TabsTrigger value="SHIPPING">Gratis Ongkir</TabsTrigger>
              <TabsTrigger value="TOTAL">Diskon Belanja</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="ALL" className="mt-0">{renderVoucherGrid("ALL")}</TabsContent>
          <TabsContent value="SHIPPING" className="mt-0">{renderVoucherGrid("SHIPPING")}</TabsContent>
          <TabsContent value="TOTAL" className="mt-0">{renderVoucherGrid("TOTAL")}</TabsContent>
        </Tabs>
      )}

      {/* Jika User Tidak Login */}
      {!user && !isLoading && (
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-center text-amber-800">
          <strong>Perhatian:</strong> Anda sedang dalam mode Guest (Tamu). Silakan masuk ke akun Anda agar bisa menyimpan voucher ke saku virtual.
        </div>
      )}
    </div>
  );
}
