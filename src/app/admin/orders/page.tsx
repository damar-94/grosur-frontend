"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  FiFilter,
  FiSearch,
  FiEye,
  FiTruck,
  FiPackage,
  FiAlertCircle,
  FiCalendar,
  FiMapPin,
  FiArrowLeft,
  FiUser,
  FiShoppingBag,
  FiMoreVertical,
} from "react-icons/fi";
import { adminService } from "@/services/adminService";
import { useAppStore } from "@/stores/useAppStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminOrderPage() {
  const { user, isLoading: isAuthLoading } = useAppStore();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPage: 1, totalRows: 0 });

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);

  const fetchStores = useCallback(async () => {
    if (user?.role !== "SUPER_ADMIN") return;
    try {
      const resp = await adminService.getStores();
      setStores(resp.data || []);
    } catch (err) {
      console.error("Failed to fetch stores", err);
    }
  }, [user]);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const resp = await adminService.getAdminOrders({
        page,
        status: statusFilter || undefined,
        storeId: storeFilter || undefined,
        search: search || undefined,
        date: dateFilter || undefined,
      });
      setOrders(resp.data || []);
      setPagination(resp.pagination);
    } catch (err) {
      toast.error("Gagal memuat data pesanan");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, storeFilter, search, dateFilter]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "STORE_ADMIN")) {
      router.push("/");
      return;
    }
    fetchStores();
    fetchOrders();
  }, [user, isAuthLoading, fetchStores, fetchOrders, router]);

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

  const clearFilters = () => {
    setStatusFilter("");
    setStoreFilter("");
    setSearch("");
    setDateFilter("");
    setPage(1);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto min-h-screen bg-gray-50/50">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#1a1a1a] flex items-center gap-3">
          <FiShoppingBag className="text-[#00997a]" />
          Order Management
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {user?.role === "SUPER_ADMIN" 
            ? "Kelola semua pesanan dari seluruh gudang" 
            : `Kelola pesanan untuk gudang ${user?.managedStore?.name || "Anda"}`}
        </p>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari No. Order, Nama, atau Email User..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00997a]/20 focus:border-[#00997a] transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00997a]/20 focus:border-[#00997a] transition-all"
          >
            <option value="">Semua Status</option>
            <option value="WAITING_PAYMENT">Menunggu Bayar</option>
            <option value="WAITING_CONFIRMATION">Konfirmasi Pembayaran</option>
            <option value="PROCESSED">Diproses</option>
            <option value="SENT">Dikirim</option>
            <option value="CONFIRMED">Selesai</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>

          {/* Store Filter (Super Admin Only) */}
          {user?.role === "SUPER_ADMIN" ? (
            <select
              value={storeFilter}
              onChange={(e) => { setStoreFilter(e.target.value); setPage(1); }}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00997a]/20 focus:border-[#00997a] transition-all"
            >
              <option value="">Semua Gudang</option>
              {stores.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          ) : (
             <div className="px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-500 flex items-center gap-2">
                <FiMapPin size={14} />
                {user?.managedStore?.name || "Gudang Saya"}
             </div>
          )}

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00997a]/20 focus:border-[#00997a] transition-all text-gray-600"
          />
        </div>
        
        {(statusFilter || storeFilter || search || dateFilter) && (
          <button
            onClick={clearFilters}
            className="mt-4 text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
          >
            Reset Semua Filter
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">No. Order</th>
                <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Pelanggan</th>
                <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Gudang</th>
                <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                /* Loading State */
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-100 rounded w-8 mx-auto"></div></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <FiAlertCircle className="mx-auto text-gray-200 mb-4" size={48} />
                    <p className="text-gray-400 font-medium">Tidak ada pesanan yang ditemukan</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-[#1a1a1a]">#{order.orderNumber || order.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-[#1a1a1a]">{order.user.name}</p>
                        <p className="text-[11px] text-gray-400">{order.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {order.store.name}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-extrabold text-[#00997a]">Rp {Number(order.totalAmount).toLocaleString("id-ID")}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                         <Link 
                           href={`/admin/orders/${order.id}`}
                           className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400 hover:text-[#00997a] hover:border-[#00997a]/30 transition-all shadow-sm"
                           title="Lihat Detail"
                         >
                           <FiEye size={16} />
                         </Link>
                         {/* More options could go here */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!isLoading && pagination.totalPage > 1 && (
          <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium">
               Menampilkan {(page - 1) * 10 + 1} - {Math.min(page * 10, pagination.totalRows)} dari {pagination.totalRows} pesanan
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 border border-gray-100 rounded-lg text-xs font-bold text-gray-500 hover:bg-white disabled:opacity-50 disabled:bg-gray-100 transition-all"
              >
                Previous
              </button>
              <button
                disabled={page === pagination.totalPage}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 border border-gray-100 rounded-lg text-xs font-bold text-gray-500 hover:bg-white disabled:opacity-50 disabled:bg-gray-100 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
