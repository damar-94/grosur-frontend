"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/axiosInstance";
import Link from "next/link";

const forgotSchema = z.object({
    email: z.string().email("Format email tidak valid"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
    const [serverError, setServerError] = useState("");
    const [isSent, setIsSent] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotFormValues>({
        resolver: zodResolver(forgotSchema),
    });

    const onSubmit = async (data: ForgotFormValues) => {
        try {
            setServerError("");
            await api.post("/auth/forgot-password", data);
            setIsSent(true);
        } catch (error: any) {
            setServerError(error.response?.data?.message || "Terjadi kesalahan");
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center p-4 bg-[#f3f5f7]">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-sm border border-[#f3f5f7]">
                <h1 className="text-2xl font-bold text-center text-[#1a1a1a]">Lupa Password?</h1>

                {isSent ? (
                    <div className="text-center space-y-4">
                        <div className="p-4 bg-[#59cfb7]/10 text-[#00997a] rounded-lg font-medium">
                            Link reset password telah dikirim ke email Anda. Silakan cek kotak masuk.
                        </div>
                        <Link href="/login" className="block text-[#00997a] font-bold hover:underline">
                            Kembali ke Login
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-center text-[#8e8e8e]">
                            Masukkan email Anda dan kami akan mengirimkan link untuk mengatur ulang password.
                        </p>

                        {serverError && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md font-medium">
                                {serverError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#1a1a1a]">Email</label>
                                <input
                                    {...register("email")}
                                    className="w-full p-2.5 mt-1 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-[#59cfb7]"
                                    placeholder="nama@email.com"
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-2.5 text-white font-bold bg-[#00997a] rounded-md hover:bg-[#00997a]/90 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? "Mengirim..." : "Kirim Link Reset"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </main>
    );
}