import { FiPlus } from "react-icons/fi";


// Added real image URLs for a polished UI
const DUMMY_PRODUCTS = [
    {
        id: 1,
        name: "Apel Fuji Segar Manis (1 kg)",
        price: "Rp 45.000",
        originalPrice: "Rp 50.000",
        discount: "10%",
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 2,
        name: "Daging Sapi Slice Premium (500g)",
        price: "Rp 65.000",
        originalPrice: "",
        discount: "",
        image: "https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 3,
        name: "Susu UHT Full Cream 1L",
        price: "Rp 18.500",
        originalPrice: "Rp 20.000",
        discount: "8%",
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 4,
        name: "Telur Ayam Negeri (10 butir)",
        price: "Rp 22.000",
        originalPrice: "",
        discount: "",
        image: "https://images.unsplash.com/photo-1587486913049-53fc88980fdc?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 5,
        name: "Beras Mentik Wangi 5kg",
        price: "Rp 75.000",
        originalPrice: "Rp 80.000",
        discount: "6%",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 6,
        name: "Minyak Goreng Sawit 2L",
        price: "Rp 34.000",
        originalPrice: "",
        discount: "",
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80"
    },
];

interface ProductGridPlaceholderProps {
    storeId?: string | null;
}

export default function ProductGridPlaceholder({ storeId }: ProductGridPlaceholderProps) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
            {DUMMY_PRODUCTS.map((product) => (
                <div
                    key={product.id}
                    className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md"
                >
                    {/* Image Container */}
                    <div className="relative aspect-square w-full bg-muted/10">
                        {/* Using standard img to avoid Next.js domain config errors for dummy data */}
                        <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />

                        {product.discount && (
                            <div className="absolute left-0 top-2 rounded-r-md bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm z-10">
                                {product.discount}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-1 flex-col p-3">
                        <h3 className="line-clamp-2 text-xs font-medium text-foreground md:text-sm">
                            {product.name}
                        </h3>

                        <div className="mt-auto pt-2">
                            {product.originalPrice && (
                                <p className="text-[10px] text-muted-foreground line-through">
                                    {product.originalPrice}
                                </p>
                            )}
                            <p className="text-sm font-bold text-primary md:text-base">
                                {product.price}
                            </p>
                        </div>

                        {/* Temporary Add Button */}
                        <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-md border border-primary py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white">
                            <FiPlus /> Tambah
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}