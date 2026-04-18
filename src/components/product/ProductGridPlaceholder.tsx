import { FiPlus } from "react-icons/fi";
import AddToCartButton from "../cart/AddToCartButton";

export default function ProductGridPlaceholder() {
    // Array maintained within component but could be moved out
    const DUMMY_PRODUCTS = [
        {
            id: "b67ff165-9d87-40e7-a366-06398051c4d8", // Beras Premium
            name: "Beras Premium 5kg",
            price: "Rp 75.000",
            originalPrice: "Rp 80.000",
            discount: "6%",
            image: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&w=400&q=80",
            stock: 50
        },
        {
            id: "6039e440-da18-4368-9255-4d81d8a32226", // Susu UHT
            name: "Susu UHT Full Cream 1L",
            price: "Rp 18.500",
            originalPrice: "Rp 20.000",
            discount: "8%",
            image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80",
            stock: 100
        },
        {
            id: "01602c3d-4d9d-47a4-aab2-114472a1efa9", // Telur Ayam
            name: "Telur Ayam Negeri (10 butir)",
            price: "Rp 25.000",
            originalPrice: "",
            discount: "",
            image: "https://images.unsplash.com/photo-1587486913049-53fc88980fdc?auto=format&fit=crop&w=400&q=80",
            stock: 0
        },
        {
            id: "d290f1ee-6c54-4b01-90e6-d701748f0851", // Fake
            name: "Apel Fuji Segar Manis (1 kg)",
            price: "Rp 45.000",
            originalPrice: "Rp 50.000",
            discount: "10%",
            image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?auto=format&fit=crop&w=400&q=80",
            stock: 10
        },
        {
            id: "d290f1ee-6c54-4b01-90e6-d701748f0852", // Fake
            name: "Daging Sapi Slice Premium (500g)",
            price: "Rp 65.000",
            originalPrice: "",
            discount: "",
            image: "https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&w=400&q=80",
            stock: 5
        },
        {
            id: "d290f1ee-6c54-4b01-90e6-d701748f0856", // Fake
            name: "Minyak Goreng Sawit 2L",
            price: "Rp 34.000",
            originalPrice: "",
            discount: "",
            image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
            stock: 0
        },
    ];

    const STORE_ID = "a29a85e0-52d0-4a33-9015-3eb01f76c042";

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
            {DUMMY_PRODUCTS.map((product) => (
                <div
                    key={product.id}
                    className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md"
                >
                    <div className="relative aspect-square w-full bg-muted/10">
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
                        <AddToCartButton 
                           productId={product.id} 
                           storeId={STORE_ID} 
                           stock={product.stock} 
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}