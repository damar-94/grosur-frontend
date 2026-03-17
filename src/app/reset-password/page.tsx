"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/axiosInstance";
import Link from "next/link";

// Simple schema for password reset
const resetSchema = z.object({
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
});

type ResetFormValues = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [serverError, setServerError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    // Get credentials from the URL link sent to email
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetFormValues>({
        resolver: zodResolver(resetSchema),
    });

    const onSubmit = async (data: ResetFormValues) => {
        try {
            setServerError("");
            await api.post("/auth/reset-password", {
                email,
                token,
                password: data.password,
            });
            setIsSuccess(true);
            // Wait 3 seconds then redirect to login
            setTimeout(() => router.push("/login"), 3000);
        } catch (error: any) {
            setServerError(error.response?.data?.message || "Gagal mengatur ulang password");
        }
    };

    if (isSuccess) {
        return (
            <div className="w-full p-8 text-center bg-white rounded-xl shadow-sm border border-[#f3f5f7]">
                <h2 className="text-2xl font-bold text-[#00997a]">Berhasil!</h2>
                <p className="mt-2 text-[#8e8e8e]">Password Anda telah diperbarui. Mengalihkan ke halaman login...</p>
            </div>
        );
    }

    return (
        <div className="w-full p-8 space-y-6 bg-white rounded-xl shadow-sm border border-[#f3f5f7]">
            <h1 className="text-2xl font-bold text-center text-[#1a1a1a]">Atur Ulang Password</h1>

            {serverError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md font-medium">
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[#1a1a1a]">Password Baru</label>
                    <input
                        type="password"
                        {...register("password")}
                        className="w-full p-2.5 mt-1 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-[#59cfb7]"
                        placeholder="••••••••"
                    />
                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#1a1a1a]">Konfirmasi Password</label>
                    <input
                        type="password"
                        {...register("confirmPassword")}
                        className="w-full p-2.5 mt-1 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-[#59cfb7]"
                        placeholder="••••••••"
                    />
                    {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !email || !token}
                    className="w-full py-2.5 text-white font-bold bg-[#00997a] rounded-md hover:bg-[#00997a]/90 transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? "Memproses..." : "Simpan Password Baru"}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <main className="flex min-h-screen items-center justify-center p-4 bg-[#f3f5f7]">
            <div className="w-full max-w-md">
                <Suspense fallback={<div>Memuat...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </main>
    );
}