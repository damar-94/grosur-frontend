"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/axiosInstance";
import { useAppStore } from "@/stores/useAppStore";
import { useRouter } from "next/navigation";
import { FiMinus, FiPlus, FiTrash2, FiShoppingCart, FiArrowLeft, FiLoader, FiAlertCircle } from "react-icons/fi";
import { toast } from "sonner";
import Link from "next/link";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: string;
    images: { url: string }[];
  };
  store: { id: string; name: string };
  stock: { quantity: number };
}

export default function CartPage() {
  const { user, setCartCount, isLoading: isAuthLoading } = useAppStore();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      const res = await api.get("/cart");
      if (res.data.success) {
        setCartItems(res.data.data.items);
      }
    } catch (error) {
      console.error("Failed to fetch cart", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetchCart();
  }, [user, isAuthLoading, router, fetchCart]);

  const handleUpdateQuantity = async (cartId: string, newQty: number) => {
    if (newQty < 1) return;
    setUpdatingId(cartId);
    try {
      await api.patch(`/cart/${cartId}`, { quantity: newQty });
      setCartItems((prev) =>
        prev.map((item) => item.id === cartId ? { ...item, quantity: newQty } : item)
      );
      const total = cartItems.reduce((acc, item) =>
        acc + (item.id === cartId ? newQty : item.quantity), 0);
      setCartCount(total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memperbarui jumlah");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (cartId: string) => {
    setUpdatingId(cartId);
    try {
      await api.delete(`/cart/${cartId}`);
      const removedItem = cartItems.find((i) => i.id === cartId);
      setCartItems((prev) => prev.filter((item) => item.id !== cartId));
      setCartCount(
        cartItems.reduce((acc, item) => acc + (item.id === cartId ? 0 : item.quantity), 0)
      );
      toast.success(`${removedItem?.product.name} dihapus dari keranjang`);
    } catch (error: any) {
      toast.error("Gagal menghapus produk");
    } finally {
      setUpdatingId(null);
    }
  };

  // Pre-validate stock before going to checkout
  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsCheckingOut(true);
    setStockError(null);
    try {
      // Check stock availability for all items
      const res = await api.post("/cart/validate-stock", {
        items: cartItems.map((item) => ({
          cartItemId: item.id,
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      if (res.data.success) {
        router.push("/checkout");
      } else {
        // Some items have insufficient stock
        const outOfStock: string[] = res.data.data?.outOfStock || [];
        if (outOfStock.length > 0) {
          setStockError(
            `Stok tidak mencukupi untuk: ${outOfStock.join(", ")}. Silakan kurangi jumlah atau hapus item tersebut.`
          );
        } else {
          router.push("/checkout"); // Proceed if error message is ambiguous
        }
      }
    } catch (err: any) {
      // If the endpoint doesn't exist (404), or we get another error
      // we proceed to checkout as a fallback based on requirements
      console.warn("Stock validation unavailable or failed, proceeding to checkout.");
      router.push("/checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.product.price) * item.quantity, 0
  );
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (!user && !isLoading) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-gray-500 hover:text-[#00997a] transition-colors">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">
          Keranjang Belanja
          {!isLoading && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({totalItems} barang)
            </span>
          )}
        </h1>
      </div>

      {isLoading ? (
        /* Loading Skeleton */
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 bg-white p-4 rounded-xl border border-gray-100 animate-pulse">
              <div className="w-28 h-28 bg-gray-200 rounded-lg shrink-0" />
              <div className="flex-1 space-y-3 py-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : cartItems.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-24 h-24 mb-6 rounded-full bg-[#00997a]/10 flex items-center justify-center">
            <FiShoppingCart size={40} className="text-[#00997a]" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Keranjang Masih Kosong</h2>
          <p className="text-gray-500 mb-6 text-center max-w-xs">
            Yuk mulai belanja! Temukan kebutuhan harianmu di Grosur.
          </p>
          <Link
            href="/"
            className="px-6 py-2.5 bg-[#00997a] text-white font-bold rounded-lg hover:bg-[#007a61] transition-colors"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items List */}
          <div className="flex-1 space-y-3">
            {cartItems.map((item) => {
              const isUpdating = updatingId === item.id;
              const imageUrl = item.product.images?.[0]?.url;
              const atMaxStock = item.quantity >= item.stock.quantity;

              return (
                <div
                  key={item.id}
                  className={`flex gap-4 bg-white p-4 rounded-xl border shadow-sm transition-opacity ${isUpdating ? "opacity-60 pointer-events-none" : "border-gray-100"}`}
                >
                  {/* Product Image */}
                  <div className="w-28 h-28 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-semibold text-[#1a1a1a] line-clamp-2 leading-snug">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">Toko: {item.store.name}</p>
                      <p className="text-[#00997a] font-bold mt-1.5 text-base">
                        Rp {Number(item.product.price).toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={atMaxStock}
                          title={atMaxStock ? "Stok habis" : "Tambah"}
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>

                      {/* Subtotal & Delete */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700">
                          Rp {(Number(item.product.price) * item.quantity).toLocaleString("id-ID")}
                        </span>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1"
                          title="Hapus dari keranjang"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 w-full h-fit bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-20">
            <h2 className="font-bold text-lg mb-4 text-[#1a1a1a]">Ringkasan Belanja</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Total Harga ({totalItems} barang)</span>
                <span className="font-medium text-gray-800">Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Biaya Pengiriman</span>
                <span className="font-medium text-gray-800">Dihitung saat checkout</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between font-bold text-base mb-5">
                <span>Total Belanja</span>
                <span className="text-[#00997a]">Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>

              {/* Stock Error Alert */}
              {stockError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2">
                  <FiAlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 leading-relaxed">{stockError}</p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || cartItems.length === 0}
                className="w-full py-3 bg-[#00997a] hover:bg-[#007a61] active:scale-95 text-white font-bold rounded-xl transition-all duration-150 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {isCheckingOut ? (
                  <>
                    <FiLoader size={16} className="animate-spin" />
                    Memeriksa Stok...
                  </>
                ) : (
                  "Lanjut ke Checkout"
                )}
              </button>

              <Link
                href="/"
                className="block text-center mt-3 text-sm text-[#00997a] hover:underline font-medium"
              >
                Lanjut Belanja
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
