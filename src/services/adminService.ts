import { api } from "@/lib/axiosInstance";

export interface PaginationData {
  page: number;
  totalPage: number;
  totalRows: number;
}

export interface StoreAdminResponse {
  data: any[];
  pagination: PaginationData;
}

export const adminService = {
  // Store Admins
  getStoreAdmins: async (page = 1, limit = 10) => {
    const response = await api.get(`/admin/store-admins?page=${page}&limit=${limit}`);
    return response.data;
  },

  createStoreAdmin: async (data: any) => {
    const response = await api.post("/admin/store-admins", data);
    return response.data;
  },

  updateStoreAdmin: async (id: string, data: any) => {
    const response = await api.patch(`/admin/store-admins/${id}`, data);
    return response.data;
  },

  deleteStoreAdmin: async (id: string) => {
    const response = await api.delete(`/admin/store-admins/${id}`);
    return response.data;
  },

  // Stores for dropdown
  getStores: async () => {
    const response = await api.get("/admin/store-admins/list/all");
    return response.data;
  },
};
