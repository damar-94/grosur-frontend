"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axiosInstance";
import RoleGuard from "@/components/auth/RoleGuard";

interface Store {
    id: string;
    name: string;
    city: string;
    province: string;
    isActive: boolean;
    isMain: boolean;
}

export default function StoreManagementPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // --- Assign Admin State ---
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

    // --- Form State (Updated to match Prisma Schema) ---
    const [provinces, setProvinces] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        district: "",
        province: "",
        city: "",
        latitude: 0,
        longitude: 0,
        isActive: true,
    });

    const fetchStores = async () => {
        try {
            const res = await api.get("/stores");
            setStores(res.data.data);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        fetchStores();
        api.get("/shipping/provinces").then(res => setProvinces(res.data.data));
    }, []);

    // 💡 FIX: Capture the NAME of the province/city for Prisma, not just the ID
    const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        const name = e.target.options[e.target.selectedIndex].text;
        setFormData({ ...formData, province: name, city: "" }); // Reset city
        const res = await api.get(`/shipping/cities?provinceId=${id}`);
        setCities(res.data.data);
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const name = e.target.options[e.target.selectedIndex].text;
        setFormData({ ...formData, city: name });
    };

    // --- CRUD ACTIONS ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/stores", {
                ...formData,
                latitude: parseFloat(formData.latitude.toString()),
                longitude: parseFloat(formData.longitude.toString()),
            });
            alert("Cabang berhasil ditambahkan!");
            setShowModal(false);
            fetchStores();
        } catch (e: any) { alert(e.response?.data?.message || "Gagal menambah cabang"); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus cabang ini?")) return;
        try {
            await api.delete(`/stores/${id}`);
            fetchStores();
        } catch (e) { alert("Gagal menghapus cabang"); }
    };

    // --- ASSIGN ADMIN ACTIONS ---
    const openAssignModal = async (storeId: string) => {
        setSelectedStoreId(storeId);
        setShowAssignModal(true);
        try {
            // Retrieve users through the correct super admin endpoint
            const res = await api.get("/admin/users");
            // Filter out super admins or existing store admins if necessary
            // The result structure is already res.data.data from our sendResponse util
            setUsers(res.data.data.filter((u: any) => u.role === "USER"));
        } catch (e) {
            console.error("Gagal mengambil data user", e);
        }
    };

    const handleAssignAdmin = async (userId: string) => {
        try {
            await api.patch(`/stores/${selectedStoreId}/assign`, { userId });
            alert("Admin berhasil ditugaskan!");
            setShowAssignModal(false);
            fetchStores();
        } catch (e) { alert("Gagal menugaskan admin"); }
    };

    return (
        <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <div className="p-8 max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Cabang</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#00997a] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#007a61] transition"
                    >
                        + Tambah Cabang
                    </button>
                </div>

                {/* Store Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4">Nama Cabang</th>
                                <th className="px-6 py-4">Lokasi</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stores.map((store) => (
                                <tr key={store.id} className="hover:bg-gray-50/50 transition">
                                    <td className="px-6 py-4 font-medium text-gray-900">{store.name} {store.isMain && "⭐"}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{store.city}, {store.province}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${store.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                            {store.isActive ? "Aktif" : "Nonaktif"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-4">
                                        {/* 💡 The Assign Admin Button */}
                                        <button onClick={() => openAssignModal(store.id)} className="text-sm font-bold text-blue-600 hover:underline">
                                            Tugaskan Admin
                                        </button>
                                        {/* 💡 Wired up the Delete Button */}
                                        <button onClick={() => handleDelete(store.id)} className="text-sm font-bold text-red-500 hover:underline">
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- ADD STORE MODAL --- */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">Tambah Cabang Baru</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input type="text" placeholder="Nama Cabang" required className="w-full p-2.5 border rounded-lg" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                <input type="text" placeholder="Alamat Lengkap" required className="w-full p-2.5 border rounded-lg" onChange={(e) => setFormData({ ...formData, address: e.target.value })} />

                                <select className="w-full p-2.5 border rounded-lg" required onChange={handleProvinceChange}>
                                    <option value="">Pilih Provinsi</option>
                                    {provinces.map((p: any) => <option key={p.province_id} value={p.province_id}>{p.province}</option>)}
                                </select>

                                <select className="w-full p-2.5 border rounded-lg" required disabled={!formData.province} onChange={handleCityChange}>
                                    <option value="">Pilih Kota</option>
                                    {cities.map((c: any) => <option key={c.city_id} value={c.city_id}>{c.city_name}</option>)}
                                </select>

                                <input type="text" placeholder="Kecamatan (District)" required className="w-full p-2.5 border rounded-lg" onChange={(e) => setFormData({ ...formData, district: e.target.value })} />

                                <div className="grid grid-cols-2 gap-2">
                                    <input type="number" step="any" placeholder="Latitude" required className="p-2.5 border rounded-lg" onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })} />
                                    <input type="number" step="any" placeholder="Longitude" required className="p-2.5 border rounded-lg" onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })} />
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-lg">Batal</button>
                                    <button type="submit" className="flex-1 py-2 bg-[#00997a] text-white font-bold rounded-lg hover:bg-[#007a61]">Simpan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- ASSIGN ADMIN MODAL --- */}
                {showAssignModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                            <h2 className="text-xl font-bold mb-2">Tugaskan Admin</h2>
                            <p className="text-sm text-gray-500 mb-4">Pilih user untuk mengelola cabang ini.</p>

                            <div className="max-h-60 overflow-y-auto space-y-2 mb-6 border-y border-gray-100 py-2">
                                {users.length === 0 ? <p className="text-center text-sm text-gray-500 py-4">Tidak ada user tersedia.</p> : null}
                                {users.map(user => (
                                    <div key={user.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                                        <div>
                                            <p className="font-bold text-sm">{user.name || "User Tanpa Nama"}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAssignAdmin(user.id)}
                                            className="text-xs bg-[#00997a] text-white px-3 py-1.5 rounded-md font-bold hover:bg-[#007a61]"
                                        >
                                            Pilih
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => setShowAssignModal(false)} className="w-full py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-lg">
                                Tutup
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </RoleGuard>
    );
}