"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  FiPackage,
  FiMapPin,
  FiArrowLeft,
  FiTruck,
  FiCreditCard,
  FiClock,
  FiAlertTriangle,
} from "react-icons/fi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fetchOrder, cancelExpiredOrders, autoConfirmShippedOrders, confirmOrderReceipt, cancelOrder as cancelOrderService, type Order } from "@/services/checkoutService";
import { useAppStore } from "@/stores/useAppStore";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const { user, isLoading: isAuthLoading } = useAppStore();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        cancelExpiredOrders().catch(() => {}),
        autoConfirmShippedOrders().catch(() => {})
      ]);
      const data = await fetchOrder(orderId);
      setOrder(data);
    } catch (err) {
      toast.error("Gagal memuat detail pesanan");
      router.push("/orders");
    } finally {
      setIsLoading(false);
    }
  }, [orderId, router]);

  const handleCancelOrder = async () => {
    setIsLoading(true);
    try {
      await cancelOrderService(orderId);
      toast.success("Pesanan berhasil dibatalkan");
      loadOrder(); // Reload the specific order to show its new status
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal membatalkan pesanan";
      toast.error(msg);
      setIsLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!confirm("Konfirmasi penerimaan pesanan?")) return;
    setIsLoading(true);
    try {
      await confirmOrderReceipt(orderId);
      toast.success("Pesanan selesai! Terima kasih sudah berbelanja.");
      loadOrder();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal konfirmasi pesanan";
      toast.error(msg);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    loadOrder();
  }, [user, isAuthLoading, router, loadOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING_PAYMENT": return "bg-amber-100 text-amber-700 border-amber-200";
      case "WAITING_CONFIRMATION": return "bg-blue-100 text-blue-700 border-blue-200";
      case "PROCESSED": return "bg-cyan-100 text-cyan-700 border-cyan-200";
      case "SENT": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "CONFIRMED": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "CANCELLED": return "bg-rose-100 text-rose-700 border-rose-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "WAITING_PAYMENT": return "Menunggu Bayar";
      case "WAITING_CONFIRMATION": return "Menunggu Konfirmasi";
      case "PROCESSED": return "Diproses";
      case "SENT": return "Dikirim";
      case "CONFIRMED": return "Selesai";
      case "CANCELLED": return "Dibatalkan";
      default: return status;
    }
  };

  if (!user && !isLoading) return null;

  return (
    <div className="max-w-[800px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/orders" className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#00997a] hover:border-[#00997a]/30 transition-colors shadow-sm">
          <FiArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Detail Pesanan</h1>
        </div>
      </div>

      {isLoading || !order ? (
        <div className="space-y-4">
          <div className="h-32 bg-white rounded-2xl animate-pulse"></div>
          <div className="h-64 bg-white rounded-2xl animate-pulse"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Status Pesanan</p>
              <h2 className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </h2>
            </div>
            <div className="md:text-right">
              <p className="text-sm text-gray-500 mb-1">Tanggal Pembelian</p>
              <p className="text-[#1a1a1a] font-medium flex items-center md:justify-end gap-2">
                <FiClock className="text-gray-400" />
                {new Date(order.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Items */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                  <FiPackage className="text-[#00997a]" size={20} />
                  <h3 className="font-bold text-[#1a1a1a]">Daftar Produk</h3>
                </div>
                
                <div className="space-y-6">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden relative border border-gray-100 shrink-0">
                        {item.product.images?.[0]?.url ? (
                          <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <FiPackage size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#1a1a1a] line-clamp-2 leading-tight mb-1">{item.product.name}</h4>
                        <p className="text-xs text-gray-500 mb-2">{item.quantity} x Rp {Number(item.price).toLocaleString("id-ID")}</p>
                        <p className="font-bold text-[#00997a]">Rp {Number(item.subtotal).toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4 border-b border-gray-50 pb-4">
                  <FiMapPin className="text-[#00997a]" size={20} />
                  <h3 className="font-bold text-[#1a1a1a]">Info Pengiriman</h3>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Kurir</p>
                    <p className="font-medium text-[#1a1a1a] flex items-center gap-2">
                       <FiTruck className="text-gray-400" />
                       Pengiriman Standar
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Alamat Pengiriman</p>
                    <div className="text-[#1a1a1a] bg-gray-50 p-4 rounded-xl">
                      <p className="font-bold mb-1">{order.address?.name}</p>
                      <p className="text-gray-600 mb-2">{order.address?.phone}</p>
                      <p className="text-gray-600 leading-relaxed">
                        {order.address?.detail}, {order.address?.district}, {order.address?.city}, {order.address?.province}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Payment Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-6">
                <div className="flex items-center gap-3 mb-4 border-b border-gray-50 pb-4">
                  <FiCreditCard className="text-[#00997a]" size={20} />
                  <h3 className="font-bold text-[#1a1a1a]">Rincian Pembayaran</h3>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Metode</span>
                    <span className="font-medium text-[#1a1a1a]">
                      {order.paymentMethod === "MANUAL_TRANSFER" ? "Transfer Manual" : "Payment Gateway"}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>No. Order</span>
                    <span className="font-medium text-[#1a1a1a] truncate max-w-[120px]">{order.orderNumber || order.id.slice(0,8).toUpperCase()}</span>
                  </div>
                  <hr className="border-gray-50 my-2" />
                  
                  <div className="flex justify-between text-gray-600">
                     <span>Total Harga ({order.items?.reduce((a,b) => a + b.quantity, 0)} barang)</span>
                     <span>Rp {(Number(order.totalAmount) - Number(order.shippingCost)).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                     <span>Ongkos Kirim</span>
                     <span>Rp {Number(order.shippingCost).toLocaleString("id-ID")}</span>
                  </div>
                  
                  <hr className="border-gray-100 border-dashed my-3" />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#1a1a1a]">Total Belanja</span>
                    <span className="text-lg font-extrabold text-[#00997a]">
                      Rp {Number(order.totalAmount).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {order.status === "WAITING_PAYMENT" && order.paymentStatus === "PENDING" && order.paymentMethod === "MANUAL_TRANSFER" && (
                    <div className="mt-6 flex flex-col gap-3">
                      <Link
                        href={`/checkout/${order.id}/payment`}
                        className="w-full py-3 bg-[#00997a] hover:bg-[#007a61] text-white text-sm font-bold rounded-xl transition-colors block text-center shadow-sm shadow-[#00997a]/20"
                      >
                        Bayar Sekarang
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl transition-colors block text-center border border-red-100">
                            Batalkan Pesanan
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl max-w-md">
                          <AlertDialogHeader className="sm:text-center flex flex-col items-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-3">
                              <FiAlertTriangle className="h-8 w-8 text-red-500" aria-hidden="true" />
                            </div>
                            <AlertDialogTitle className="text-xl font-bold text-[#1a1a1a]">Batalkan Pesanan</AlertDialogTitle>
                            <AlertDialogDescription className="text-center text-sm text-gray-500 mt-2">
                              Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat diurungkan dan pesanan akan hangus.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="w-full mt-6 grid grid-cols-2 gap-3 sm:flex-none">
                            <AlertDialogCancel className="w-full h-12 rounded-xl border-gray-200 text-gray-600 font-bold m-0 sm:m-0">Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleCancelOrder}
                              className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold m-0 sm:m-0"
                            >
                              Ya, Batalkan
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                )}

                {order.status === "SENT" && (
                    <div className="mt-6 flex flex-col gap-3">
                      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-2">
                        <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                          Pesananmu sudah dikirim. Silakan klik tombol di bawah jika barang sudah diterima.
                        </p>
                      </div>
                      <button
                        onClick={handleConfirmOrder}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all block text-center shadow-sm shadow-indigo-200"
                      >
                        Konfirmasi Pesanan Selesai
                      </button>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
