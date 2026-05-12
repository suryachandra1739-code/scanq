export interface Product {
  id: string;
  short_code?: string;
  name: string;
  category: string;
  gst_number: string;
  batch_number: string;
  serial_number: string;
  manufacture_date: string;
  expiry_date: string;
  description: string;
  manual_url: string | null;
  additional_info: Record<string, string>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  name: string;
  category: string;
  gst_number: string;
  batch_number: string;
  serial_number: string;
  manufacture_date: string;
  expiry_date: string;
  description: string;
  additional_info: Record<string, string>;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

export interface DashboardStats {
  totalProducts: number;
  recentlyAdded: number;
  expiringSoon: number;
  categories: number;
}
