"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  FiCheckCircle,
  FiPackage,
  FiMapPin,
  FiClock,
  FiArrowRight,
  FiHome,
  FiLoader,
} from "react-icons/fi";
import { fetchOrder, type Order } from "@/services/checkoutService";
import { useAppStore } from "@/stores/useAppStore";

export default function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAppStore();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchOrder(orderId)
      .then(setOrder)
      .catch(() => {
        toast.error("Pesanan tidak ditemukan");
        router.push("/");
      })
      .finally(() => setIsLoading(false));
  }, [orderId, user, router]);

  if (isLoading) {
    return (
      <div className="max-w-[560px] mx-auto px-4 py-20 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#00997a] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Memuat informasi pesanan...</p>
      </div>
    );
  }

  if (!order) return null;

  const isPaidAutomatically = order.paymentStatus === "PAID";
  const orderNumber = order.orderNumber || order.id.slice(0, 8).toUpperCase();

  return (
    <div className="max-w-[560px] mx-auto px-4 py-12">
      {/* ── Success Animation ── */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative mb-5">
          <div className="w-24 h-24 rounded-full bg-[#00997a]/10 flex items-center justify-center">
            <FiCheckCircle size={48} className="text-[#00997a]" />
          </div>
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full border-4 border-[#00997a]/30 animate-ping" />
        </div>

        <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-2">
          Pesanan Berhasil Dibuat! 🎉
        </h1>
        <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
          {isPaidAutomatically
            ? "Pembayaranmu telah dikonfirmasi. Pesanan sedang diproses."
            : "Pesananmu sudah masuk. Selesaikan pembayaran untuk memproses pesanan."}
        </p>

        <div className="mt-4 px-4 py-2 bg-gray-100 rounded-full flex items-center gap-2">
          <span className="text-xs text-gray-500">No. Pesanan</span>
          <span className="text-sm font-bold text-[#1a1a1a] tracking-wider">#{orderNumber}</span>
        </div>
      </div>

      {/* ── Order Details Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-bold text-[#1a1a1a]">Detail Pesanan</h2>
        </div>

        <div className="divide-y divide-gray-50">
          {/* Status */}
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiPackage size={14} />
              Status
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isPaidAutomatically
              ? "bg-emerald-100 text-emerald-600"
              : "bg-amber-100 text-amber-600"
              }`}>
              {isPaidAutomatically ? "Diproses" : "Menunggu Pembayaran"}
            </span>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-gray-500">Total Pesanan</span>
            <span className="text-sm font-bold text-[#00997a]">
              Rp {Number(order.totalAmount).toLocaleString("id-ID")}
            </span>
          </div>

          {/* Warehouse */}
          {order.warehouse && (
            <div className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FiMapPin size={14} />
                Dikirim dari Gudang
              </div>
              <span className="text-sm font-semibold text-[#1a1a1a]">
                {order.warehouse.name}
              </span>
            </div>
          )}

          {/* Address */}
          {order.address && (
            <div className="flex items-start justify-between px-5 py-3.5 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
                <FiMapPin size={14} />

              </div>
              <p className="text-sm text-right text-gray-700 leading-snug">
                {order.address.name}<br />
                <span className="text-gray-400 text-xs">
                  {order.address.detail}, {order.address.district},{" "}
                  {order.address.city}
                </span>
              </p>
            </div>
          )}

          {/* Estimated */}
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiClock size={14} />
              Estimasi Pengiriman
            </div>
            <span className="text-sm font-semibold text-gray-700">
              2–4 Hari Kerja
            </span>
          </div>
        </div>
      </div>

      {/* ── Next Steps ── */}
      {!isPaidAutomatically && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5">
          <h3 className="font-bold text-amber-800 text-sm mb-2">Langkah Selanjutnya</h3>
          <ol className="space-y-2 text-xs text-amber-700 list-decimal list-inside leading-relaxed">
            <li>Transfer ke rekening yang tertera</li>
            <li>Upload bukti pembayaran di halaman pembayaran</li>
            <li>Tunggu verifikasi tim kami (maks. 1×24 jam)</li>
            <li>Pesanan akan segera dikirim setelah terverifikasi</li>
          </ol>
          <Link
            href={`/checkout/${order.id}/payment`}
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Upload Bukti Pembayaran
            <FiArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div className="space-y-3">
        <Link
          href="/orders"
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#00997a] hover:bg-[#007a61] text-white font-bold rounded-xl transition-colors shadow-sm"
        >
          <FiPackage size={16} />
          Lihat Semua Pesanan
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-3 border-2 border-gray-100 hover:border-[#00997a] text-gray-600 hover:text-[#00997a] font-semibold rounded-xl transition-all text-sm"
        >
          <FiHome size={15} />
          Kembali Belanja
        </Link>
      </div>
    </div>
  );
}
