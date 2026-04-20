import { api } from "@/lib/axiosInstance";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryListResponse {
  success: boolean;
  data: Category[];
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category;
}

export const categoryService = {
  getCategories: async (): Promise<CategoryListResponse> => {
    // Note: The public route is technically at /products/categories, but assuming /categories exists for Admin
    // Or we stick to /categories which was defined in category.routes.ts and bounded to /api/categories
    const response = await api.get("/categories");
    return response.data;
  },

  createCategory: async (payload: { name: string }): Promise<CategoryResponse> => {
    const response = await api.post("/categories", payload);
    return response.data;
  },

  updateCategory: async (categoryId: string, payload: { name: string }): Promise<CategoryResponse> => {
    const response = await api.put(`/categories/${categoryId}`, payload);
    return response.data;
  },

  deleteCategory: async (categoryId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  },
};
