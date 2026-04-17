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
} from "react-icons/fi";
import { api } from "@/lib/axiosInstance";
import { useAppStore } from "@/stores/useAppStore";

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const { user, isLoading: isAuthLoading } = useAppStore();
  const router = useRouter();

  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const resp = await api.get(`/admin/orders`); // Wait, I should probably have a single order endpoint for admin
      // Actually, my current admin orders endpoint only gets all.
      // I can reuse the user's detail endpoint if it doesn't strictly check ownership for admins,
      // or add a dedicated admin detail endpoint.
      
      // Let's assume for now we use the all orders fetch with a filter or add a specific one.
      // Better: let's add an admin detail endpoint in the backend.
      const res = await api.get(`/orders/${orderId}`); 
      // Note: If the backend /orders/:id checks userId, it might fail for admin.
      // I'll update the backend to allow admin to view any order.
      setOrder(res.data.data);
    } catch (err) {
      toast.error("Gagal memuat detail pesanan");
      router.push("/admin/orders");
    } finally {
      setIsLoading(false);
    }
  }, [orderId, router]);

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
        </div>
      )}
    </div>
  );
}
