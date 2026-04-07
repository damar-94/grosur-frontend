import { api } from "@/lib/axiosInstance";

export interface Product {
    id: string;
    name: string;
    slug: string;
    price: string | number;
    description: string | null;
    category: string;
    categoryId: string;
    image: string | null;
    images?: { id: string; url: string }[];
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

export const productService = {
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

    getStores: async (): Promise<{ success: boolean; data: { id: string; name: string; city: string; district: string }[] }> => {
        const response = await api.get("/stores");
        return response.data;
    },

    getProductDetail: async (slug: string, storeId: string): Promise<{ success: boolean; data: Product }> => {
        const response = await api.get(`/products/${slug}?storeId=${storeId}`);
        return response.data;
    },
};
