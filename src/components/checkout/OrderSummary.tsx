"use client";

import { api } from "@/lib/axiosInstance";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OrderSummary({ shippingCost, selectedCourier }: { shippingCost: number, selectedCourier: string }) {
    const { cart, currentStore, clearCart } = useAppStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();

    // 1. Calculate Subtotal
    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const total = subtotal + shippingCost;

    // 2. Handle Checkout Action
    const handleCheckout = async () => {
        if (!currentStore || cart.length === 0) return;

        setIsProcessing(true);
        try {
            const payload = {
                storeId: currentStore.id,
                shippingCost,
                courier: selectedCourier,
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.product.price
                }))
            };

            const res = await api.post("/orders/checkout", payload);

            // On success, clear the local cart and redirect to payment upload
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
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 space-y-4 sticky top-24">
            <h3 className="text-lg font-bold text-[#1a1a1a]">Ringkasan Belanja</h3>

            <div className="space-y-2 border-b pb-4 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500">Total Harga ({cart.length} barang)</span>
                    <span className="font-medium">Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Ongkos Kirim</span>
                    <span className="font-medium">Rp {shippingCost.toLocaleString("id-ID")}</span>
                </div>
            </div>

            <div className="flex justify-between items-center py-2">
                <span className="text-base font-bold text-[#1a1a1a]">Total Belanja</span>
                <span className="text-xl font-extrabold text-[#00997a]">
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
                Dengan menekan tombol, Anda menyetujui syarat & ketentuan yang berlaku.
            </p>
        </div>
    );
}