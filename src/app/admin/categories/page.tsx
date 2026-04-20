"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/stores/useAppStore";
import { Category, categoryService } from "@/services/categoryService";
import { CategoryTable } from "@/components/admin/categories/CategoryTable";
import { CategoryFormModal } from "@/components/admin/categories/CategoryFormModal";
import { CategoryDeleteDialog } from "@/components/admin/categories/CategoryDeleteDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesPage() {
  const { user } = useAppStore();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await categoryService.getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddClick = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">
            Manage product categories and their organization.
          </p>
        </div>
        {isSuperAdmin && (
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <CategoryTable 
          categories={categories} 
          isSuperAdmin={isSuperAdmin}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      {isSuperAdmin && (
        <>
          <CategoryFormModal 
            isOpen={isFormOpen} 
            onOpenChange={setIsFormOpen} 
            category={selectedCategory} 
            onSuccess={fetchCategories}
          />
          <CategoryDeleteDialog
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            category={selectedCategory}
            onSuccess={fetchCategories}
          />
        </>
      )}
    </div>
  );
}
