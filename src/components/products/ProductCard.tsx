import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Ban } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/services/productService";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.inventory.quantity <= 0;
  const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;

  let discountedPrice = price;
  let discountLabel = "";

  if (product.discount) {
    if (product.discount.type === "PERCENT") {
      const val = typeof product.discount.value === "string" ? parseFloat(product.discount.value) : product.discount.value;
      const calculated = (price * val) / 100;
      const actualDiscount = product.discount.maxDiscount 
        ? Math.min(calculated, typeof product.discount.maxDiscount === "string" ? parseFloat(product.discount.maxDiscount) : product.discount.maxDiscount)
        : calculated;
      discountedPrice = price - actualDiscount;
      discountLabel = `${val}%`;
    } else if (product.discount.type === "NOMINAL") {
      const val = typeof product.discount.value === "string" ? parseFloat(product.discount.value) : product.discount.value;
      discountedPrice = Math.max(0, price - val);
      discountLabel = `Rp ${(val/1000).toFixed(0)}rb`;
    } else if (product.discount.type === "B1G1") {
      discountLabel = "B1G1";
    }
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden group hover:border-primary/50 transition-colors">
      <Link href={`/products/${product.slug}`} className="flex-1 flex flex-col">
        <CardHeader className="p-0 relative aspect-square overflow-hidden bg-muted">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          {discountLabel && !isOutOfStock && (
            <div className="absolute top-2 left-2 z-10">
              <Badge className="bg-red-500 hover:bg-red-600 text-white border-none font-bold px-2 py-0.5 rounded-sm text-[10px]">
                {discountLabel} OFF
              </Badge>
            </div>
          )}
          {!isOutOfStock && (
            <div className="absolute bottom-2 left-2 z-10">
              <Badge variant="secondary" className="bg-stone-900/75 backdrop-blur-sm border-none text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-md">
                Stok: {product.inventory.quantity}
              </Badge>
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
              <Badge variant="destructive" className="px-3 py-1 text-sm font-semibold uppercase tracking-wider">
                Out of Stock
              </Badge>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-3 flex-1 flex flex-col gap-0.5 border-t">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-80">
            {product.category}
          </div>
          <h3 className="font-bold text-sm line-clamp-2 leading-snug min-h-10 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-auto leading-relaxed">
            {product.description || "No description available"}
          </p>
        </CardContent>
      </Link>

      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        <div className="flex flex-col w-full">
          {product.discount && product.discount.type !== "B1G1" && (
             <div className="text-xs text-muted-foreground line-through">
                Rp {price.toLocaleString("id-ID")}
             </div>
          )}
          <div className="flex items-center justify-between w-full">
            <div className="text-base font-black text-[#00997a]">
              Rp {discountedPrice.toLocaleString("id-ID")}
            </div>
            <div className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-bold">
              Stok: {product.inventory.quantity}
            </div>
          </div>
        </div>

        <Button 
          className="w-full" 
          disabled={isOutOfStock}
          onClick={() => onAddToCart?.(product)}
        >
          {isOutOfStock ? (
            <><Ban className="mr-2 h-4 w-4" /> Unavailable</>
          ) : (
            <><ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
