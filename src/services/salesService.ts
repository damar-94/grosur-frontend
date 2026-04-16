import { api } from "@/lib/axiosInstance";

export interface SalesTransaction {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  paymentMethod: string;
  createdAt: string;
  storeId: string;
  storeName?: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

export interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalDiscount: number;
  topProducts: Array<{
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
}

export interface MonthlyTrend {
  month: string;
  revenue: number;
  orders: number;
}

export interface SalesReportFilters {
  month?: number; // 1-12
  year?: number;
  storeId?: string;
  page?: number;
  limit?: number;
  status?: string;
}

export interface SalesReportResponse {
  success: boolean;
  data: {
    transactions: SalesTransaction[];
    summary: SalesSummary;
    trends: MonthlyTrend[];
    byProduct: Array<{
      productId: string;
      productName: string;
      productImage: string | null;
      quantity: number;
      revenue: number;
      orders: number;
    }>;
    byCategory: Array<{
      categoryId: string;
      categoryName: string;
      quantity: number;
      revenue: number;
      products: number;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const salesService = {
  getSalesReport: async (filters: SalesReportFilters): Promise<SalesReportResponse> => {
    const query = new URLSearchParams();
    
    if (filters.month) query.append("month", String(filters.month));
    if (filters.year) query.append("year", String(filters.year));
    if (filters.storeId) query.append("storeId", filters.storeId);
    if (filters.page) query.append("page", String(filters.page));
    if (filters.limit) query.append("limit", String(filters.limit));
    if (filters.status) query.append("status", filters.status);

    const response = await api.get(`/reports/sales?${query.toString()}`);
    return response.data;
  },

  exportSalesCSV: async (filters: SalesReportFilters): Promise<Blob> => {
    const query = new URLSearchParams();
    
    if (filters.month) query.append("month", String(filters.month));
    if (filters.year) query.append("year", String(filters.year));
    if (filters.storeId) query.append("storeId", filters.storeId);
    if (filters.status) query.append("status", filters.status);

    const response = await api.get(`/reports/sales/export?${query.toString()}`, {
      responseType: "blob",
    });
    return response.data;
  },

  getStores: async (): Promise<{ success: boolean; data: Array<{ id: string; name: string }> }> => {
    const response = await api.get("/stores");
    return response.data;
  },
};
