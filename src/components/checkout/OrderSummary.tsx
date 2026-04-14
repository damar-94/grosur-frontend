"use client";

import { api } from "@/lib/axiosInstance";
import { useAppStore } from "@/stores/useAppStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import VoucherInput, { VoucherResult } from "@/components/checkout/VoucherInput";
import { ShieldCheck, Sparkles } from "lucide-react";

interface OrderSummaryProps {
  shippingCost: number;
  selectedCourier: string;
}

export default function OrderSummary({ shippingCost, selectedCourier }: OrderSummaryProps) {
  const { cart, currentStore, clearCart } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [voucherResult, setVoucherResult] = useState<VoucherResult | null>(null);
  const router = useRouter();

  // 1. Calculate Subtotal
  const subtotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  // 2. Product-level discount (auto-applied from product data if any)
  const productDiscount = cart.reduce((acc, item) => {
    const disc = item.product.discount ?? 0;
    return acc + disc * item.quantity;
  }, 0);

  const subtotalAfterProductDiscount = subtotal - productDiscount;

  // 3. Voucher discount
  const voucherDiscount = voucherResult?.discountAmount ?? 0;

  // 4. Final total
  const total = Math.max(0, subtotalAfterProductDiscount - voucherDiscount + shippingCost);

  // 5. Handle Checkout Action
  const handleCheckout = async () => {
    if (!currentStore || cart.length === 0) return;
    setIsProcessing(true);
    try {
      const payload = {
        storeId: currentStore.id,
        shippingCost,
        courier: selectedCourier,
        voucherCode: voucherResult?.voucher?.code ?? undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      const res = await api.post("/orders/checkout", payload);
      clearCart();
      router.push(`/checkout/payment/${res.data.data.id}`);
    } catch (error) {
      console.error("Checkout failed", error);
      alert("Gagal memproses pesanan. Silakan coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 space-y-5 sticky top-24">
      <h3 className="text-lg font-bold text-[#1a1a1a] flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        Ringkasan Belanja
      </h3>

      {/* Cost Breakdown */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal ({cart.length} barang)</span>
          <span className="font-medium">Rp {subtotal.toLocaleString("id-ID")}</span>
        </div>

        {productDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Diskon Produk
            </span>
            <span className="font-bold text-emerald-600">
              - Rp {productDiscount.toLocaleString("id-ID")}
            </span>
          </div>
        )}

        {voucherDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">
              Diskon Voucher{" "}
              <span className="text-xs font-mono text-primary">
                ({voucherResult?.voucher?.code})
              </span>
            </span>
            <span className="font-bold text-emerald-600">
              - Rp {voucherDiscount.toLocaleString("id-ID")}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-500">Ongkos Kirim</span>
          <span className={`font-medium ${shippingCost === 0 ? "text-gray-400 italic" : ""}`}>
            {shippingCost === 0
              ? "Belum dipilih"
              : `Rp ${shippingCost.toLocaleString("id-ID")}`}
          </span>
        </div>
      </div>

      <Separator />

      {/* Total savings highlight */}
      {(productDiscount + voucherDiscount) > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-sm text-emerald-700 font-medium">
          🎉 Kamu hemat Rp{" "}
          {(productDiscount + voucherDiscount).toLocaleString("id-ID")}!
        </div>
      )}

      {/* Voucher Input */}
      <VoucherInput
        cartTotal={subtotalAfterProductDiscount}
        onApplied={(result) => setVoucherResult(result)}
      />

      <Separator />

      {/* Final Total */}
      <div className="flex justify-between items-center">
        <span className="text-base font-bold text-[#1a1a1a]">Total Pembayaran</span>
        <span className="text-2xl font-extrabold text-[#00997a]">
          Rp {total.toLocaleString("id-ID")}
        </span>
      </div>

      <button
        onClick={handleCheckout}
        disabled={isProcessing || cart.length === 0 || shippingCost === 0}
        className="w-full py-3 bg-[#00997a] text-white font-bold rounded-lg hover:bg-[#00997a]/90 disabled:opacity-50 transition-all"
      >
        {isProcessing ? "Memproses..." : "Bayar Sekarang"}
      </button>

      <p className="text-[10px] text-gray-400 text-center">
        Dengan menekan tombol, Anda menyetujui syarat &amp; ketentuan yang berlaku.
      </p>
    </div>
  );
}