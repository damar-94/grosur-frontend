"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axiosInstance";
import RoleGuard from "@/components/auth/RoleGuard";

import BannerManagement from "@/components/profile/BannerManagement";
import { Store as StoreIcon, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
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

interface Store {
    id: string;
    name: string;
    city: string;
    province: string;
    isActive: boolean;
    isMain: boolean;
}

export default function StoreManagementPage() {
    const [activeTab, setActiveTab] = useState<"stores" | "banners">("stores");
    const [stores, setStores] = useState<Store[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // --- Edit State ---
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);


    // --- Assign Admin State ---
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

    // --- Confirm Dialog State ---
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        description: string;
        action: () => void;
        variant?: "default" | "destructive";
    }>({
        open: false,
        title: "",
        description: "",
        action: () => { },
    });


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
        isMain: false
    });

    const resetForm = () => {
        setFormData({
            name: "",
            address: "",
            district: "",
            province: "",
            city: "",
            latitude: 0,
            longitude: 0,
            isActive: true,
            isMain: false
        });
        setIsEditing(false);
        setEditId(null);
    };


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
            const payload = {
                ...formData,
                latitude: parseFloat(formData.latitude.toString()),
                longitude: parseFloat(formData.longitude.toString()),
            };

            if (isEditing && editId) {
                await api.patch(`/stores/${editId}`, payload);
                toast.success("Cabang berhasil diperbarui!");
            } else {
                await api.post("/stores", payload);
                toast.success("Cabang berhasil ditambahkan!");
            }
            
            setShowModal(false);
            resetForm();
            fetchStores();
        } catch (e: any) { toast.error(e.response?.data?.message || "Gagal menyimpan cabang"); }
    };


    const handleEdit = (store: any) => {
        setFormData({
            name: store.name,
            address: store.address,
            district: store.district,
            province: store.province,
            city: store.city,
            latitude: store.latitude,
            longitude: store.longitude,
            isActive: store.isActive,
            isMain: store.isMain
        });
        setIsEditing(true);
        setEditId(store.id);
        setShowModal(true);
    };

    const handleSetMain = async (id: string) => {
        setConfirmDialog({
            open: true,
            title: "Jadikan Toko Pusat?",
            description: "Cabang ini akan menjadi toko utama. Toko pusat sebelumnya akan digantikan.",
            action: async () => {
                try {
                    await api.patch(`/stores/${id}/set-main`);
                    toast.success("Toko pusat berhasil diperbarui!");
                    fetchStores();
                } catch (e: any) { toast.error(e.response?.data?.message || "Gagal mengatur toko pusat"); }
            },
            variant: "default"
        });
    };


    const handleDelete = async (id: string) => {
        setConfirmDialog({
            open: true,
            title: "Hapus Cabang?",
            description: "Tindakan ini tidak dapat dibatalkan. Semua data terkait cabang ini akan dihapus.",
            action: async () => {
                try {
                    await api.delete(`/stores/${id}`);
                    toast.success("Cabang berhasil dihapus");
                    fetchStores();
                } catch (e) { toast.error("Gagal menghapus cabang"); }
            },
            variant: "destructive"
        });
    };

    // --- ASSIGN ADMIN ACTIONS ---
    const openAssignModal = async (storeId: string) => {
        setSelectedStoreId(storeId);
        setShowAssignModal(true);
        try {
            // Retrieve users through the correct super admin endpoint
            const res = await api.get("/admin/users");
            // Filter out super admins or existing store admins if necessary
            setUsers(res.data.data.filter((u: any) => u.role === "USER"));
        } catch (e) {
            console.error("Gagal mengambil data user", e);
        }
    };

    const handleAssignAdmin = async (userId: string) => {
        try {
            await api.patch(`/stores/${selectedStoreId}/assign`, { userId });
            toast.success("Admin berhasil ditugaskan!");
            setShowAssignModal(false);
            fetchStores();
        } catch (e) { toast.error("Gagal menugaskan admin"); }
    };


    return (
        <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <div className="p-4 md:p-8 max-w-6xl mx-auto">
                {/* Dashboard Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Store & Banners</h1>
                    <p className="text-gray-500 mt-1">Kelola cabang toko dan konten promosi aplikasi</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-2 border-b border-gray-200 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <button
                        onClick={() => setActiveTab("stores")}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all border-b-2 ${
                            activeTab === "stores"
                                ? "border-[#00997a] text-[#00997a]"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
                        }`}
                    >
                        <StoreIcon size={18} />
                        Manajemen Cabang
                    </button>
                    <button
                        onClick={() => setActiveTab("banners")}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all border-b-2 ${
                            activeTab === "banners"
                                ? "border-[#00997a] text-[#00997a]"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
                        }`}
                    >
                        <ImageIcon size={18} />
                        Manajemen Banner
                    </button>
                </div>

                {/* TAB CONTENT: STORES */}
                {activeTab === "stores" && (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Daftar Cabang</h2>
                            <button
                                onClick={() => { resetForm(); setShowModal(true); }}
                                className="bg-[#00997a] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#007a61] transition shadow-sm flex items-center gap-2 text-sm"
                            >
                                <StoreIcon size={16} /> + Tambah Cabang
                            </button>
                        </div>

                        {/* Store Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Nama Cabang</th>
                                        <th className="px-6 py-4 hidden sm:table-cell">Lokasi</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {stores.length === 0 && !isLoading && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                                Belum ada cabang toko terdaftar.
                                            </td>
                                        </tr>
                                    )}
                                    {stores.map((store) => (
                                        <tr key={store.id} className="hover:bg-gray-50/50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 flex items-center gap-1.5 text-sm sm:text-base">
                                                        {store.name} {store.isMain && <span className="text-yellow-500" title="Cabang Utama">⭐</span>}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 sm:hidden">{store.city}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{store.city}, {store.province}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${store.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                    {store.isActive ? "Aktif" : "Nonaktif"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right flex flex-col sm:flex-row justify-end items-end sm:items-center gap-2 sm:gap-4">
                                                {!store.isMain && (
                                                    <button onClick={() => handleSetMain(store.id)} className="text-xs font-bold text-amber-600 hover:text-amber-800 transition-colors uppercase tracking-tight">
                                                        Set Pusat
                                                    </button>
                                                )}
                                                <button onClick={() => handleEdit(store)} className="text-xs font-bold text-[#00997a] hover:text-[#007a61] transition-colors uppercase tracking-tight">
                                                    Edit
                                                </button>
                                                <button onClick={() => openAssignModal(store.id)} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-tight">
                                                    Tugaskan Admin
                                                </button>
                                                <button onClick={() => handleDelete(store.id)} className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-tight">
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB CONTENT: BANNERS */}
                {activeTab === "banners" && (
                    <div className="animate-in fade-in duration-500">
                        <BannerManagement />
                    </div>
                )}

                {/* --- ADD STORE MODAL --- */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
                            <h2 className="text-2xl font-black mb-6 text-gray-900">{isEditing ? "Edit Cabang" : "Tambah Cabang Baru"}</h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Informasi Dasar</label>
                                    <input type="text" placeholder="Nama Cabang" value={formData.name} required className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#59cfb7]/20 outline-none transition-all" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                    <input type="text" placeholder="Alamat Lengkap" value={formData.address} required className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#59cfb7]/20 outline-none transition-all" onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Lokasi Wilayah</label>
                                    <select className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#59cfb7]/20 outline-none transition-all" required onChange={handleProvinceChange}>
                                        <option value="">Pilih Provinsi</option>
                                        {provinces.map((p: any) => <option key={p.province_id} value={p.province_id}>{p.province}</option>)}
                                    </select>
                                    <select className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#59cfb7]/20 outline-none transition-all disabled:bg-gray-50" required disabled={!formData.province} onChange={handleCityChange}>
                                        <option value="">Pilih Kota</option>
                                        {cities.map((c: any) => <option key={c.city_id} value={c.city_id}>{c.city_name}</option>)}
                                    </select>
                                    <input type="text" placeholder="Kecamatan (District)" value={formData.district} required className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#59cfb7]/20 outline-none transition-all" onChange={(e) => setFormData({ ...formData, district: e.target.value })} />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Koordinat (Peta)</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-gray-400 ml-1">Latitude</span>
                                            <input 
                                                type="number" 
                                                step="any" 
                                                placeholder="-7.792..." 
                                                value={formData.latitude} 
                                                required 
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#59cfb7]/20 outline-none transition-all" 
                                                onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })} 
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-gray-400 ml-1">Longitude</span>
                                            <input 
                                                type="number" 
                                                step="any" 
                                                placeholder="110.365..." 
                                                value={formData.longitude} 
                                                required 
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#59cfb7]/20 outline-none transition-all" 
                                                onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })} 
                                            />
                                        </div>
                                    </div>
                                </div>


                                <div className="flex gap-3 pt-6 border-t border-gray-100">
                                    <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Batal</button>
                                    <button type="submit" className="flex-1 py-3 bg-[#00997a] text-white font-black rounded-xl hover:bg-[#007a61] transition-all shadow-md">{isEditing ? "Perbarui" : "Simpan Cabang"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}


                {/* --- ASSIGN ADMIN MODAL --- */}
                {showAssignModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in duration-200">
                            <h2 className="text-2xl font-black mb-2 text-gray-900">Tugaskan Admin</h2>
                            <p className="text-sm text-gray-500 mb-6">Pilih user untuk mengelola cabang ini.</p>

                            <div className="max-h-60 overflow-y-auto space-y-2 mb-8 border-y border-gray-100 py-4 scrollbar-thin scrollbar-thumb-gray-200">
                                {users.length === 0 ? <p className="text-center text-sm text-gray-500 py-4">Tidak ada user tersedia.</p> : null}
                                {users.map(user => (
                                    <div key={user.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group">
                                        <div className="flex flex-col">
                                            <p className="font-bold text-sm text-gray-900">{user.name || "User Tanpa Nama"}</p>
                                            <p className="text-[10px] text-gray-400 group-hover:text-primary/70">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAssignAdmin(user.id)}
                                            className="text-[10px] bg-[#00997a] text-white px-4 py-2 rounded-lg font-black hover:bg-[#007a61] transition-all uppercase tracking-tight"
                                        >
                                            Pilih
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => setShowAssignModal(false)} className="w-full py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
                {/* --- SHARED CONFIRM DIALOG (AlertDialog) --- */}

                <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                {confirmDialog.variant === "destructive" ? <AlertCircle className="text-red-500" size={20} /> : <CheckCircle2 className="text-[#00997a]" size={20} />}
                                {confirmDialog.title}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {confirmDialog.description}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDialog.action}
                                className={confirmDialog.variant === "destructive" ? "bg-red-600 hover:bg-red-700" : "bg-[#00997a] hover:bg-[#007a61]"}
                            >
                                Lanjutkan
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </div>
        </RoleGuard>
    );
}