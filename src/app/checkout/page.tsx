"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/stores/useAppStore";
import OrderSummary from "@/components/checkout/OrderSummary";
import ShippingSelector from "@/components/checkout/ShippingSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Truck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cart, currentStore, user, isLoading } = useAppStore();
  const router = useRouter();
  const [shippingCost, setShippingCost] = useState(0);
  const [selectedCourier] = useState("");

  useEffect(() => {
    // Wait until auth is resolved before deciding to redirect
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Show spinner while auth is resolving
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-[#00997a] border-t-transparent" />
      </div>
    );
  }

  if (!currentStore || cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-700">Keranjang Kosong</h2>
          <p className="text-gray-500">Silakan tambahkan produk ke keranjang terlebih dahulu.</p>
          <button
            onClick={() => router.push("/products")}
            className="px-6 py-2 bg-[#00997a] text-white rounded-lg hover:bg-[#00997a]/90 transition-all"
          >
            Belanja Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-1">Selesaikan pesanan Anda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Shipping & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ShippingSelector
                  onSelect={(cost) => {
                    setShippingCost(cost);
                  }}
                />
              </CardContent>
            </Card>

            {/* Cart Items Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Produk ({cart.length} item)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product?.name || "Product"}</h3>
                        <p className="text-sm text-gray-500">
                          {item.quantity} x Rp {item.product?.price?.toLocaleString("id-ID") || "0"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#00997a]">
                          Rp {((item.product?.price || 0) * item.quantity).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary 
              shippingCost={shippingCost} 
              selectedCourier={selectedCourier}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
