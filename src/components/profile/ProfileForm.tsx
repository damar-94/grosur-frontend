"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/lib/axiosInstance";
import { useAppStore } from "@/stores/useAppStore";
import Image from "next/image";

interface ProfileFormValues {
    name: string;
}

export default function ProfileForm() {
    const { user, setUser } = useAppStore();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(user?.profilePicture || null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
        defaultValues: {
            name: user?.name || "",
        }
    });

    // Handle local image preview before upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // 1MB validation on the client side for better UX
            if (selectedFile.size > 1024 * 1024) {
                alert("Ukuran file maksimal 1MB");
                return;
            }
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const onSubmit = async (data: ProfileFormValues) => {
        setIsLoading(true);
        setMessage("");

        const formData = new FormData();
        if (data.name) formData.append("name", data.name);
        if (file) formData.append("profilePhoto", file);

        try {
            const res = await api.patch("/users/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Update global state with the fresh user data
            setUser(res.data.data);
            setMessage("Profil berhasil diperbarui!");
            setFile(null); // Reset file input
        } catch (error: any) {
            setMessage(error.response?.data?.message || "Terjadi kesalahan.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 max-w-md mx-auto mt-10">
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-6">Pengaturan Profil</h2>

            {message && (
                <div className={`p-3 mb-4 text-sm rounded-md font-medium ${message.includes("berhasil") ? "bg-[#59cfb7]/20 text-[#00997a]" : "bg-red-50 text-red-600"}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Photo Upload Section */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#00997a] bg-gray-100">
                        {preview ? (
                            <Image src={preview} alt="Profile" fill className="object-cover" />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full text-gray-400">
                                <span className="text-xs">No Photo</span>
                            </div>
                        )}
                    </div>

                    <label className="cursor-pointer px-4 py-2 text-sm font-medium text-[#00997a] bg-[#59cfb7]/10 rounded-full hover:bg-[#59cfb7]/20 transition">
                        Ganti Foto
                        <input
                            type="file"
                            className="hidden"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                        />
                    </label>
                    <p className="text-xs text-gray-400">Format: .jpg, .png (Max: 1MB)</p>
                </div>

                {/* Text Inputs */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                    <input
                        {...register("name", { required: "Nama tidak boleh kosong" })}
                        className="w-full p-2.5 mt-1 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-[#59cfb7]"
                        placeholder="Masukkan nama Anda"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email (Tidak dapat diubah)</label>
                    <input
                        disabled
                        value={user?.email || ""}
                        className="w-full p-2.5 mt-1 border border-gray-200 rounded-md bg-gray-50 text-gray-500 outline-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 text-white font-bold bg-[#00997a] rounded-md hover:bg-[#00997a]/90 transition-colors disabled:opacity-50"
                >
                    {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </form>
        </div>
    );
}