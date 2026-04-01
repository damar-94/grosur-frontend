"use client";

import Header from "@/components/Header";
import ProfileForm from "@/components/profile/ProfileForm";
import { useAppStore } from "@/stores/useAppStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
    const user = useAppStore((state) => state.user);
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    // Prevent hydration mismatch and protect the route
    useEffect(() => {
        setIsClient(true);
        // If the component has mounted and there is no user, kick them back to login
        if (!user) {
            router.push("/login");
        }
    }, [user, router]);

    // Don't render the form until we are sure we are on the client and have a user
    if (!isClient || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500 font-medium">Memuat profil...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            <div className="max-w-7xl mx-auto bg-white min-h-screen shadow-sm relative">
                <Header />

                {/* Page Content */}
                <div className="p-4 md:p-8">
                    <div className="mb-6 max-w-md mx-auto">
                        <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Akun Saya</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Kelola informasi profil dan alamat Anda di sini.
                        </p>
                    </div>


                    <ProfileForm />
                </div>
            </div>
        </main>
    );
}