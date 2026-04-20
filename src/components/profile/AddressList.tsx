"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axiosInstance";
import AddressModal from "./AddressModal"; // We will build this next!

interface Address {
    id: string;
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
    postalCode: string;
    isDefault: boolean;
}

export default function AddressList() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const fetchAddresses = async () => {
        try {
            setIsLoading(true);
            const res = await api.get("/addresses", { withCredentials: true });
            setAddresses(res.data.data);
        } catch (error) {
            console.error("Failed to fetch addresses", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus alamat ini?")) return;
        try {
            await api.delete(`/addresses/${id}`, { withCredentials: true });
            fetchAddresses(); // Refresh the list
        } catch (error) {
            alert("Gagal menghapus alamat");
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            await api.patch(`/addresses/${id}/default`, {}, { withCredentials: true });
            fetchAddresses(); // Refresh the list so the new default moves to the top
        } catch (error) {
            alert("Gagal mengubah alamat utama");
        }
    };

    const openAddModal = () => {
        setEditingAddress(null);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto mt-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#1a1a1a]">Daftar Alamat</h2>
                <button
                    onClick={openAddModal}
                    className="px-4 py-2 bg-[#00997a] text-white text-sm font-bold rounded-md hover:bg-[#007a61] transition"
                >
                    + Tambah Alamat
                </button>
            </div>

            {isLoading ? (
                <p className="text-center text-gray-500 py-4">Memuat alamat...</p>
            ) : addresses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 text-sm">Belum ada alamat yang disimpan.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            className={`p-4 border rounded-lg ${address.isDefault ? "border-[#00997a] bg-[#59cfb7]/5" : "border-gray-200"}`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-[#1a1a1a]">{address.name}</h3>
                                        {address.isDefault && (
                                            <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-[#00997a] rounded-full">
                                                Utama
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">{address.phone}</p>
                                    <p className="text-sm text-gray-500 mt-1">{address.detail}</p>
                                    <p className="text-sm text-gray-500">
                                        {address.district}, {address.city}, {address.province} {address.postalCode}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                                {/* Only show "Jadikan Utama" if it's not already the default */}
                                {!address.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(address.id)}
                                        className="text-sm font-bold text-[#00997a] hover:underline"
                                    >
                                        Jadikan Utama
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(address.id)}
                                    className="text-sm font-bold text-red-500 hover:underline"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* We will pass the fetchAddresses function so the modal can refresh the list after saving */}
            {isModalOpen && (
                <AddressModal
                    closeModal={() => setIsModalOpen(false)}
                    refreshData={fetchAddresses}
                    addressToEdit={editingAddress}
                />
            )}
        </div>
    );
}