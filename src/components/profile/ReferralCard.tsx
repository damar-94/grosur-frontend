"use client";

import { useAppStore } from "@/stores/useAppStore";
import { Copy, Gift } from "lucide-react";

export default function ReferralCard() {
    const user = useAppStore((state) => state.user);

    const copyToClipboard = () => {
        if (user?.referralCode) {
            navigator.clipboard.writeText(user.referralCode);
            alert("Kode referral berhasil disalin!");
        }
    };

    return (
        <div className="bg-gradient-to-br from-[#00997a] to-[#59cfb7] p-6 rounded-2xl text-white shadow-lg">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Gift size={20} />
                        <span className="font-bold uppercase tracking-wider text-xs">Program Referral</span>
                    </div>
                    <h3 className="text-xl font-bold mb-1">Undang Teman, Dapat Voucher!</h3>
                    <p className="text-sm opacity-90">Bagikan kode Anda dan dapatkan voucher belanja Rp 50.000.</p>
                </div>
            </div>

            <div className="mt-6 bg-white/20 backdrop-blur-sm p-4 rounded-xl flex items-center justify-between border border-white/30">
                <div>
                    <p className="text-xs uppercase opacity-70 mb-1">Kode Anda</p>
                    <p className="text-2xl font-black tracking-widest">{user?.referralCode || "------"}</p>
                </div>
                <button
                    onClick={copyToClipboard}
                    className="bg-white text-[#00997a] p-3 rounded-lg hover:bg-gray-100 transition shadow-md"
                >
                    <Copy size={20} />
                </button>
            </div>
        </div>
    );
}