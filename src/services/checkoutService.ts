import { api } from "@/lib/axiosInstance";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postalCode?: string;
  detail: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}

export interface CheckoutItem {
  cartItemId: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  storeName: string;
}

export interface CheckoutPayload {
  addressId: string;
  items: {
    cartItemId: string;
    productId: string;
    quantity: number;
    price: number;
  }[];
  paymentMethod: "MANUAL_TRANSFER" | "PAYMENT_GATEWAY";
  notes?: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  subtotal: number;
  product: {
    id: string;
    name: string;
    images: { url: string }[];
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: "WAITING_PAYMENT" | "WAITING_CONFIRMATION" | "PROCESSED" | "SENT" | "CONFIRMED" | "CANCELLED";
  totalAmount: number;
  shippingCost: number;
  paymentMethod: "MANUAL_TRANSFER" | "PAYMENT_GATEWAY";
  paymentStatus: "PENDING" | "PAID" | "REJECTED";
  paymentProof?: string;
  paymentGatewayUrl?: string;
  notes?: string;
  address: Address;
  warehouse?: {
    id: string;
    name: string;
    address: string;
  };
  items?: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/** Fetch all addresses of the logged-in user */
export async function fetchAddresses(): Promise<Address[]> {
  const res = await api.get("/addresses");
  return res.data?.data || [];
}

/** Create a new order (checkout) */
export async function createOrder(payload: CheckoutPayload): Promise<Order> {
  const res = await api.post("/orders", payload);
  return res.data.data;
}

/** Fetch all orders of the logged-in user */
export async function fetchOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  date?: string;
}): Promise<{ orders: Order[]; total: number; page: number; totalPages: number }> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.date) query.set("date", params.date);
  const res = await api.get(`/orders?${query.toString()}`);
  // Backend returns { data: Order[], pagination: {...} }
  const orders = res.data.data || [];
  const pagination = res.data.pagination || {};
  return {
    orders,
    total: pagination.totalRows || 0,
    page: pagination.page || 1,
    totalPages: pagination.totalPage || 1,
  };
}

/** Fetch single order detail */
export async function fetchOrder(orderId: string): Promise<Order> {
  const res = await api.get(`/orders/${orderId}`);
  return res.data.data;
}

/** Upload payment proof for an order */
export async function uploadPaymentProof(
  orderId: string,
  file: File
): Promise<Order> {
  const formData = new FormData();
  formData.append("paymentProof", file);
  const res = await api.post(`/orders/${orderId}/payment-proof`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

/** Cancel an order (only if still PENDING) */
export async function cancelOrder(orderId: string): Promise<Order> {
  const res = await api.post(`/orders/${orderId}/cancel`);
  return res.data.data;
}

/** Automatically cancel expired orders */
export async function cancelExpiredOrders(): Promise<{ count: number }> {
  const res = await api.post(`/orders/cancel-expired`);
  return res.data.data;
}
