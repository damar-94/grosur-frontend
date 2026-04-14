import { api } from "@/lib/axiosInstance";

export interface Voucher {
  id: string;
  code: string;
  type: "PRODUCT" | "TOTAL" | "SHIPPING";
  value: number;
  maxDiscount?: number;
  minSpend?: number;
  qty: number;
  expiryDate: string;
  isUsed: boolean;
}

export interface ClaimVoucherRequest {
  id: string;
  type: string;
  value: number;
  minSpend?: number;
  maxDiscount?: number;
  expiryDays: number;
}

export const voucherService = {
  getUserVouchers: async (): Promise<{ success: boolean; data: Voucher[] }> => {
    const response = await api.get("/vouchers");
    return response.data;
  },

  claimVoucher: async (payload: ClaimVoucherRequest): Promise<{ success: boolean; data: Voucher }> => {
    const response = await api.post("/vouchers/claim", payload);
    return response.data;
  },
};
