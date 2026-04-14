"use client";

import { api } from "@/lib/axiosInstance";
import { useAppStore } from "@/stores/useAppStore";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import VoucherInput, { VoucherResult } from "@/components/checkout/VoucherInput";
import { ShieldCheck, Sparkles } from "lucide-react";
import { productService } from "@/services/productService";

interface OrderSummaryProps {
  shippingCost: number;
  selectedCourier: string;
}

export default function OrderSummary({ shippingCost, selectedCourier }: OrderSummaryProps) {
  const { cart, currentStore, clearCart } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [voucherResult, setVoucherResult] = useState<VoucherResult | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const router = useRouter();

  // 1. Logic to fetch preview from backend
  const fetchPreview = async () => {
    if (!currentStore || cart.length === 0) return;
    
    setLoadingPreview(true);
    try {
      const payload = {
        storeId: currentStore.id,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: typeof item.product.price === "string" ? parseFloat(item.product.price) : item.product.price,
        })),
        voucherCode: voucherResult?.voucher?.code,
        shippingCost: shippingCost || 0,
      };

      const res = await productService.previewCheckout(payload);
      if (res.success) {
        setPreviewData(res.summary);
      }
    } catch (error) {
      console.error("Preview failed", error);
    } finally {
      setLoadingPreview(false);
    }
  };

  // 2. Trigger preview on data changes
  useEffect(() => {
    fetchPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length, JSON.stringify(cart), voucherResult?.voucher?.code, shippingCost, currentStore?.id]);

  // 3. Fallback / Loading State mapping
  const subtotal = previewData?.subtotal || cart.reduce((acc, item) => acc + (typeof item.product.price === "string" ? parseFloat(item.product.price) : item.product.price) * item.quantity, 0);
  const productDiscount = previewData?.productDiscount || 0;
  const voucherDiscount = previewData?.voucherDiscount || 0;
  const finalShippingCost = previewData?.shippingCost ?? shippingCost;
  const total = previewData?.finalAmount || (subtotal - productDiscount - voucherDiscount + finalShippingCost);

  // 4. Handle Checkout
  const handleCheckout = async () => {
    if (!currentStore || cart.length === 0) return;
    setIsProcessing(true);
    try {
      const payload = {
        storeId: currentStore.id,
        shippingCost: finalShippingCost,
        courier: selectedCourier,
        voucherCode: voucherResult?.voucher?.code ?? undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: typeof item.product.price === "string" ? parseFloat(item.product.price) : item.product.price,
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
      <div className={`space-y-3 text-sm transition-opacity ${loadingPreview ? 'opacity-50' : 'opacity-100'}`}>
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
              <span className="text-xs font-mono text-primary italic">
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
          <span className={`font-medium ${finalShippingCost === 0 ? "text-gray-400 italic" : ""}`}>
            {finalShippingCost === 0 && !selectedCourier
              ? "Belum dipilih"
              : `Rp ${finalShippingCost.toLocaleString("id-ID")}`}
          </span>
        </div>
      </div>

      <Separator />

      {/* Total savings highlight */}
      {(productDiscount + voucherDiscount) > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-sm text-emerald-700 font-medium animate-in fade-in slide-in-from-top-1">
          🎉 Kamu hemat Rp{" "}
          {(productDiscount + voucherDiscount).toLocaleString("id-ID")}!
        </div>
      )}

      {/* Voucher Input */}
      <VoucherInput
        cartTotal={subtotal - productDiscount}
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
        disabled={isProcessing || cart.length === 0 || (!selectedCourier && finalShippingCost === 0)}
        className="w-full py-4 bg-[#00997a] text-white font-bold rounded-xl hover:bg-[#00997a]/90 disabled:opacity-50 transition-all shadow-md shadow-[#00997a]/20"
      >
        {isProcessing ? "Memproses..." : "Bayar Sekarang"}
      </button>

      <p className="text-[10px] text-gray-400 text-center px-4 leading-relaxed">
        Dengan menekan tombol, Anda menyetujui syarat &amp; ketentuan grosur yang berlaku.
      </p>
    </div>
  );
}