"use client";

import { useEffect, useState } from "react";
import { categoryService, Category } from "@/services/categoryService";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { 
  FiShoppingBag, 
  FiBox, 
  FiTruck, 
  FiActivity, 
  FiZap,
  FiCoffee,
  FiFeather,
  FiGrid
} from "react-icons/fi";

// Mock icons if slug matches standard categories
const categoryIcons: Record<string, any> = {
  "sayur": "🥬",
  "buah": "🍎",
  "daging": "🥩",
  "sembako": "🍚",
  "minuman": "🥤",
  "snack": "🍿",
  "susu": "🥛",
  "telur": "🥚",
  "bumbu": "🧂",
  "kebersihan": "🧹",
};

const defaultIcons = [<FiShoppingBag key="1" />, <FiBox key="2" />, <FiTruck key="3" />, <FiActivity key="4" />];

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        if (response.success) {
          setCategories(response.data.slice(0, 8)); // Limit to top 8
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 px-4 py-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3 px-4 py-4 md:px-0">
      {categories.map((cat, index) => (
        <Link 
          href={`/products?category=${cat.id}`} 
          key={cat.id} 
          className="flex flex-col items-center space-y-2 group transition-all"
        >
          <div className="flex items-center justify-center w-14 h-14 bg-[#59cfb7]/10 text-primary rounded-2xl text-2xl group-hover:bg-[#59cfb7]/20 group-hover:-translate-y-1 transition-all duration-300 shadow-sm border border-primary/5">
            {categoryIcons[cat.slug.toLowerCase()] || <FiGrid size={24} />}
          </div>
          <span className="text-[11px] font-bold text-center text-[#1a1a1a] line-clamp-1 group-hover:text-primary transition-colors">
            {cat.name}
          </span>
        </Link>
      ))}
    </div>
  );
}