import { api } from "@/lib/axiosInstance";

export interface PaginationData {
  page: number;
  totalPage: number;
  totalRows: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "STORE_ADMIN" | "SUPER_ADMIN";
  isVerified: boolean;
  createdAt: string;
  managedStore?: { name: string };
}

export interface UserListParams {
  page?: string;
  search?: string;
  role?: string;
  isVerified?: string;
  startDate?: string;
  endDate?: string;
}

export interface UsersResponse {
  data: User[];
  pagination: PaginationData;
}

export interface StoreAdminResponse {
  data: User[];
  pagination: PaginationData;
}

export const adminService = {
  // Store Admins
  getStoreAdmins: async (page = 1, limit = 10): Promise<StoreAdminResponse> => {
    const response = await api.get(`/admin/store-admins?page=${page}&limit=${limit}`);
    return response.data;
  },

  createStoreAdmin: async (data: Partial<User>) => {
    const response = await api.post("/admin/store-admins", data);
    return response.data;
  },

  updateStoreAdmin: async (id: string, data: Partial<User>) => {
    const response = await api.patch(`/admin/store-admins/${id}`, data);
    return response.data;
  },

  deleteStoreAdmin: async (id: string) => {
    const response = await api.delete(`/admin/store-admins/${id}`);
    return response.data;
  },

  // All Users (Super Admin only)
  getUsers: async (params: UserListParams): Promise<UsersResponse> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        query.append(key, value);
      }
    });

    const response = await api.get(`/admin/users?${query.toString()}`);
    return response.data;
  },

  createUser: async (data: any) => {
    const response = await api.post("/admin/users", data);
    return response.data;
  },

  updateUser: async (id: string, data: any) => {
    const response = await api.patch(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Stores for dropdown
  getStores: async () => {
    const response = await api.get("/admin/store-admins/list/all");
    return response.data;
  },

  // Order Management
  getAdminOrders: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    storeId?: string;
    search?: string;
    date?: string;
  }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.append(key, String(value));
    });
    const response = await api.get(`/admin/orders?${query.toString()}`);
    return response.data;
  },

  getOrderDetail: async (orderId: string) => {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data;
  },

  confirmPayment: async (orderId: string, action: "accept" | "reject") => {
    const response = await api.patch(`/admin/orders/${orderId}/payment`, { action });
    return response.data;
  },

  sendOrder: async (orderId: string) => {
    const response = await api.patch(`/admin/orders/${orderId}/send`);
    return response.data;
  },
  cancelOrder: async (orderId: string, cancelReason?: string) => {
    const response = await api.patch(`/admin/orders/${orderId}/cancel`, { cancelReason });
    return response.data;
  },
};
