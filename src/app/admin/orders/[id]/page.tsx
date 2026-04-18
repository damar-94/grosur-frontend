"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
   FiPackage,
   FiMapPin,
   FiArrowLeft,
   FiTruck,
   FiCreditCard,
   FiClock,
   FiUser,
   FiCheckCircle,
   FiXCircle,
   FiImage,
} from "react-icons/fi";
import { api } from "@/lib/axiosInstance";
import { adminService } from "@/services/adminService";
import { useAppStore } from "@/stores/useAppStore";

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
   const resolvedParams = use(params);
   const orderId = resolvedParams.id;
   const { user, isLoading: isAuthLoading } = useAppStore();
   const router = useRouter();

   const [order, setOrder] = useState<any | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [isUpdating, setIsUpdating] = useState(false);

   const fetchOrder = useCallback(async () => {
      setIsLoading(true);
      try {
         const res = await adminService.getOrderDetail(orderId);
         setOrder(res.data);
      } catch (err) {
         toast.error("Gagal memuat detail pesanan");
         router.push("/admin/orders");
      } finally {
         setIsLoading(false);
      }
   }, [orderId, router]);

   const handleConfirmPayment = async (action: "accept" | "reject") => {
      const confirmMessage = action === "accept"
         ? "Apakah Anda yakin ingin MENERIMA pembayaran ini? Status pesanan akan berubah menjadi DIPROSES."
         : "Apakah Anda yakin ingin MENOLAK pembayaran ini? Status pesanan akan kembali ke MENUNGGU PEMBAYARAN.";

      if (!window.confirm(confirmMessage)) return;

      setIsUpdating(true);
      try {
         await adminService.confirmPayment(orderId, action);
         toast.success(action === "accept" ? "Pembayaran diterima" : "Pembayaran ditolak");
         fetchOrder();
      } catch (err: any) {
         toast.error(err.response?.data?.message || "Gagal memperbarui status pembayaran");
      } finally {
         setIsUpdating(false);
      }
   };

   useEffect(() => {
      if (isAuthLoading) return;
      if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "STORE_ADMIN")) {
         router.push("/");
         return;
      }
      fetchOrder();
   }, [user, isAuthLoading, fetchOrder, router]);

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

   if (!user && !isLoading) return null;

   return (
      <div className="p-6 max-w-[1000px] mx-auto min-h-screen">
         <div className="flex items-center gap-3 mb-8">
            <Link href="/admin/orders" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
               <FiArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Detail Pesanan User</h1>
         </div>

         {isLoading || !order ? (
            <div className="animate-pulse space-y-4">
               <div className="h-32 bg-white rounded-2xl border border-gray-100"></div>
               <div className="h-64 bg-white rounded-2xl border border-gray-100"></div>
            </div>
         ) : (
            <div className="space-y-6">
               {/* Top Info */}
               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                  <div>
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Pelanggan</p>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                           <FiUser size={20} />
                        </div>
                        <div>
                           <p className="font-bold text-gray-800">{order.user?.name || "User"}</p>
                           <p className="text-xs text-gray-400">{order.user?.email}</p>
                        </div>
                     </div>
                  </div>
                  <div className="md:text-right">
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Status</p>
                     <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                        {order.status}
                     </span>
                  </div>
               </div>

               {/* Products */}
               <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-50 bg-gray-50/30 font-bold text-sm text-gray-600 flex items-center gap-2">
                     <FiPackage /> Produk Pesanan
                  </div>
                  <div className="divide-y divide-gray-50">
                     {order.items?.map((item: any) => (
                        <div key={item.id} className="p-5 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300">
                                 <FiPackage />
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-gray-800">{item.product.name}</p>
                                 <p className="text-xs text-gray-400">{item.quantity} x Rp {Number(item.price).toLocaleString("id-ID")}</p>
                              </div>
                           </div>
                           <p className="font-bold text-[#00997a]">Rp {Number(item.subtotal).toLocaleString("id-ID")}</p>
                        </div>
                     ))}
                  </div>
                  <div className="p-5 bg-gray-50/30 flex justify-between items-center border-t border-gray-50">
                     <p className="text-sm font-medium text-gray-500">Total Pembayaran</p>
                     <p className="text-lg font-extrabold text-[#00997a]">Rp {Number(order.totalAmount).toLocaleString("id-ID")}</p>
                  </div>
               </div>

               {/* More Info */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                     <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                        <FiMapPin className="text-[#00997a]" /> Alamat Pengiriman
                     </h3>
                     <div className="text-xs text-gray-500 space-y-1">
                        <p className="font-bold text-gray-700">{order.address?.name}</p>
                        <p>{order.address?.phone}</p>
                        <p>{order.address?.detail}</p>
                        <p>{order.address?.district}, {order.address?.city}</p>
                        <p>{order.address?.province}</p>
                     </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                     <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                        <FiCreditCard className="text-[#00997a]" /> Rincian Transaksi
                     </h3>
                     <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex justify-between">
                           <span>No. Order</span>
                           <span className="font-bold text-gray-700">#{order.orderNumber}</span>
                        </div>
                        <div className="flex justify-between">
                           <span>Waktu Pesanan</span>
                           <span>{new Date(order.createdAt).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between">
                           <span>Metode Pembayaran</span>
                           <span>{order.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                           <span>Toko / Gudang</span>
                           <span className="font-bold text-[#00997a]">{order.store?.name}</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Payment Proof Section */}
               {(order.paymentProof || order.status === "WAITING_CONFIRMATION") && (
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                     <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                        <FiImage className="text-[#00997a]" /> Bukti Pembayaran
                     </h3>

                     {order.paymentProof ? (
                        <div className="space-y-4">
                           <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-inner group">
                              <img
                                 src={order.paymentProof}
                                 alt="Bukti Pembayaran"
                                 className="object-contain w-full h-full cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
                                 onClick={() => window.open(order.paymentProof, '_blank')}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none flex items-center justify-center">
                                 <span className="opacity-0 group-hover:opacity-100 bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold text-gray-600 shadow-sm transition-opacity">Klik untuk perbesar</span>
                              </div>
                           </div>

                           {order.status === "WAITING_CONFIRMATION" && (
                              <div className="pt-2 flex flex-wrap gap-3">
                                 <button
                                    onClick={() => handleConfirmPayment('accept')}
                                    disabled={isUpdating}
                                    className="px-6 py-2.5 bg-[#00997a] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider hover:bg-[#008066] hover:shadow-lg hover:shadow-[#00997a]/20 transition-all disabled:opacity-50 flex items-center gap-2"
                                 >
                                    {isUpdating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiCheckCircle size={16} />}
                                    Terima Pembayaran
                                 </button>
                                 <button
                                    onClick={() => handleConfirmPayment('reject')}
                                    disabled={isUpdating}
                                    className="px-6 py-2.5 bg-white border border-rose-100 text-rose-500 rounded-xl text-xs font-extrabold uppercase tracking-wider hover:bg-rose-50 hover:border-rose-200 transition-all disabled:opacity-50 flex items-center gap-2"
                                 >
                                    <FiXCircle size={16} />
                                    Tolak Pembayaran
                                 </button>
                              </div>
                           )}
                        </div>
                     ) : (
                        <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                           <FiImage size={32} className="text-gray-300 mb-2" />
                           <p className="text-sm text-gray-400 font-medium">Belum ada bukti pembayaran diunggah</p>
                        </div>
                     )}
                  </div>
               )}
            </div>
         )}
      </div>
   );
}
