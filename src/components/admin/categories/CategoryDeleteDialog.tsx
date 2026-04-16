"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { categoryService, Category } from "@/services/categoryService";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSuccess: () => void;
}

export function CategoryDeleteDialog({
  isOpen,
  onOpenChange,
  category,
  onSuccess,
}: CategoryDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!category) return;

    try {
      setIsDeleting(true);
      await categoryService.deleteCategory(category.id);
      toast.success("Category deleted successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to delete category. It might be in use by some products.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Category
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the category &quot;<strong>{category?.name}</strong>&quot;? This action cannot be undone. 
            If there are products associated with this category, the deletion might fail.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => handleDelete(e)}
            disabled={isDeleting}
            className={cn(buttonVariants({ variant: "destructive" }))}
          >
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
