// src/components/ProductCard.tsx
import AddToCartButton from "./cart/AddToCartButton";

export default function ProductCard({ id, name, price, discount, storeId, stock }: any) {
  return (
    <div className="flex flex-col p-3 bg-white border border-[#f3f5f7] rounded-lg shadow-sm">
      <div className="w-full h-24 bg-[#f3f5f7] rounded-md mb-2 flex items-center justify-center text-xs text-[#8e8e8e]">Image</div>
      <h3 className="text-sm font-medium text-[#1a1a1a] line-clamp-2">{name}</h3>
      <div className="mt-auto pt-2">
        {discount && (
          <span className="px-1 py-0.5 text-[10px] text-white bg-[#59cfb7] rounded font-bold">Diskon</span>
        )}
        <p className="text-sm font-bold text-[#00997a] mt-1">Rp {price}</p>
        <AddToCartButton productId={id} storeId={storeId} stock={stock} />
      </div>
    </div>
  );
}