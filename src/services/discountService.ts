import { api } from "@/lib/axiosInstance";
import { Product } from "./productService";

export interface Discount {
  id: string;
  storeId: string;
  productId: string | null;
  product?: Product;
  type: "PERCENT" | "NOMINAL" | "B1G1";
  value: number;
  minSpend: number | null;
  maxDiscount: number | null;
  buyQty: number | null;
  freeQty: number | null;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface CreateDiscountRequest {
  storeId: string;
  productId?: string;
  type: "PERCENT" | "NOMINAL" | "B1G1";
  value: number;
  minSpend?: number;
  maxDiscount?: number;
  buyQty?: number;
  freeQty?: number;
  startDate: string;
  endDate: string;
}

export interface UpdateDiscountRequest extends Partial<CreateDiscountRequest> {
  isActive?: boolean;
}

export interface DiscountResponse {
  success: boolean;
  message: string;
  data: Discount | Discount[];
}

export const discountService = {
  getStoreDiscounts: async (storeId?: string): Promise<{ success: boolean; data: Discount[] }> => {
    const query = storeId ? `?storeId=${storeId}` : "";
    const response = await api.get(`/discounts${query}`);
    return response.data;
  },

  createDiscount: async (payload: CreateDiscountRequest): Promise<DiscountResponse> => {
    const response = await api.post("/discounts", payload);
    return response.data;
  },

  updateDiscount: async (discountId: string, payload: UpdateDiscountRequest): Promise<DiscountResponse> => {
    const response = await api.put(`/discounts/${discountId}`, payload);
    return response.data;
  },

  deleteDiscount: async (discountId: string): Promise<DiscountResponse> => {
    const response = await api.delete(`/discounts/${discountId}`);
    return response.data;
  },
};
