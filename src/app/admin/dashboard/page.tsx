"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import Link from "next/link";
import {
    LayoutDashboard,
    Store,
    Users,
    Package,
    Settings
} from "lucide-react";

export default function AdminDashboard() {
    const stats = [
        { name: "Total Toko", value: "12", icon: Store, color: "text-blue-600", bg: "bg-blue-50" },
        { name: "Total Admin", value: "8", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
        { name: "Produk Aktif", value: "124", icon: Package, color: "text-orange-600", bg: "bg-orange-50" },
    ];

    return (
        <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-3xl font-extrabold text-[#1a1a1a]">Dashboard Super Admin</h1>
                        <p className="text-gray-500">Selamat datang kembali! Kelola seluruh operasional Grosur di sini.</p>
                    </header>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {stats.map((item) => (
                            <div key={item.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${item.bg} ${item.color}`}>
                                    <item.icon size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">{item.name}</p>
                                    <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions (Epic 1.5) */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Settings size={20} className="text-[#00997a]" />
                            Manajemen Cepat
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Link
                                href="/admin/stores"
                                className="p-4 border border-gray-100 rounded-lg hover:border-[#00997a] hover:bg-[#59cfb7]/5 transition group"
                            >
                                <h3 className="font-bold text-[#1a1a1a] group-hover:text-[#00997a]">Kelola Cabang</h3>
                                <p className="text-xs text-gray-500 mt-1">Tambah, edit, atau hapus lokasi toko fisik.</p>
                            </Link>

                            <div className="p-4 border border-gray-100 rounded-lg opacity-50 cursor-not-allowed">
                                <h3 className="font-bold text-[#1a1a1a]">Manajemen Admin</h3>
                                <p className="text-xs text-gray-500 mt-1">Tugaskan admin ke cabang (Segera Hadir).</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}