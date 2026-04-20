"use client";

import * as React from "react";
import { toast } from "sonner";
import { 
  CopyPlus, 
  CheckCircle2, 
  Ticket, 
  ShoppingBag, 
  Truck,
  Timer,
  Info,
  Gift
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { voucherService, Voucher } from "@/services/voucherService";
import { cn } from "@/lib/utils";
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
    description: "Potongan biaya pengiriman tanpa syarat ribet.",
    type: "SHIPPING",
    value: 15000,
    minSpend: 30000,
    expiryDays: 7,
  },
  {
    id: "SUPERPAYDAY",
    title: "Diskon Gajian Habis-habisan",
    description: "Promo akhir bulan potongan mutlak belanja apa saja.",
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

export default function VoucherCenterPage() {
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
      
      toast.success(`Berhasil mengklaim '${template.title}'!`);
      fetchMyVouchers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal mengklaim voucher.");
    } finally {
      setClaimingId(null);
    }
  };

  const isClaimed = (templateId: string) => {
    if (!user) return false;
    const assumedCode = `${templateId}-${user.id.substring(0, 5)}`.toUpperCase();
    return claimedVouchers.some(v => v.code === assumedCode);
  };

  const renderVoucherGrid = (filterType: "ALL" | "SHIPPING" | "TOTAL") => {
    const list = PUBLIC_VOUCHERS.filter(
      (v) => filterType === "ALL" || v.type === filterType
    );

    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in-95 duration-500">
           <div className="bg-muted/50 rounded-full p-8 mb-4">
            <Ticket className="h-16 w-16 text-muted-foreground opacity-10" />
           </div>
           <p className="text-muted-foreground font-medium text-lg">Belum ada voucher tersedia.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 pb-12">
        {list.map((template) => {
          const claimed = isClaimed(template.id);
          const isShipping = template.type === "SHIPPING";
          
          return (
            <div 
              key={template.id}
              className={cn(
                "group relative flex flex-col h-full overflow-hidden rounded-2xl border transition-all duration-500",
                claimed 
                  ? "bg-muted/40 border-muted opacity-80" 
                  : "bg-card border-border hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(0,153,122,0.1)] hover:-translate-y-1.5"
              )}
            >
              {/* Top Section: Visual Type Background */}
              <div className={cn(
                "p-8 flex flex-col items-center text-center relative",
                claimed ? "bg-stone-100" : (isShipping ? "bg-amber-500/10" : "bg-[#00997a]/5")
              )}>
                <div className={cn(
                  "p-4 rounded-2xl shadow-sm mb-4 transition-transform duration-500 group-hover:scale-110",
                  claimed ? "bg-stone-200 text-stone-500" : (isShipping ? "bg-amber-500 text-white" : "bg-[#00997a] text-white")
                )}>
                  {isShipping ? <Truck className="h-7 w-7" /> : <Gift className="h-7 w-7" />}
                </div>
                
                <h3 className="font-bold text-sm tracking-tight line-clamp-1 mb-1">
                  {template.title}
                </h3>
                <p className="text-[10px] text-muted-foreground px-4 line-clamp-2 min-h-10">
                  {template.description}
                </p>

                {/* Left/Right Cutouts (at the dashed line position) */}
                <div className="absolute -left-3 -bottom-3 h-6 w-6 rounded-full bg-background border border-border z-10" />
                <div className="absolute -right-3 -bottom-3 h-6 w-6 rounded-full bg-background border border-border z-10" />
              </div>

              {/* Decorative Divider */}
              <div className="relative border-t border-dashed border-border flex items-center justify-center h-0.5">
                 <div className="w-[85%] border-t border-dashed border-muted-foreground/30" />
              </div>

              {/* Bottom Section: Values & Claims */}
              <div className="p-8 flex flex-col flex-1 bg-card">
                <div className="flex flex-col items-center text-center mb-8">
                   <div className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/60 mb-2">Nilai Benefit</div>
                   <div className={cn(
                    "text-3xl font-black tabular-nums tracking-tighter",
                    claimed ? "text-stone-500" : (isShipping ? "text-amber-600" : "text-[#00997a]")
                  )}>
                    {template.value >= 1000 ? `Rp ${template.value / 1000}rb` : `${template.value}%`}
                  </div>
                  {template.minSpend && (
                    <div className="text-[10px] font-bold text-muted-foreground mt-2 bg-muted/50 px-2 py-0.5 rounded">
                      Syarat Min. Belanja Rp {template.minSpend.toLocaleString("id-ID")}
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-muted/50">
                   <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-4 font-medium px-1">
                      <div className="flex items-center gap-1">
                         <Timer className="h-3 w-3" />
                         <span>Masa Berlaku {template.expiryDays} Hari</span>
                      </div>
                   </div>

                  <Button 
                    onClick={() => handleClaim(template)}
                    disabled={claimed || claimingId === template.id || !user}
                    variant={claimed ? "secondary" : "default"}
                    className={cn(
                      "w-full font-black text-xs uppercase tracking-widest h-12 rounded-xl transition-all shadow-md group-hover:shadow-lg",
                      claimed 
                        ? "bg-stone-200 text-stone-500 hover:bg-stone-200 shadow-none" 
                        : (isShipping 
                          ? "bg-amber-600 text-white hover:bg-amber-700 shadow-amber-500/10" 
                          : "bg-[#00997a] text-white hover:bg-[#008066] shadow-primary/10")
                    )}
                  >
                    {claimed ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Voucher Tersimpan</span>
                      </div>
                    ) : claimingId === template.id ? (
                      <span className="flex items-center gap-2">
                        <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Klaim...
                      </span>
                    ) : (
                      "Ambil Voucher Ini"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-background min-h-[calc(100vh-200px)]">
      {/* Header Banner */}
      <div className="bg-card border-b relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
          <div className="grid grid-cols-6 gap-8 rotate-12 scale-150">
            {Array.from({ length: 24 }).map((_, i) => (
              <Ticket key={i} className="h-24 w-24 text-primary" />
            ))}
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-16 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-6">
              <Gift className="h-3.5 w-3.5" />
              <span>Grosur Loyalty Rewards</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-6">
              Pusat Hadiah <br />
              <span className="text-primary italic">&</span> Promo Harian
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Dapatkan keuntungan ekstra setiap belanja di Grosur. <br className="hidden md:block" />
              Gunakan voucher di bawah ini untuk potongan harga langsung dan subsidi pengiriman.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
            {[1, 2, 3, 4].map(n => (
              <Skeleton key={n} className="h-40 rounded-2xl" />
            ))}
          </div>
        ) : (
          <Tabs defaultValue="ALL" className="w-full">
            <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <TabsList className="bg-muted/50 p-1 rounded-xl h-12 w-fit">
                  <TabsTrigger value="ALL" className="rounded-lg px-6 font-bold text-xs h-10">Semua Voucher</TabsTrigger>
                  <TabsTrigger value="SHIPPING" className="rounded-lg px-6 font-bold text-xs h-10">Ongkos Kirim</TabsTrigger>
                  <TabsTrigger value="TOTAL" className="rounded-lg px-6 font-bold text-xs h-10">Potongan Belanja</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/30 px-4 py-2 rounded-lg border border-border/50">
                <Info className="h-4 w-4 text-primary" />
                <span>Voucher otomatis tersedia di halaman pembayaran setelah diklaim.</span>
              </div>
            </div>
            
            <div className="w-full">
              <TabsContent value="ALL" className="mt-0 focus-visible:outline-none">
                {renderVoucherGrid("ALL")}
              </TabsContent>
              <TabsContent value="SHIPPING" className="mt-0 focus-visible:outline-none">
                {renderVoucherGrid("SHIPPING")}
              </TabsContent>
              <TabsContent value="TOTAL" className="mt-0 focus-visible:outline-none">
                {renderVoucherGrid("TOTAL")}
              </TabsContent>
            </div>
          </div>
        </Tabs>
      )}

      {/* Guest Warning */}
      {!user && !isLoading && (
        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-bold text-amber-900 text-lg">Wujudkan Belanja Lebih Hemat</h4>
            <p className="text-sm text-amber-700">Masuk ke akun Grosur Anda untuk menyimpan voucher ini secara permanen ke dompet virtual Anda.</p>
          </div>
          <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 rounded-full">
            Login Sekarang
          </Button>
        </div>
      )}
      </div>
    </div>
  );
}
