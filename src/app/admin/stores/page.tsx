"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axiosInstance";
import RoleGuard from "@/components/auth/RoleGuard";

interface Store {
    id: string;
    name: string;
    cityId: string;
    provinceId: string;
    isActive: boolean;
    isMain: boolean;
}

export default function StoreManagementPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [provinces, setProvinces] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        provinceId: "",
        cityId: "",
        latitude: 0,
        longitude: 0,
        isActive: true,
    });

    const fetchStores = async () => {
        try {
            const res = await api.get("/stores");
            setStores(res.data.data);
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    useEffect(() => {
        fetchStores();
        api.get("/shipping/provinces").then(res => setProvinces(res.data.data));
    }, []);

    const handleProvinceChange = async (id: string) => {
        setFormData({ ...formData, provinceId: id, cityId: "" });
        const res = await api.get(`/shipping/cities?provinceId=${id}`);
        setCities(res.data.data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/stores", {
                ...formData,
                latitude: parseFloat(formData.latitude.toString()),
                longitude: parseFloat(formData.longitude.toString()),
            });
            setShowModal(false);
            fetchStores();
        } catch (e) { alert("Gagal menambah cabang"); }
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
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stores.map((store) => (
                                <tr key={store.id} className="hover:bg-gray-50/50 transition">
                                    <td className="px-6 py-4 font-medium text-gray-900">{store.name} {store.isMain && "⭐"}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${store.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                            {store.isActive ? "Aktif" : "Nonaktif"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-sm font-bold text-red-500 hover:underline">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Add Store Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                            <h2 className="text-xl font-bold mb-4">Tambah Cabang Baru</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="text" placeholder="Nama Cabang" required
                                    className="w-full p-2.5 border rounded-lg"
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <select
                                    className="w-full p-2.5 border rounded-lg" required
                                    onChange={(e) => handleProvinceChange(e.target.value)}
                                >
                                    <option value="">Pilih Provinsi</option>
                                    {provinces.map((p: any) => <option key={p.province_id} value={p.province_id}>{p.province}</option>)}
                                </select>
                                <select
                                    className="w-full p-2.5 border rounded-lg" required
                                    disabled={!formData.provinceId}
                                    onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                                >
                                    <option value="">Pilih Kota</option>
                                    {cities.map((c: any) => <option key={c.city_id} value={c.city_id}>{c.city_name}</option>)}
                                </select>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="number" step="any" placeholder="Latitude" className="p-2.5 border rounded-lg" onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })} />
                                    <input type="number" step="any" placeholder="Longitude" className="p-2.5 border rounded-lg" onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })} />
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-lg">Batal</button>
                                    <button type="submit" className="flex-1 py-2 bg-[#00997a] text-white font-bold rounded-lg hover:bg-[#007a61]">Simpan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </RoleGuard>
    );
}