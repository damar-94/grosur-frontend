"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/lib/axiosInstance";
import Link from "next/link";

interface VerifyFormValues {
    password: string;
    confirmPassword: string;
}

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token") || "";
    const email = searchParams.get("email") || "";

    const [status, setStatus] = useState<"form" | "success" | "error">("form");
    const [serverError, setServerError] = useState("");

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<VerifyFormValues>();
    const password = watch("password");

    const onSubmit = async (data: VerifyFormValues) => {
        try {
            setServerError("");
            await api.post("/auth/verify", {
                email,
                token,
                password: data.password,
            });
            setStatus("success");
            setTimeout(() => router.push("/login"), 3000);
        } catch (error: any) {
            setServerError(error.response?.data?.message || "Verifikasi gagal. Link mungkin sudah kadaluarsa.");
            setStatus("error");
        }
    };

    if (!token || !email) {
        return (
            <div className="text-center p-8">
                <p className="text-red-500 font-medium">Link verifikasi tidak valid.</p>
                <Link href="/register" className="text-[#00997a] underline mt-4 inline-block">Daftar ulang</Link>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="w-full max-w-md p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-[#00997a]/10 text-[#00997a] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Terverifikasi! 🎉</h1>
                <p className="text-gray-500">Akun Anda sudah aktif. Mengalihkan ke halaman masuk...</p>
                {/* Referral bonus notice */}
                <p className="mt-4 text-sm text-[#00997a] font-medium bg-[#f0fdf9] rounded-lg p-3 border border-[#d1fae5]">
                    Jika Anda mendaftar dengan kode referral, voucher belanja Rp 25.000 sudah dikirim ke akun Anda!
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm border border-gray-100 space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Buat Password Akun</h1>
                <p className="text-sm text-gray-500 mt-1">Anda mendaftar dengan: <span className="font-medium text-gray-700">{email}</span></p>
            </div>

            {serverError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md font-medium text-center border border-red-100">
                    {serverError}
                    {status === "error" && (
                        <div className="mt-2">
                            <Link href="/register" className="text-[#00997a] underline text-xs">Kirim ulang email verifikasi</Link>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password Baru</label>
                    <input
                        type="password"
                        {...register("password", {
                            required: "Password wajib diisi",
                            minLength: { value: 6, message: "Minimal 6 karakter" },
                        })}
                        placeholder="Minimal 6 karakter"
                        className="w-full p-2.5 mt-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#00997a] focus:border-transparent outline-none transition-all"
                    />
                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Konfirmasi Password</label>
                    <input
                        type="password"
                        {...register("confirmPassword", {
                            required: "Konfirmasi password wajib diisi",
                            validate: (val) => val === password || "Password tidak cocok",
                        })}
                        placeholder="Ulangi password"
                        className="w-full p-2.5 mt-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#00997a] focus:border-transparent outline-none transition-all"
                    />
                    {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 text-white font-bold bg-[#00997a] rounded-md hover:bg-[#007a61] transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? "Memverifikasi..." : "Aktifkan Akun"}
                </button>
            </form>

            <p className="text-sm text-center text-gray-500">
                Sudah punya akun? <Link href="/login" className="text-[#00997a] font-bold hover:underline">Masuk di sini</Link>
            </p>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <main className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
            <Suspense fallback={<div className="text-gray-400 text-sm">Memuat...</div>}>
                <VerifyContent />
            </Suspense>
        </main>
    );
}
