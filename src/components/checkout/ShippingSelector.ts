"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axiosInstance";
import { useAppStore } from "@/store/useAppStore";

interface ShippingService {
    service: string;
    cost: number;
    estimatedDays: number | null;
}

export default function ShippingSelector({ onSelect }: { onSelect: (cost: number) => void }) {
    const { currentStore, cart } = useAppStore();
    const [courier, setCourier] = useState("jne");
    const [services, setServices] = useState<ShippingService[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedService, setSelectedService] = useState("");

    // Calculate total weight of the cart (assuming each product has a weight field)
    const totalWeight = cart.reduce((acc, item) => acc + (item.quantity * 1000), 0); // Defaulting to 1kg per item for now

    const fetchCosts = async () => {
        if (!currentStore) return;
        setLoading(true);
        try {
            const res = await api.post("/shipping/cost", {
                storeId: currentStore.id,
                originCityId: currentStore.cityId, // Make sure your Store model also has cityId!
                destinationCityId: "39", // In a real app, pull this from user.defaultAddress.cityId
                weight: totalWeight,
                courier: courier,
            });
            setServices(res.data.data);
        } catch (error) {
            console.error("Gagal mengambil ongkir");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCosts();
    }, [courier]);

    return (
        <div className= "p-6 bg-white rounded-xl shadow-sm border border-gray-100 space-y-4" >
        <h3 className="text-lg font-bold text-[#1a1a1a]" > Metode Pengiriman </h3>

    {/* Courier Tabs */ }
    <div className="flex gap-2" >
    {
        ["jne", "pos", "tiki"].map((c) => (
            <button
            key= { c }
            onClick = {() => setCourier(c)}
    className = {`px-4 py-2 text-sm font-bold rounded-md uppercase transition-colors ${courier === c ? "bg-[#00997a] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`
}
          >
    { c }
    </button>
        ))}
</div>

{/* Service List */ }
<div className="space-y-2" >
    {
        loading?(
          <div className = "py-4 text-center text-sm text-gray-500" > Mencari ongkir terbaik...</ div >
        ) : (
    services.map((s) => (
        <label
              key= { s.service }
              className = {`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${selectedService === s.service ? "border-[#00997a] bg-[#59cfb7]/5" : "border-gray-200"
            }`}
            >
        <div className="flex items-center gap-3" >
    <input
                  type="radio"
                  name = "shippingService"
                  className = "w-4 h-4 text-[#00997a] focus:ring-[#59cfb7]"
                  onChange = {() => {
        setSelectedService(s.service);
onSelect(s.cost);
                  }}
                />
    < div >
    <p className="font-bold text-sm text-[#1a1a1a]" > { s.service } </p>
        < p className = "text-xs text-gray-500" > Estimasi { s.estimatedDays || "?" } Hari </p>
            </div>
            </div>
            < p className = "font-bold text-[#00997a]" > Rp { s.cost.toLocaleString("id-ID") } </p>
                </label>
          ))
        )}
</div>
    </div>
  );
}