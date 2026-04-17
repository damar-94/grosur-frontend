"use client";

import { useAppStore } from "@/stores/useAppStore";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
// 💡 Swapped Menu/X for ChevronDown to make an accordion-style toggle
import { User, Receipt, Bell, Ticket, Edit2, ChevronDown } from "lucide-react";
import ReferralCard from "@/components/profile/ReferralCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AddressList from "@/components/profile/AddressList";
import ChangeEmailForm from "@/components/profile/ChangeEmailForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import { api } from "@/lib/axiosInstance";
import Image from "next/image";

interface ProfileFormValues {
    name: string;
    phone: string;
    referralCode: string;
}

export default function ProfilePage() {
    const user = useAppStore((state) => state.user);
    const setUser = useAppStore((state) => state.setUser);
    const [isLoading, setIsLoading] = useState(false);

    // File handling
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [activeTab, setActiveTab] = useState("profil");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Initialize preview
    useEffect(() => {
        if (user && !preview && !file) {
            setPreview(user.profilePicture || null);
        }
    }, [user, preview, file]);

    const { register, handleSubmit, reset } = useForm<ProfileFormValues>({
        defaultValues: {
            name: user?.name || "",
            phone: user?.phone || "",
        },
    });

    // 💡 Keeps form synchronized when user is finally populated or updated
    useEffect(() => {
        if (user) {
            reset({
                name: user.name || "",
                phone: user.phone || "",
                referralCode: user.referralCode || "",
            });
        }
    }, [user, reset]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 1024 * 1024) {
                alert("Ukuran file maksimal 1 MB");
                return;
            }
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const onSubmit = async (data: ProfileFormValues) => {
        setIsLoading(true);
        setMessage(null);

        const formData = new FormData();
        if (data.name) formData.append("name", data.name);
        if (data.phone) formData.append("phone", data.phone);
        if (data.referralCode) formData.append("referralCode", data.referralCode);
        if (file) formData.append("profilePhoto", file);

        try {
            const res = await api.patch("/users/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });

            setUser(res.data.data);
            setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
        } catch (error: any) {
            setMessage({ type: "error", text: error.response?.data?.message || "Terjadi kesalahan saat menyimpan profil." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUbahEmail = () => {
        handleTabChange("email");
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
    };

    if (!user) return <div className="p-8 text-center text-gray-500">Memuat profil...</div>;

    const displayPhotoUrl = preview || user.profilePicture || "/default-avatar.png";

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-[#f5f5f5] py-8">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 px-4">

                    {/* ========================================== */}
                    {/* SIDEBAR                                    */}
                    {/* ========================================== */}
                    <aside className="w-full md:w-[250px] flex-shrink-0 bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none">

                        {/* 💡 Profile Header - Now acts as the mobile dropdown trigger */}
                        <div
                            className="flex items-center justify-between mb-0 md:mb-8 md:pl-2 cursor-pointer md:cursor-default select-none"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-full border border-gray-300 overflow-hidden bg-gray-200">
                                    <Image src={displayPhotoUrl} alt="avatar" fill className="object-cover" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm truncate w-32">{user.name}</p>
                                    <div className="text-gray-500 flex items-center gap-1 text-xs mt-0.5 md:hover:text-[#00997a]">
                                        <Edit2 size={10} /> Ubah Profil
                                    </div>
                                </div>
                            </div>

                            {/* 💡 Mobile Arrow Indicator */}
                            <ChevronDown
                                size={20}
                                className={`md:hidden text-gray-500 transition-transform duration-300 ${isMobileMenuOpen ? "rotate-180" : ""}`}
                            />
                        </div>

                        {/* Navigation Menu */}
                        <nav className={`${isMobileMenuOpen ? "block" : "hidden"} md:block space-y-4 pt-6 md:pt-0 border-t md:border-none border-gray-100 mt-4 md:mt-0`}>
                            <div>
                                <div className="flex items-center gap-2 text-[#00997a] font-medium mb-2">
                                    <User size={20} /> Akun Saya
                                </div>
                                <ul className="pl-7 space-y-3 text-sm text-gray-600">
                                    <li
                                        onClick={(e) => { e.stopPropagation(); handleTabChange("profil"); }}
                                        className={`cursor-pointer transition-colors ${activeTab === "profil" ? "text-[#00997a] font-bold" : "hover:text-[#00997a]"}`}
                                    >
                                        Profil
                                    </li>
                                    <li
                                        onClick={(e) => { e.stopPropagation(); handleTabChange("alamat"); }}
                                        className={`cursor-pointer transition-colors ${activeTab === "alamat" ? "text-[#00997a] font-bold" : "hover:text-[#00997a]"}`}
                                    >
                                        Alamat
                                    </li>
                                    <li
                                        onClick={(e) => { e.stopPropagation(); handleTabChange("password"); }}
                                        className={`cursor-pointer transition-colors ${activeTab === "password" ? "text-[#00997a] font-bold" : "hover:text-[#00997a]"}`}
                                    >
                                        Ubah Password
                                    </li>
                                    <li
                                        onClick={(e) => { e.stopPropagation(); handleTabChange("email"); }}
                                        className={`cursor-pointer transition-colors ${activeTab === "email" ? "text-[#00997a] font-bold" : "hover:text-[#00997a]"}`}
                                    >
                                        Ubah Email
                                    </li>
                                </ul>
                            </div>

                            <div className="flex items-center gap-2 text-gray-700 hover:text-[#00997a] font-medium cursor-pointer transition-colors">
                                <Receipt size={20} className="text-blue-500" /> Pesanan Saya
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 hover:text-[#00997a] font-medium cursor-pointer transition-colors">
                                <Bell size={20} className="text-orange-500" /> Notifikasi
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 hover:text-[#00997a] font-medium cursor-pointer transition-colors">
                                <Ticket size={20} className="text-red-500" /> Voucher Saya
                            </div>
                        </nav>
                    </aside>

                    {/* ========================================== */}
                    {/* MAIN CONTENT AREA                          */}
                    {/* ========================================== */}
                    <main className="flex-grow space-y-6">

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 min-h-[500px]">

                            {/* --- TAB 1: PROFIL --- */}
                            {activeTab === "profil" && (
                                <>
                                    <div className="border-b border-gray-100 pb-4 mb-8">
                                        <h1 className="text-xl font-medium text-gray-800">Profil Saya</h1>
                                        <p className="text-sm text-gray-500 mt-1">Kelola informasi profil Anda untuk mengontrol, melindungi dan mengamankan akun</p>
                                    </div>

                                    <div className="flex flex-col-reverse md:flex-row gap-10">
                                        <div className="flex-grow md:border-r border-gray-100 md:pr-10">
                                            {message && (
                                                <div className={`p-3 mb-4 text-sm rounded ${message.type === "success" ? "bg-[#59cfb7]/20 text-[#00997a]" : "bg-red-50 text-red-600"}`}>
                                                    {message.text}
                                                </div>
                                            )}
                                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                                                <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] items-center gap-4">
                                                    <label className="text-right text-sm text-gray-500">Nama</label>
                                                    <input
                                                        {...register("name")}
                                                        className="w-full p-2 border border-gray-300 rounded focus:border-[#00997a] focus:ring-1 focus:ring-[#00997a] outline-none transition-colors text-sm"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] items-center gap-4">
                                                    <label className="text-right text-sm text-gray-500">Email</label>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-gray-800">
                                                            {user.email ? user.email.replace(/(.{2})(.*)(?=@)/, "$1********") : ""}
                                                        </span>
                                                        <button type="button" onClick={handleUbahEmail} className="text-[#00997a] underline ml-2">Ubah</button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] items-center gap-4">
                                                    <label className="text-right text-sm text-gray-500">Nomor Telepon</label>
                                                    <input
                                                        {...register("phone")}
                                                        placeholder="Belum diatur"
                                                        className="w-full p-2 border border-gray-300 rounded focus:border-[#00997a] focus:ring-1 focus:ring-[#00997a] outline-none transition-colors text-sm"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] items-center gap-4">
                                                    <label className="text-right text-sm text-gray-500">Kode Referral</label>
                                                    <div>
                                                        <input
                                                            {...register("referralCode")}
                                                            placeholder="Kode Referral Custom"
                                                            className="w-full p-2 border border-gray-300 rounded focus:border-[#00997a] focus:ring-1 focus:ring-[#00997a] outline-none transition-colors text-sm uppercase"
                                                        />
                                                        <p className="text-[10px] text-gray-400 mt-1">Hanya ubah jika Anda ingin kustomisasi kode.</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] gap-4 pt-4">
                                                    <div></div>
                                                    <button
                                                        type="submit"
                                                        disabled={isLoading}
                                                        className="bg-[#00997a] text-white px-8 py-2.5 rounded text-sm font-medium hover:bg-[#007a61] transition-colors w-fit disabled:opacity-70"
                                                    >
                                                        {isLoading ? "Menyimpan..." : "Simpan"}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>

                                        <div className="w-full md:w-64 flex flex-col items-center pt-4">
                                            <div className="relative w-24 h-24 rounded-full border border-gray-200 overflow-hidden bg-gray-100 mb-5">
                                                <Image src={displayPhotoUrl} alt="Profile" fill className="object-cover" />
                                            </div>
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                ref={fileInputRef} 
                                                accept="image/png, image/jpeg, image/jpg" 
                                                onChange={handleFileChange} 
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()} 
                                                className="border border-gray-300 text-gray-700 bg-white px-4 py-2 rounded text-sm hover:bg-gray-50 transition-colors"
                                            >
                                                Pilih Gambar
                                            </button>
                                            <div className="text-center mt-4 text-gray-400 space-y-1">
                                                <p className="text-xs">Ukuran gambar: maks. 1 MB</p>
                                                <p className="text-xs">Format gambar: .JPEG, .PNG</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* --- TAB 2: ALAMAT --- */}
                            {activeTab === "alamat" && (
                                <div>
                                    <AddressList />
                                </div>
                            )}

                            {/* --- TAB 3: UBAH PASSWORD --- */}
                            {activeTab === "password" && (
                                <div>
                                    <div className="border-b border-gray-100 pb-4 mb-8">
                                        <h1 className="text-xl font-medium text-gray-800">Ubah Password</h1>
                                        <p className="text-sm text-gray-500 mt-1">Untuk keamanan akun Anda, mohon tidak menyebarkan password Anda kepada orang lain.</p>
                                    </div>

                                    <div className="max-w-md">
                                        <ChangePasswordForm />
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: UBAH EMAIL --- */}
                            {activeTab === "email" && (
                                <div>
                                    <div className="border-b border-gray-100 pb-4 mb-8">
                                        <h1 className="text-xl font-medium text-gray-800">Ubah Email</h1>
                                        <p className="text-sm text-gray-500 mt-1">Kelola atau perbarui email akun Anda</p>
                                    </div>
                                    <ChangeEmailForm />
                                </div>
                            )}

                        </div>

                        <ReferralCard />
                    </main>
                </div>
            </div>

            <Footer />
        </>
    );
}