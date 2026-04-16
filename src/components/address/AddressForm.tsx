"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/axiosInstance";

// 1. Validation Schema
const addressSchema = z.object({
    name: z.string().min(1, "Nama penerima wajib diisi"),
    phone: z.string().min(9, "Nomor telepon tidak valid"),
    provinceId: z.string().min(1, "Pilih provinsi"),
    province: z.string(), // We store the name too, for display purposes
    cityId: z.string().min(1, "Pilih kota/kabupaten"),
    city: z.string(),
    district: z.string().min(1, "Kecamatan wajib diisi"),
    postalCode: z.string().optional(),
    detail: z.string().min(10, "Alamat lengkap minimal 10 karakter"),
    isDefault: z.boolean().default(false),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function AddressForm({ onSuccess }: { onSuccess?: () => void }) {
    const [provinces, setProvinces] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [serverError, setServerError] = useState("");

    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<AddressFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(addressSchema) as any,
    });

    // Watch the provinceId to trigger the city fetch
    const selectedProvinceId = watch("provinceId");

    // 2. Fetch Provinces on Mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await api.get("/shipping/provinces");
                setProvinces(res.data.data);
            } catch (error) {
                console.error("Failed to fetch provinces");
            } finally {
                setIsLoadingProvinces(false);
            }
        };
        fetchProvinces();
    }, []);

    // 3. Fetch Cities when Province changes
    useEffect(() => {
        if (selectedProvinceId) {
            const fetchCities = async () => {
                setIsLoadingCities(true);
                try {
                    const res = await api.get(`/shipping/cities?provinceId=${selectedProvinceId}`);
                    setCities(res.data.data);
                } catch (error) {
                    console.error("Failed to fetch cities");
                } finally {
                    setIsLoadingCities(false);
                }
            };
            fetchCities();
        } else {
            setCities([]); // Reset cities if no province is selected
        }
    }, [selectedProvinceId]);

    // 4. Handle Submit
    const onSubmit = async (data: AddressFormValues) => {
        try {
            setServerError("");

            // Get the string names of the selected IDs to save to the database
            const selectedProv = provinces.find(p => p.province_id === data.provinceId);
            const selectedCity = cities.find(c => c.city_id === data.cityId);

            const payload = {
                ...data,
                province: selectedProv?.province || "",
                city: selectedCity?.type === "Kabupaten" ? `Kabupaten ${selectedCity.city_name}` : `Kota ${selectedCity.city_name}`,
            };

            // Call your address controller (which will also hit OpenCage to get Lat/Lng!)
            await api.post("/addresses", payload);

            if (onSuccess) onSuccess();

        } catch (error: any) {
            setServerError(error.response?.data?.message || "Gagal menyimpan alamat");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">Tambah Alamat Baru</h2>

            {serverError && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{serverError}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Penerima</label>
                    <input {...register("name")} className="w-full p-2.5 mt-1 border rounded-md outline-none focus:ring-2 focus:ring-[#59cfb7]" />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
                    <input {...register("phone")} className="w-full p-2.5 mt-1 border rounded-md outline-none focus:ring-2 focus:ring-[#59cfb7]" />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PROVINCE DROPDOWN */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Provinsi</label>
                    <select
                        {...register("provinceId")}
                        disabled={isLoadingProvinces}
                        className="w-full p-2.5 mt-1 border rounded-md bg-white outline-none focus:ring-2 focus:ring-[#59cfb7]"
                    >
                        <option value="">{isLoadingProvinces ? "Memuat..." : "Pilih Provinsi"}</option>
                        {provinces.map((prov) => (
                            <option key={prov.province_id} value={prov.province_id}>{prov.province}</option>
                        ))}
                    </select>
                    {errors.provinceId && <p className="text-xs text-red-500 mt-1">{errors.provinceId.message}</p>}
                </div>

                {/* CITY DROPDOWN */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kota / Kabupaten</label>
                    <select
                        {...register("cityId")}
                        disabled={!selectedProvinceId || isLoadingCities}
                        className="w-full p-2.5 mt-1 border rounded-md bg-white outline-none disabled:bg-gray-100 focus:ring-2 focus:ring-[#59cfb7]"
                    >
                        <option value="">{isLoadingCities ? "Memuat..." : "Pilih Kota/Kab"}</option>
                        {cities.map((city) => (
                            <option key={city.city_id} value={city.city_id}>
                                {city.type === "Kabupaten" ? "Kab." : "Kota"} {city.city_name}
                            </option>
                        ))}
                    </select>
                    {errors.cityId && <p className="text-xs text-red-500 mt-1">{errors.cityId.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kecamatan</label>
                    <input {...register("district")} className="w-full p-2.5 mt-1 border rounded-md outline-none focus:ring-2 focus:ring-[#59cfb7]" />
                    {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kode Pos</label>
                    <input {...register("postalCode")} className="w-full p-2.5 mt-1 border rounded-md outline-none focus:ring-2 focus:ring-[#59cfb7]" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Alamat Lengkap (Jalan, RT/RW, Patokan)</label>
                <textarea {...register("detail")} rows={3} className="w-full p-2.5 mt-1 border rounded-md outline-none focus:ring-2 focus:ring-[#59cfb7]"></textarea>
                {errors.detail && <p className="text-xs text-red-500 mt-1">{errors.detail.message}</p>}
            </div>

            <div className="flex items-center">
                <input type="checkbox" {...register("isDefault")} id="isDefault" className="w-4 h-4 text-[#00997a] border-gray-300 rounded focus:ring-[#59cfb7]" />
                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">Jadikan sebagai alamat utama</label>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 text-white font-bold bg-[#00997a] rounded-md hover:bg-[#00997a]/90 disabled:opacity-50"
            >
                {isSubmitting ? "Menyimpan..." : "Simpan Alamat"}
            </button>
        </form>
    );
}