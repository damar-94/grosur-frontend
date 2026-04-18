import { api } from "@/lib/axiosInstance";

export interface StockUpdateRequest {
  productId: string;
  storeId: string;
  change: number;
  reason: string;
}

export interface StockTransferRequest {
  productId: string;
  fromStoreId: string;
  toStoreId: string;
  quantity: number;
  reason: string;
}

export interface StockUpdateResponse {
  success: boolean;
  message: string;
  data: unknown;
}

export interface StockJournal {
  id: string;
  stockId: string;
  type: "IN" | "OUT";
  change: number;
  oldQty: number;
  newQty: number;
  reason: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface StockJournalResponse {
  success: boolean;
  journals: StockJournal[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPage: number;
    hasMore: boolean;
  };
}

export const stockService = {
  updateStock: async (payload: StockUpdateRequest): Promise<StockUpdateResponse> => {
    const response = await api.patch("/stocks/update", payload);
    return response.data;
  },

  transferStock: async (payload: StockTransferRequest): Promise<StockUpdateResponse> => {
    const response = await api.post("/stocks/transfer", payload);
    return response.data;
  },

  getStockJournals: async (params: {
    productId?: string;
    storeId?: string;
    limit?: number;
    page?: number;
  }): Promise<StockJournalResponse> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, String(value));
    });
    const response = await api.get(`/stocks/journals?${query.toString()}`);
    return response.data;
  },
};
