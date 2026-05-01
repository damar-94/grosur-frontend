"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/lib/axiosInstance";

interface Province {
    province_id: string;
    province: string;
}

interface City {
    city_id: string;
    city_name: string;
    type: string;
}

interface AddressFormValues {
    name: string;
    phone: string;
    province: string;
    provinceId: string;
    city: string;
    cityId: string;
    district: string;
    detail: string;
    postalCode: string;
    isDefault: boolean;
}

interface Props {
    closeModal: () => void;
    refreshData: () => void;
    addressToEdit?: any;
}

export default function AddressModal({ closeModal, refreshData, addressToEdit }: Props) {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AddressFormValues>({
        defaultValues: addressToEdit || { isDefault: false }
    });

    // Watch for province changes to trigger city fetching
    const selectedProvinceId = watch("provinceId");

    // 1. Fetch Provinces on mount
    useEffect(() => {
        const getProvinces = async () => {
            try {
                const res = await api.get("/shipping/provinces");
                setProvinces(res.data.data);
            } catch (error) {
                console.error("Gagal memuat provinsi");
            }
        };
        getProvinces();
    }, []);

    // 2. Fetch Cities whenever the selected Province changes
    useEffect(() => {
        if (!selectedProvinceId) return;

        const getCities = async () => {
            try {
                const res = await api.get(`/shipping/cities?provinceId=${selectedProvinceId}`);
                setCities(res.data.data);
            } catch (error) {
                console.error("Gagal memuat kota");
            }
        };
        getCities();
    }, [selectedProvinceId]);

    const onSubmit = async (data: AddressFormValues) => {
        try {
            setIsLoading(true);

            // Find the names of selected Province/City for the database
            const provinceName = provinces.find(p => p.province_id === data.provinceId)?.province || "";
            const cityName = cities.find(c => c.city_id === data.cityId)?.city_name || "";

            const payload = {
                ...data,
                province: provinceName,
                city: cityName,
            };

            await api.post("/addresses", payload, { withCredentials: true });

            refreshData();
            closeModal();
        } catch (error) {
            alert("Gagal menyimpan alamat");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#1a1a1a]">Tambah Alamat Baru</h2>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Label Alamat</label>
                            <input {...register("name", { required: true })} placeholder="Rumah / Kantor" className="w-full p-2.5 border rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nomor HP</label>
                            <input {...register("phone", { required: true })} placeholder="0812..." className="w-full p-2.5 border rounded-lg text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Provinsi</label>
                        <select
                            {...register("provinceId", { required: true })}
                            className="w-full p-2.5 border rounded-lg text-sm bg-white"
                        >
                            <option value="">Pilih Provinsi</option>
                            {provinces.map(p => (
                                <option key={p.province_id} value={p.province_id}>{p.province}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kota/Kabupaten</label>
                        <select
                            {...register("cityId", { required: true })}
                            disabled={!selectedProvinceId}
                            className="w-full p-2.5 border rounded-lg text-sm bg-white disabled:bg-gray-50"
                        >
                            <option value="">Pilih Kota</option>
                            {cities.map(c => (
                                <option key={c.city_id} value={c.city_id}>{c.city_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kecamatan</label>
                            <input {...register("district", { required: true })} className="w-full p-2.5 border rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kode Pos</label>
                            <input {...register("postalCode", { required: true })} className="w-full p-2.5 border rounded-lg text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alamat Lengkap</label>
                        <textarea {...register("detail", { required: true })} rows={3} className="w-full p-2.5 border rounded-lg text-sm" placeholder="Nama jalan, nomor rumah, blok..."></textarea>
                    </div>

                    <div className="flex items-center gap-2 py-2">
                        <input type="checkbox" {...register("isDefault")} id="isDefault" className="w-4 h-4 accent-[#00997a]" />
                        <label htmlFor="isDefault" className="text-sm text-gray-600 cursor-pointer">Jadikan alamat utama</label>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-2.5 bg-[#00997a] text-white rounded-lg text-sm font-bold hover:bg-[#007a61] transition disabled:opacity-50"
                        >
                            {isLoading ? "Menyimpan..." : "Simpan Alamat"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}