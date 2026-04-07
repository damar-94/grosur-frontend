"use client";

import React, { useEffect, useState } from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { productService, Category } from "@/services/productService";

interface ProductFilterProps {
  initialSearch?: string;
  initialCategory?: string;
  onFilterChange: (filters: { search?: string; categoryId?: string }) => void;
  onReset: () => void;
}

export function ProductFilter({
  initialSearch,
  initialCategory,
  onFilterChange,
  onReset,
}: ProductFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await productService.getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    onFilterChange({ search });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={initialSearch}
            placeholder="Search products..."
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="flex gap-2">
        {isLoading ? (
          <Skeleton className="h-10 w-[180px]" />
        ) : (
          <Select
            value={initialCategory || "ALL"}
            onValueChange={(value) => onFilterChange({ categoryId: value === "ALL" ? undefined : value })}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4 opacity-70" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button variant="outline" size="icon" onClick={onReset} title="Reset Filters">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
