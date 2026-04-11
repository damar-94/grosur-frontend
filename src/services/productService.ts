import { api } from "@/lib/axiosInstance";

// ─── Public interfaces ────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  description: string | null;
  category: string;
  categoryId: string;
  image: string | null;
  inventory: {
    quantity: number;
    storeId: string;
  };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPage: number;
  hasMore: boolean;
}

export interface ProductListResponse {
  success: boolean;
  items: Product[];
  meta: Pagination;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryListResponse {
  success: boolean;
  data: Category[];
}

// ─── Admin interfaces ─────────────────────────────────────────────────────────

export interface ProductImage {
  id: string;
  url: string;
  productId: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string | null;
  isActive: boolean;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  images: ProductImage[];
  stocks: { productId: string; storeId: string; quantity: number }[];
}

export interface AdminProductDetailResponse {
  success: boolean;
  data: AdminProduct;
}

export interface CreateProductPayload {
  name: string;
  price: number;
  categoryId: string;
  storeId: string;
  description?: string;
}

export interface UpdateProductPayload {
  name?: string;
  price?: number;
  categoryId?: string;
  description?: string;
  isActive?: boolean;
  storeId: string; // required by backend PUT handler
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const productService = {
  // ── Public ──────────────────────────────────────────────────────────────────

  getProducts: async (params: {
    storeId: string;
    search?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  }): Promise<ProductListResponse> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query.append(key, String(value));
      }
    });
    const response = await api.get(`/products?${query.toString()}`);
    return response.data;
  },

  getCategories: async (): Promise<CategoryListResponse> => {
    const response = await api.get("/products/categories");
    return response.data;
  },

  getStores: async (): Promise<{
    success: boolean;
    data: { id: string; name: string; city: string; district: string }[];
  }> => {
    const response = await api.get("/stores");
    return response.data;
  },

  // ── Admin ────────────────────────────────────────────────────────────────────

  /** Fetch a single product by ID (used by Edit page) */
  getProductById: async (productId: string): Promise<AdminProductDetailResponse> => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  },

  /** Create a new product (returns the created product) */
  adminCreateProduct: async (
    data: CreateProductPayload,
  ): Promise<{ success: boolean; data: AdminProduct }> => {
    const response = await api.post("/products", data);
    return response.data;
  },

  /** Update an existing product */
  adminUpdateProduct: async (
    productId: string,
    data: UpdateProductPayload,
  ): Promise<{ success: boolean; data: AdminProduct }> => {
    const response = await api.put(`/products/${productId}`, data);
    return response.data;
  },

  /** Delete a product — storeId passed as query param */
  adminDeleteProduct: async (productId: string, storeId: string): Promise<void> => {
    await api.delete(`/products/${productId}?storeId=${storeId}`);
  },

  /**
   * Upload product images to Cloudinary via the backend.
   * Uses multipart/form-data — files are File objects from the browser.
   */
  uploadProductImages: async (
    productId: string,
    storeId: string,
    files: File[],
  ): Promise<{ success: boolean; images: ProductImage[] }> => {
    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("storeId", storeId);
    files.forEach((file) => formData.append("images", file));

    const response = await api.post("/products/upload-images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
