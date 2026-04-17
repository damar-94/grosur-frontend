"use client";

import { useAppStore } from "@/stores/useAppStore";
import { useEffect, useState } from "react";
import { api } from "@/lib/axiosInstance";
import { Copy, Gift, Users, Ticket, CheckCircle2, Clock, XCircle } from "lucide-react";

interface Invitee {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
}

interface Voucher {
  id: string;
  code: string;
  type: string;
  value: number;
  isUsed: boolean;
  usedAt: string | null;
  expiryDate: string;
  createdAt: string;
}

export default function ReferralCard() {
  const user = useAppStore((state) => state.user);
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"vouchers" | "invitees">("vouchers");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/vouchers/referral-summary", { withCredentials: true });
        setInvitees(res.data.data.invitees);
        setVouchers(res.data.data.vouchers);
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const copyToClipboard = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode.toUpperCase());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatRp = (val: number) =>
    `Rp ${val.toLocaleString("id-ID")}`;

  const isExpired = (date: string) => new Date(date) < new Date();

  const voucherStatus = (v: Voucher) => {
    if (v.isUsed) return { label: "Terpakai", color: "text-gray-400", icon: <CheckCircle2 size={14} className="text-gray-400" /> };
    if (isExpired(v.expiryDate)) return { label: "Kadaluarsa", color: "text-red-400", icon: <XCircle size={14} className="text-red-400" /> };
    return { label: "Aktif", color: "text-[#00997a]", icon: <Clock size={14} className="text-[#00997a]" /> };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Header: Referral Code Box */}
      <div className="bg-gradient-to-br from-[#00997a] to-[#007a61] p-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Gift size={20} />
          <span className="font-semibold text-sm uppercase tracking-wider opacity-90">Program Referral</span>
        </div>
        <h3 className="text-xl font-bold mb-1">Undang Teman, Dapat Voucher!</h3>
        <p className="text-sm opacity-80 mb-4">
          Bagikan kode Anda. Teman dapat <span className="font-bold">Rp 25.000</span> dan Anda dapat <span className="font-bold">Rp 50.000</span> setelah mereka mendaftar.
        </p>

        {/* Code display */}
        <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 w-fit">
          <span className="font-black text-2xl tracking-widest">
            {user?.referralCode?.toUpperCase() || "------"}
          </span>
          <button
            onClick={copyToClipboard}
            className="bg-white/20 hover:bg-white/30 transition-colors rounded-lg p-2"
            title="Salin kode"
          >
            {copied ? (
              <CheckCircle2 size={18} className="text-white" />
            ) : (
              <Copy size={18} className="text-white" />
            )}
          </button>
        </div>
        {copied && <p className="text-xs mt-2 opacity-80">✅ Kode berhasil disalin!</p>}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab("vouchers")}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === "vouchers"
              ? "text-[#00997a] border-b-2 border-[#00997a]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Ticket size={16} />
          Voucher Saya ({vouchers.length})
        </button>
        <button
          onClick={() => setActiveTab("invitees")}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === "invitees"
              ? "text-[#00997a] border-b-2 border-[#00997a]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users size={16} />
          Teman Diundang ({invitees.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-4 min-h-[160px]">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-400 text-sm">Memuat data...</div>
        ) : activeTab === "vouchers" ? (
          vouchers.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              <Ticket size={32} className="mx-auto mb-2 opacity-30" />
              Belum ada voucher. Undang teman untuk mendapatkan voucher!
            </div>
          ) : (
            <ul className="space-y-2">
              {vouchers.map((v) => {
                const status = voucherStatus(v);
                return (
                  <li key={v.id} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${v.isUsed || isExpired(v.expiryDate) ? "bg-gray-50 border-gray-100 opacity-70" : "bg-[#f0fdf9] border-[#d1fae5]"}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-gray-500 truncate">{v.code}</p>
                      <p className="font-bold text-gray-900">{formatRp(v.value)} <span className="text-xs font-normal text-gray-400">· {v.type === "TOTAL" ? "Belanja" : v.type === "SHIPPING" ? "Ongkos Kirim" : "Produk"}</span></p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Berlaku hingga: {new Date(v.expiryDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        {v.isUsed && v.usedAt && ` · Dipakai: ${new Date(v.usedAt).toLocaleDateString("id-ID")}`}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${status.color} flex-shrink-0`}>
                      {status.icon}
                      {status.label}
                    </div>
                  </li>
                );
              })}
            </ul>
          )
        ) : (
          invitees.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              Belum ada teman yang mendaftar menggunakan kode Anda.
            </div>
          ) : (
            <ul className="space-y-2">
              {invitees.map((inv) => (
                <li key={inv.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00997a]/10 flex items-center justify-center text-[#00997a] font-bold text-sm flex-shrink-0">
                    {(inv.name || inv.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{inv.name || "Pengguna Baru"}</p>
                    <p className="text-[11px] text-gray-400 truncate">{inv.email}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 flex-shrink-0">
                    {new Date(inv.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
}