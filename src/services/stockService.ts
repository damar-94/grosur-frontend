import { api } from "@/lib/axiosInstance";

export interface StockUpdateRequest {
  productId: string;
  storeId: string;
  change: number;
  reason: string;
}

export interface StockUpdateResponse {
  success: boolean;
  message: string;
  data: unknown;
}

export const stockService = {
  updateStock: async (payload: StockUpdateRequest): Promise<StockUpdateResponse> => {
    const response = await api.patch("/stocks/update", payload);
    return response.data;
  },
};
