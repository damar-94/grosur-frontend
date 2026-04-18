"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  FiPackage,
  FiClock,
  FiMapPin,
  FiChevronRight,
  FiFilter,
  FiSearch,
  FiAlertCircle,
  FiLoader,
  FiArrowLeft,
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
} from "@/components/ui/alert-dialog";
import { fetchOrders, cancelExpiredOrders, autoConfirmShippedOrders, confirmOrderReceipt, type Order } from "@/services/checkoutService";
import { useAppStore } from "@/stores/useAppStore";

type OrderStatus = "ALL" | "WAITING_PAYMENT" | "WAITING_CONFIRMATION" | "PROCESSED" | "SENT" | "CONFIRMED" | "CANCELLED";

export default function OrdersPage() {
  const { user, isLoading: isAuthLoading } = useAppStore();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);

  const [completeOrderDialog, setCompleteOrderDialog] = useState<{
    isOpen: boolean;
    orderId: string | null;
  }>({
    isOpen: false,
    orderId: null,
  });

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setDateFilter(dateInput);
    setPage(1);
  };

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        cancelExpiredOrders().catch(() => {}),
        autoConfirmShippedOrders().catch(() => {})
      ]);
      const filter = statusFilter === "ALL" ? undefined : statusFilter;
      const data = await fetchOrders({ 
        page, 
        limit: 5,
        status: filter,
        search: searchQuery || undefined,
        date: dateFilter || undefined
      });
      setOrders(data.orders);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error("Gagal memuat daftar pesanan");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, searchQuery, dateFilter]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    loadOrders();
  }, [user, isAuthLoading, router, loadOrders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING_PAYMENT":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "WAITING_CONFIRMATION":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "PROCESSED":
        return "bg-cyan-100 text-cyan-700 border-cyan-200";
      case "SENT":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "CONFIRMED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
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

  const statusOptions: { label: string; value: OrderStatus }[] = [
    { label: "Semua", value: "ALL" },
    { label: "Menunggu Bayar", value: "WAITING_PAYMENT" },
    { label: "Konfirmasi", value: "WAITING_CONFIRMATION" },
    { label: "Diproses", value: "PROCESSED" },
    { label: "Dikirim", value: "SENT" },
    { label: "Selesai", value: "CONFIRMED" },
    { label: "Dibatalkan", value: "CANCELLED" },
  ];

  if (!user && !isLoading) return null;

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-[#00997a] transition-colors">
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Pesanan Saya</h1>
            <p className="text-sm text-gray-500 mt-0.5">Pantau status belanjaanmu di sini</p>
          </div>
        </div>

        {/* Filter Tabs (Mobile Scrollable) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setStatusFilter(opt.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                statusFilter === opt.value
                  ? "bg-[#00997a] text-white border-[#00997a] shadow-sm shadow-[#00997a]/20"
                  : "bg-white text-gray-500 border-gray-100 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Search & Date Filter ── */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari No. Order..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00997a]/20 focus:border-[#00997a] transition-all"
          />
        </div>
        <div className="sm:w-48">
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00997a]/20 focus:border-[#00997a] transition-all text-gray-600"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 sm:flex-none px-6 py-2.5 bg-[#00997a] text-white font-bold rounded-xl hover:bg-[#007a61] transition-all shadow-sm shadow-[#00997a]/20"
          >
            Cari
          </button>
          {(searchQuery || dateFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
                setDateInput("");
                setDateFilter("");
                setPage(1);
              }}
              className="px-6 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all whitespace-nowrap"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {isLoading ? (
        /* Loading State */
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="h-4 bg-gray-100 rounded w-1/4" />
                <div className="h-6 bg-gray-100 rounded-full w-20" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm py-20 px-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6">
            <FiPackage size={40} className="text-gray-200" />
          </div>
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">Belum ada pesanan</h2>
          <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-8">
            {(searchQuery || dateFilter) 
              ? "Tidak ada pesanan yang sesuai dengan filter pencarianmu." 
              : `Kamu belum memiliki riwayat pesanan ${statusFilter !== "ALL" ? `dengan status ${statusFilter.toLowerCase()}` : ""}.`}
          </p>
          <Link
            href="/"
            className="px-8 py-3 bg-[#00997a] text-white font-bold rounded-xl hover:bg-[#007a61] transition-all shadow-sm"
          >
            Mulai Belanja Sekarang
          </Link>
        </div>
      ) : (
        /* Order List */
        <div className="space-y-4">
          {orders.map((order) => {
            const orderNumber = order.orderNumber || order.id.slice(0, 8).toUpperCase();
            const date = new Date(order.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#00997a]/30 transition-all overflow-hidden group"
              >
                <Link href={order.status === "WAITING_PAYMENT" && order.paymentStatus === "PENDING" ? `/checkout/${order.id}/payment` : `/orders/${order.id}`}>
                  <div className="p-5 md:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#00997a]">
                          <FiPackage size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1a1a1a]">#{orderNumber}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <FiClock size={12} className="text-gray-400" />
                            <p className="text-[11px] text-gray-400">{date}</p>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full border ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Products Summary */}
                      <div className="md:col-span-2 flex items-center gap-4">
                         <div className="flex-1">
                            <p className="font-bold text-[#1a1a1a] text-sm mb-1 leading-tight line-clamp-1">
                               {order.items && order.items.length > 0 ? (
                                  <>
                                     {order.items[0].product.name}
                                     {order.items.length > 1 && (
                                        <span className="text-gray-500 font-normal ml-1">
                                           + {order.items.length - 1} produk lainnya
                                        </span>
                                     )}
                                  </>
                               ) : (
                                  "Pesanan"
                               )}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-1">
                              Pembayaran via <span className="font-semibold text-gray-500">{order.paymentMethod.replace("_", " ")}</span>
                            </p>
                         </div>
                      </div>

                      {/* Price & Action */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-gray-50 pt-4 md:pt-0 md:pl-6">
                        <div className="text-left md:text-right">
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">Total Belanja</p>
                          <p className="text-base font-extrabold text-[#00997a]">
                            Rp {Number(order.totalAmount).toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-[#00997a] font-bold text-xs mt-1 group-hover:translate-x-1 transition-transform">
                          Detail <FiChevronRight />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
                
                {/* Action Buttons for SENT status */}
                {order.status === "SENT" && (
                   <div className="bg-indigo-50 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-indigo-100">
                      <div className="flex items-center gap-2 text-indigo-700">
                         <FiAlertCircle size={14} />
                         <span className="text-xs font-medium">Pesananmu sudah dalam perjalanan. Sudah sampai?</span>
                      </div>
                      <button
                         onClick={(e) => {
                            e.preventDefault();
                            setCompleteOrderDialog({
                               isOpen: true,
                               orderId: order.id,
                            });
                         }}
                         disabled={isUpdating}
                         className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                      >
                         Selesaikan Pesanan
                      </button>
                   </div>
                )}

                {/* Footer Action for Pending/Rejected manual payments */}
                {order.status === "WAITING_PAYMENT" && order.paymentStatus !== "PAID" && order.paymentMethod === "MANUAL_TRANSFER" && (
                  <div className="bg-amber-50 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-700">
                      <FiAlertCircle size={14} />
                      <span className="text-xs font-medium">Selesaikan pembayaran & upload bukti transfer</span>
                    </div>
                    <Link
                      href={`/checkout/${order.id}/payment`}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-lg transition-colors"
                    >
                      Bayar Sekarang
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
           {Array.from({ length: totalPages }).map((_, i) => (
             <button
               key={i}
               onClick={() => setPage(i + 1)}
               className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                 page === i + 1
                   ? "bg-[#00997a] text-white shadow-lg shadow-[#00997a]/20"
                   : "bg-white text-gray-400 border border-gray-100 hover:border-gray-200"
               }`}
             >
               {i + 1}
             </button>
           ))}
        </div>
      )}

      <AlertDialog 
         open={completeOrderDialog.isOpen} 
         onOpenChange={(open) => setCompleteOrderDialog(prev => ({ ...prev, isOpen: open }))}
      >
         <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
            <AlertDialogHeader>
               <AlertDialogTitle className="text-xl font-extrabold text-gray-800">
                  Konfirmasi Penerimaan
               </AlertDialogTitle>
               <AlertDialogDescription className="text-sm text-gray-500 font-medium leading-relaxed">
                  Apakah Anda yakin pesanan sudah sampai dan ingin menyelesaikannya? Tindakan ini tidak dapat dibatalkan.
               </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4 gap-2">
               <AlertDialogCancel className="rounded-xl border-gray-100 font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all">
                  Belum Sampai
               </AlertDialogCancel>
               <AlertDialogAction
                  onClick={async () => {
                     if (!completeOrderDialog.orderId) return;
                     setIsUpdating(true);
                     try {
                        await confirmOrderReceipt(completeOrderDialog.orderId);
                        toast.success("Pesanan selesai! Terima kasih sudah berbelanja.");
                        loadOrders();
                     } catch (err: any) {
                        toast.error(err.response?.data?.message || "Gagal konfirmasi pesanan");
                     } finally {
                        setIsUpdating(false);
                     }
                  }}
                  className="rounded-xl bg-[#00997a] hover:bg-[#008066] font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-[#00997a]/20"
               >
                  Ya, Selesaikan
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
