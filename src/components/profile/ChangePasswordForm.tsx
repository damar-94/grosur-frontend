"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/lib/axiosInstance";

export default function ChangePasswordForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
    const newPassword = watch("newPassword");

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await api.patch("/users/password", {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            }, {
                withCredentials: true,
            });

            setMessage({ type: "success", text: res.data.message || "Password berhasil diubah" });
            reset();
        } catch (error: any) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Gagal mengubah password"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {message.text && (
                <div className={`p-3 mb-4 text-sm rounded-md font-medium ${message.type === "success" ? "bg-[#59cfb7]/20 text-[#00997a]" : "bg-red-50 text-red-600"}`}>
                    {message.text}
                </div>
            )}
            
            <div>
                <label className="block text-sm text-gray-600 mb-1">Password Saat Ini</label>
                <input 
                    type="password" 
                    {...register("currentPassword", { required: "Password saat ini wajib diisi" })}
                    className="w-full p-2 border border-gray-300 rounded outline-none focus:border-[#00997a]" 
                />
                {errors.currentPassword && <p className="mt-1 text-xs text-red-500">{errors.currentPassword.message as string}</p>}
            </div>
            
            <div>
                <label className="block text-sm text-gray-600 mb-1">Password Baru</label>
                <input 
                    type="password" 
                    {...register("newPassword", { 
                        required: "Password baru wajib diisi",
                        minLength: { value: 6, message: "Minimal 6 karakter" }
                    })}
                    className="w-full p-2 border border-gray-300 rounded outline-none focus:border-[#00997a]" 
                />
                {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword.message as string}</p>}
            </div>
            
            <div>
                <label className="block text-sm text-gray-600 mb-1">Konfirmasi Password Baru</label>
                <input 
                    type="password" 
                    {...register("confirmPassword", { 
                        required: "Konfirmasi password wajib diisi",
                        validate: value => value === newPassword || "Password tidak cocok"
                    })}
                    className="w-full p-2 border border-gray-300 rounded outline-none focus:border-[#00997a]" 
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message as string}</p>}
            </div>
            
            <button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#00997a] text-white px-8 py-2.5 rounded text-sm font-medium hover:bg-[#007a61] mt-4 disabled:opacity-50"
            >
                {isLoading ? "Menyimpan..." : "Konfirmasi"}
            </button>
        </form>
    );
}
