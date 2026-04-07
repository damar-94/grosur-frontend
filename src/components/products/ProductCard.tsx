import React from "react";
import Image from "next/image";
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

  return (
    <Card className="h-full flex flex-col overflow-hidden group hover:border-primary/50 transition-colors">
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
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
            <Badge variant="destructive" className="px-3 py-1 text-sm font-semibold uppercase tracking-wider">
              Out of Stock
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-4 flex-1 flex flex-col gap-1.5">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {product.category}
        </div>
        <h3 className="font-semibold text-lg line-clamp-2 leading-tight min-h-10">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-auto">
          {product.description || "No description available"}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        <div className="flex items-center justify-between w-full">
          <div className="text-xl font-bold text-primary">
            Rp {price.toLocaleString("id-ID")}
          </div>
          <div className="text-xs text-muted-foreground">
            Stock: {product.inventory.quantity}
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
