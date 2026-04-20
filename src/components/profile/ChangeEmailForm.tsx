"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/lib/axiosInstance";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";

interface EmailFormValues {
    newEmail: string;
}

export default function ChangeEmailForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const router = useRouter();
    const setUser = useAppStore((state) => state.setUser);

    const { register, handleSubmit, formState: { errors } } = useForm<EmailFormValues>();

    const onSubmit = async (data: EmailFormValues) => {
        setIsLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await api.post("/users/change-email", data, {
                withCredentials: true, // Crucial for sending the auth cookie
            });

            setMessage({ type: "success", text: res.data.message });

            // Clear the Zustand state and redirect to login after 3 seconds
            setTimeout(() => {
                setUser(null);
                router.push("/login");
            }, 3000);

        } catch (error: any) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Gagal mengubah email"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 max-w-md mx-auto mt-6">
            <h3 className="text-lg font-bold text-red-600 mb-4">Zona Bahaya: Ubah Email</h3>

            <p className="text-sm text-gray-500 mb-4">
                Mengubah email akan mengeluarkan Anda dari sesi saat ini. Anda harus memverifikasi email baru sebelum dapat masuk kembali.
            </p>

            {message.text && (
                <div className={`p-3 mb-4 text-sm rounded-md font-medium ${message.type === "success" ? "bg-[#59cfb7]/20 text-[#00997a]" : "bg-red-50 text-red-600"}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <input
                        {...register("newEmail", {
                            required: "Email baru wajib diisi",
                            pattern: { value: /^\S+@\S+$/i, message: "Format email tidak valid" }
                        })}
                        className="w-full p-2.5 border border-red-200 rounded-md outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Masukkan email baru"
                    />
                    {errors.newEmail && <p className="mt-1 text-xs text-red-500">{errors.newEmail.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isLoading || message.type === "success"}
                    className="w-full py-2.5 text-white font-bold bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                    {isLoading ? "Memproses..." : "Ubah Email Sekarang"}
                </button>
            </form>
        </div>
    );
}