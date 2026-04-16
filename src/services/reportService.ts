import { api } from "@/lib/axiosInstance";

export interface StockSummaryReport {
  productId: string;
  productName: string;
  storeName: string;
  totalIn: number;
  totalOut: number;
  endStock: number;
  unit: string;
}

export interface StockDetailReport {
  id: string;
  oldQty: number;
  newQty: number;
  change: number;
  type: string;
  reason: string;
  createdAt: string;
  userName: string;
  order?: {
    orderNumber: string;
  };
}

export const reportService = {
  getStockSummary: async (params: { storeId?: string; month: number; year: number }) => {
    const query = new URLSearchParams();
    if (params.storeId) query.append("storeId", params.storeId);
    query.append("month", String(params.month));
    query.append("year", String(params.year));

    const response = await api.get(`/reports/stock/summary?${query.toString()}`);
    return response.data;
  },

  getStockDetail: async (params: { productId: string; storeId: string; month: number; year: number }) => {
    const query = new URLSearchParams();
    query.append("productId", params.productId);
    query.append("storeId", params.storeId);
    query.append("month", String(params.month));
    query.append("year", String(params.year));

    const response = await api.get(`/reports/stock/detail?${query.toString()}`);
    return response.data;
  },
};
