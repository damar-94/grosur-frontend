"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  FiArrowLeft,
  FiMapPin,
  FiPlus,
  FiCheck,
  FiChevronDown,
  FiPackage,
  FiCreditCard,
  FiUpload,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import { api } from "@/lib/axiosInstance";
import { useAppStore } from "@/stores/useAppStore";
import {
  fetchAddresses,
  createOrder,
  type Address,
  type CheckoutItem,
} from "@/services/checkoutService";
import AddressForm from "@/components/address/AddressForm";

// ─── Types ────────────────────────────────────────────────────────────────────
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

type PaymentMethod = "MANUAL_TRANSFER" | "PAYMENT_GATEWAY";

// ─── Component ────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { user, setCartCount, currentStore, isManualStore } = useAppStore();
  const router = useRouter();

  // Data
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  // UI State
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAddressList, setShowAddressList] = useState(false);

  // Selections
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MANUAL_TRANSFER");
  const [notes, setNotes] = useState("");

  // ─── Data Fetching ──────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoadingCart(true);
    setIsLoadingAddresses(true);

    try {
      // Fetch Cart and Addresses in parallel but handle them individually
      const [cartRes, addrList] = await Promise.allSettled([
        api.get("/cart"),
        fetchAddresses(),
      ]);

      // Handle Cart result
      if (cartRes.status === "fulfilled") {
        const data = cartRes.value.data;
        if (data.success) {
          const items: CartItem[] = data.data.items || [];
          setCartItems(items);
          if (items.length === 0) {
            router.push("/cart");
          }
        }
      } else {
        console.error("Failed to fetch cart:", cartRes.reason);
        toast.error("Gagal memuat keranjang belanja");
      }

      // Handle Addresses result
      if (addrList.status === "fulfilled") {
        const list = addrList.value;
        setAddresses(list);
        const def = list.find((a) => a.isDefault) || list[0] || null;
        setSelectedAddress(def);
      } else {
        console.error("Failed to fetch addresses:", addrList.reason);
        toast.error("Gagal memuat daftar alamat");
      }
    } catch (err) {
      console.error("Unexpected error in loadData:", err);
    } finally {
      setIsLoadingCart(false);
      setIsLoadingAddresses(false);
    }
  }, [router]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadData();
  }, [user, router, loadData]);

  // ─── Calculations ───────────────────────────────────────────────────────────
  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.product.price) * item.quantity,
    0
  );
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleAddressAdded = async () => {
    setShowAddressForm(false);
    setIsLoadingAddresses(true);
    const updated = await fetchAddresses();
    setAddresses(updated);
    if (!selectedAddress) {
      setSelectedAddress(updated[0] || null);
    }
    setIsLoadingAddresses(false);
    toast.success("Alamat berhasil ditambahkan");
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Pilih alamat pengiriman terlebih dahulu");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Keranjang belanjamu kosong");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const order = await createOrder({
        addressId: selectedAddress.id,
        items: cartItems.map((item) => ({
          cartItemId: item.id,
          productId: item.product.id,
          quantity: item.quantity,
          price: Number(item.product.price),
        })),
        paymentMethod,
        notes: notes.trim() || undefined,
      });

      // Reset cart count
      setCartCount(0);
      toast.success("Pesanan berhasil dibuat!");
      router.push(`/checkout/${order.id}/payment`);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal membuat pesanan";
      toast.error(msg);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (isLoadingCart) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-12 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-[#00997a] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Mempersiapkan checkout...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/cart" className="text-gray-400 hover:text-[#00997a] transition-colors">
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Checkout</h1>
          <p className="text-sm text-gray-400 mt-0.5">Lengkapi informasi pemesananmu</p>
        </div>
      </div>

      {/* ── Steps Indicator ── */}
      <div className="flex items-center gap-2 mb-8">
        {["Alamat", "Pembayaran", "Konfirmasi"].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${i === 0
              ? "bg-[#00997a] text-white"
              : "bg-gray-100 text-gray-400"
              }`}>
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold
                border border-current">
                {i + 1}
              </span>
              {step}
            </div>
            {i < 2 && <div className="w-6 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ══════════════════ LEFT COLUMN ══════════════════ */}
        <div className="flex-1 space-y-5">

          {/* ── 1. Address Section ── */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#00997a]/10 flex items-center justify-center">
                  <FiMapPin size={15} className="text-[#00997a]" />
                </div>
                <h2 className="font-bold text-[#1a1a1a]">Alamat Pengiriman</h2>
              </div>
              <button
                onClick={() => setShowAddressList(!showAddressList)}
                className="text-xs text-[#00997a] font-semibold hover:underline flex items-center gap-1"
              >
                {addresses.length > 0 ? "Ganti Alamat" : "Tambah Alamat"}
                <FiChevronDown
                  size={12}
                  className={`transition-transform ${showAddressList ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            <div className="px-6 py-5">
              {isLoadingAddresses ? (
                <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ) : selectedAddress ? (
                <div className="space-y-1">
                  <p className="font-semibold text-[#1a1a1a]">
                    {selectedAddress.name}
                    {selectedAddress.isDefault && (
                      <span className="ml-2 text-[10px] bg-[#00997a]/10 text-[#00997a] px-2 py-0.5 rounded-full font-medium">
                        Utama
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">{selectedAddress.phone}</p>
                  <p className="text-sm text-gray-600 leading-relaxed mt-1">
                    {selectedAddress.detail}, {selectedAddress.district},{" "}
                    {selectedAddress.city}, {selectedAddress.province}
                    {selectedAddress.postalCode && ` ${selectedAddress.postalCode}`}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 gap-2">
                  <FiAlertCircle size={32} className="text-amber-400" />
                  <p className="text-sm text-gray-500">Belum ada alamat tersimpan</p>
                </div>
              )}
            </div>

            {/* Address List Dropdown */}
            {showAddressList && (
              <div className="border-t border-gray-50 px-4 pb-4 space-y-2 bg-gray-50/50">
                <div className="pt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddress(addr);
                        setShowAddressList(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${selectedAddress?.id === addr.id
                        ? "border-[#00997a] bg-[#00997a]/5"
                        : "border-gray-100 bg-white hover:border-gray-300"
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#1a1a1a]">
                            {addr.name}
                            {addr.isDefault && (
                              <span className="ml-2 text-[10px] bg-[#00997a]/10 text-[#00997a] px-1.5 py-0.5 rounded-full">
                                Utama
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {addr.detail}, {addr.district}, {addr.city}
                          </p>
                        </div>
                        {selectedAddress?.id === addr.id && (
                          <FiCheck size={16} className="text-[#00997a] shrink-0 mt-0.5" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setShowAddressList(false);
                    setShowAddressForm(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-[#00997a] font-medium hover:border-[#00997a] transition-colors"
                >
                  <FiPlus size={14} />
                  Tambah Alamat Baru
                </button>
              </div>
            )}

            {/* Add Address Form */}
            {showAddressForm && (
              <div className="border-t border-gray-100 p-4">
                <AddressForm onSuccess={handleAddressAdded} />
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Batal
                </button>
              </div>
            )}
          </section>

          {/* ── 2. Order Items ── */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50">
              <div className="w-8 h-8 rounded-full bg-[#00997a]/10 flex items-center justify-center">
                <FiPackage size={15} className="text-[#00997a]" />
              </div>
              <h2 className="font-bold text-[#1a1a1a]">Detail Pesanan</h2>
              <span className="ml-auto text-xs text-gray-400">{totalItems} barang</span>
            </div>

            <div className="divide-y divide-gray-50">
              {cartItems.map((item) => {
                const imageUrl = item.product.images?.[0]?.url;
                return (
                  <div key={item.id} className="flex gap-3 px-6 py-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1a1a1a] line-clamp-2">{item.product.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.store.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{item.quantity}x</span>
                        <span className="text-sm font-bold text-[#00997a]">
                          Rp {(Number(item.product.price) * item.quantity).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── 3. Payment Method ── */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50">
              <div className="w-8 h-8 rounded-full bg-[#00997a]/10 flex items-center justify-center">
                <FiCreditCard size={15} className="text-[#00997a]" />
              </div>
              <h2 className="font-bold text-[#1a1a1a]">Metode Pembayaran</h2>
            </div>

            <div className="p-6 space-y-3">
              {/* Manual Transfer */}
              <label
                htmlFor="pay-manual"
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "MANUAL_TRANSFER"
                  ? "border-[#00997a] bg-[#00997a]/5"
                  : "border-gray-100 hover:border-gray-300"
                  }`}
              >
                <input
                  id="pay-manual"
                  type="radio"
                  name="paymentMethod"
                  value="MANUAL_TRANSFER"
                  checked={paymentMethod === "MANUAL_TRANSFER"}
                  onChange={() => setPaymentMethod("MANUAL_TRANSFER")}
                  className="mt-0.5 w-4 h-4 accent-[#00997a]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <FiUpload size={15} className="text-[#00997a]" />
                    <p className="font-semibold text-sm text-[#1a1a1a]">Transfer Bank Manual</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Lakukan transfer ke rekening tujuan, lalu upload bukti pembayaran.
                    Pesanan diproses setelah verifikasi admin.
                  </p>
                </div>
              </label>

              {/* Payment Gateway */}
              <label
                htmlFor="pay-gateway"
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "PAYMENT_GATEWAY"
                  ? "border-[#00997a] bg-[#00997a]/5"
                  : "border-gray-100 hover:border-gray-300"
                  }`}
              >
                <input
                  id="pay-gateway"
                  type="radio"
                  name="paymentMethod"
                  value="PAYMENT_GATEWAY"
                  checked={paymentMethod === "PAYMENT_GATEWAY"}
                  onChange={() => setPaymentMethod("PAYMENT_GATEWAY")}
                  className="mt-0.5 w-4 h-4 accent-[#00997a]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <FiCreditCard size={15} className="text-[#00997a]" />
                    <p className="font-semibold text-sm text-[#1a1a1a]">Payment Gateway</p>
                    <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
                      Otomatis
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Bayar via Midtrans (Kartu Kredit, GoPay, OVO, QRIS, dll.).
                    Pesanan diproses otomatis setelah pembayaran berhasil.
                  </p>
                </div>
              </label>
            </div>
          </section>

          {/* ── 4. Notes ── */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-[#1a1a1a] mb-3 text-sm">Catatan untuk Seller (opsional)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Contoh: Tolong bungkus rapi, barang hadiah..."
              className="w-full p-3 text-sm border border-gray-200 rounded-xl resize-none outline-none focus:ring-2 focus:ring-[#00997a]/30 focus:border-[#00997a] transition-all placeholder:text-gray-300"
            />
          </section>
        </div>

        {/* ══════════════════ RIGHT COLUMN — Order Summary ══════════════════ */}
        <div className="lg:w-80 w-full">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24 space-y-4">
            <h2 className="font-bold text-[#1a1a1a] text-lg">Ringkasan Pesanan</h2>

            {/* Items */}
            <div className="space-y-2 pb-3 border-b border-gray-100 text-sm">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-gray-600">
                  <span className="line-clamp-1 flex-1 mr-2">
                    {item.product.name} <span className="text-gray-400">×{item.quantity}</span>
                  </span>
                  <span className="font-medium shrink-0">
                    Rp {(Number(item.product.price) * item.quantity).toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>

            {/* Subtotals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal Produk</span>
                <span className="font-medium">Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Biaya Pengiriman</span>
                <span className="font-medium text-gray-400 italic text-xs">Dihitung Admin</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Dikirim Dari</span>
                <span className="font-bold text-[#00997a] text-xs">
                  {currentStore?.name || (selectedAddress ? "Toko Terdekat" : "Pilih alamat")}
                </span>
              </div>
              {isManualStore && (
                <p className="text-[10px] text-amber-600 italic -mt-1">
                  * Menggunakan toko pilihan Anda di Beranda
                </p>
              )}
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#1a1a1a]">Total Produk</span>
                <span className="text-xl font-extrabold text-[#00997a]">
                  Rp {subtotal.toLocaleString("id-ID")}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">+ ongkos kirim dihitung saat pemrosesan</p>
            </div>

            {/* Info Box */}
            {paymentMethod === "MANUAL_TRANSFER" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                <FiAlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Pesanan belum dapat diproses sebelum kamu upload bukti transfer.
                </p>
              </div>
            )}

            {paymentMethod === "PAYMENT_GATEWAY" && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex gap-2">
                <FiCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Pesanan akan diproses otomatis setelah pembayaran berhasil.
                </p>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || !selectedAddress || cartItems.length === 0}
              className="w-full py-3.5 bg-[#00997a] hover:bg-[#007a61] active:scale-95 text-white font-bold rounded-xl transition-all duration-150 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {isPlacingOrder ? (
                <>
                  <FiLoader size={16} className="animate-spin" />
                  Memproses Pesanan...
                </>
              ) : (
                <>
                  <FiCheck size={16} />
                  Buat Pesanan
                </>
              )}
            </button>

            <Link
              href="/cart"
              className="block text-center text-sm text-gray-400 hover:text-[#00997a] transition-colors"
            >
              ← Kembali ke Keranjang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
