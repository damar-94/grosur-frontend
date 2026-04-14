"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Category, categoryService } from "@/services/categoryService";

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").max(50, "Category name is too long"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSuccess: () => void;
}

export function CategoryFormModal({
  isOpen,
  onOpenChange,
  category,
  onSuccess,
}: CategoryFormModalProps) {
  const isEditing = !!category;
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      if (category) {
        form.reset({ name: category.name });
      } else {
        form.reset({ name: "" });
      }
    }
  }, [isOpen, category, form]);

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      setIsLoading(true);
      if (isEditing && category) {
        await categoryService.updateCategory(category.id, values);
        toast.success("Category updated successfully");
      } else {
        await categoryService.createCategory(values);
        toast.success("Category created successfully");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} category`;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Category" : "Add New Category"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Beverages, Snacks..." disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
