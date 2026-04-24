"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Product, ProductFormData, Toast, DashboardStats } from "@/lib/types";
import { generateId } from "@/lib/utils";

// ===== Check if Supabase is configured =====
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url !== "your_supabase_project_url" && url.startsWith("https://");
};

// ===== DEMO SEED DATA =====
const DEMO_PRODUCTS: Product[] = [
  {
    id: "demo-001",
    name: "CropShield Pro 500ml",
    category: "Insecticide",
    gst_number: "29ABCDE1234F1Z5",
    batch_number: "BATCH-2024-0891",
    serial_number: "CSP-500-78234",
    manufacture_date: "2024-09-15",
    expiry_date: "2026-09-15",
    description: "A broad-spectrum systemic insecticide effective against sucking pests in cotton, rice, and vegetable crops. Contains Imidacloprid 17.8% SL.",
    manual_url: null,
    additional_info: { "Active Ingredient": "Imidacloprid 17.8% SL", "Dosage": "0.5ml per liter of water" },
    created_by: "demo-admin",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "demo-002",
    name: "GreenGrow Fertilizer 1L",
    category: "Fertilizer",
    gst_number: "29ABCDE1234F1Z5",
    batch_number: "BATCH-2024-1205",
    serial_number: "GGF-1L-45021",
    manufacture_date: "2024-11-01",
    expiry_date: "2025-11-01",
    description: "Water-soluble NPK fertilizer (19:19:19) for balanced nutrition. Suitable for all crops during vegetative growth stage.",
    manual_url: null,
    additional_info: { "NPK Ratio": "19:19:19", "Application": "Foliar spray" },
    created_by: "demo-admin",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "demo-003",
    name: "WeedClear Herbicide 250ml",
    category: "Herbicide",
    gst_number: "29ABCDE1234F1Z5",
    batch_number: "BATCH-2025-0033",
    serial_number: "WCH-250-90112",
    manufacture_date: "2025-01-10",
    expiry_date: "2027-01-10",
    description: "Selective post-emergence herbicide for broad-leaved weed control in wheat and barley. Contains Metsulfuron-methyl 20% WP.",
    manual_url: null,
    additional_info: { "Active Ingredient": "Metsulfuron-methyl 20% WP", "Target Weeds": "Broad-leaved weeds" },
    created_by: "demo-admin",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

// ===== LOCAL STORAGE HELPERS =====
const STORAGE_KEY = "qr_products";
const AUTH_KEY = "qr_auth";

function getStoredProducts(): Product[] {
  if (typeof window === "undefined") return DEMO_PRODUCTS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_PRODUCTS));
    return DEMO_PRODUCTS;
  }
  return JSON.parse(stored);
}

function saveProducts(products: Product[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ===== CONTEXT TYPES =====
interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  isLoading: boolean;
  userEmail: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isDemoMode: boolean;

  // Products
  products: Product[];
  getProduct: (id: string) => Product | undefined;
  createProduct: (data: ProductFormData, manualFile?: File | null) => Promise<Product>;
  updateProduct: (id: string, data: ProductFormData, manualFile?: File | null) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  refreshProducts: () => void;
  getStats: () => DashboardStats;

  // Toast
  toasts: Toast[];
  showToast: (message: string, type: "success" | "error") => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

// ===== PROVIDER =====
export function AppProvider({ children }: { children: ReactNode }) {
  const isDemoMode = !isSupabaseConfigured();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Check auth on mount
  useEffect(() => {
    if (isDemoMode) {
      const auth = localStorage.getItem(AUTH_KEY);
      if (auth) {
        const parsed = JSON.parse(auth);
        setIsAuthenticated(true);
        setUserEmail(parsed.email);
      }
      setProducts(getStoredProducts());
      setIsLoading(false);
    } else {
      // Supabase auth check
      import("@/lib/supabase/client").then(({ createClient }) => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data: { session } }) => {
          setIsAuthenticated(!!session);
          setUserEmail(session?.user?.email ?? null);
          setIsLoading(false);
        });
        // Fetch products
        supabase.from("products").select("*").order("created_at", { ascending: false }).then(({ data }) => {
          if (data) setProducts(data);
        });
      });
    }
  }, [isDemoMode]);

  // Toast
  const showToast = useCallback((message: string, type: "success" | "error") => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Login
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      if (isDemoMode) {
        // Demo mode: accept admin@company.com / admin123
        if ((email === "admin@company.com" && password === "admin123") ||
            (email === "admin2@company.com" && password === "admin123") ||
            (email === "admin3@company.com" && password === "admin123")) {
          setIsAuthenticated(true);
          setUserEmail(email);
          localStorage.setItem(AUTH_KEY, JSON.stringify({ email }));
          return true;
        }
        return false;
      } else {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return false;
        setIsAuthenticated(true);
        setUserEmail(email);
        return true;
      }
    },
    [isDemoMode]
  );

  // Logout
  const logout = useCallback(async () => {
    if (isDemoMode) {
      localStorage.removeItem(AUTH_KEY);
    } else {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setUserEmail(null);
  }, [isDemoMode]);

  // Get product
  const getProduct = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  // Create product
  const createProduct = useCallback(
    async (data: ProductFormData, manualFile?: File | null): Promise<Product> => {
      let manualUrl: string | null = null;

      if (isDemoMode) {
        if (manualFile) {
          manualUrl = await fileToDataUrl(manualFile);
        }
        const newProduct: Product = {
          id: generateId(),
          ...data,
          manual_url: manualUrl,
          created_by: userEmail || "demo-admin",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const updated = [newProduct, ...products];
        setProducts(updated);
        saveProducts(updated);
        return newProduct;
      } else {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        // Upload PDF if provided
        if (manualFile) {
          const fileName = `${generateId()}-${manualFile.name}`;
          const { data: uploadData } = await supabase.storage
            .from("manuals")
            .upload(fileName, manualFile);
          if (uploadData) {
            const { data: urlData } = supabase.storage
              .from("manuals")
              .getPublicUrl(uploadData.path);
            manualUrl = urlData.publicUrl;
          }
        }

        const { data: newProduct, error } = await supabase
          .from("products")
          .insert({ ...data, manual_url: manualUrl })
          .select()
          .single();

        if (error) throw error;
        setProducts((prev) => [newProduct, ...prev]);
        return newProduct;
      }
    },
    [isDemoMode, products, userEmail]
  );

  // Update product
  const updateProduct = useCallback(
    async (id: string, data: ProductFormData, manualFile?: File | null): Promise<Product> => {
      let manualUrl: string | null = null;

      if (isDemoMode) {
        if (manualFile) {
          manualUrl = await fileToDataUrl(manualFile);
        }
        const updated = products.map((p) =>
          p.id === id
            ? {
                ...p,
                ...data,
                manual_url: manualUrl || p.manual_url,
                updated_at: new Date().toISOString(),
              }
            : p
        );
        setProducts(updated);
        saveProducts(updated);
        return updated.find((p) => p.id === id)!;
      } else {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        if (manualFile) {
          const fileName = `${generateId()}-${manualFile.name}`;
          const { data: uploadData } = await supabase.storage
            .from("manuals")
            .upload(fileName, manualFile);
          if (uploadData) {
            const { data: urlData } = supabase.storage
              .from("manuals")
              .getPublicUrl(uploadData.path);
            manualUrl = urlData.publicUrl;
          }
        }

        const updateData: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() };
        if (manualUrl) updateData.manual_url = manualUrl;

        const { data: updatedProduct, error } = await supabase
          .from("products")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));
        return updatedProduct;
      }
    },
    [isDemoMode, products]
  );

  // Delete product
  const deleteProduct = useCallback(
    async (id: string) => {
      if (isDemoMode) {
        const updated = products.filter((p) => p.id !== id);
        setProducts(updated);
        saveProducts(updated);
      } else {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw error;
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    },
    [isDemoMode, products]
  );

  // Refresh
  const refreshProducts = useCallback(async () => {
    if (isDemoMode) {
      setProducts(getStoredProducts());
    } else {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (data) setProducts(data);
    }
  }, [isDemoMode]);

  // Stats
  const getStats = useCallback((): DashboardStats => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const categories = new Set(products.map((p) => p.category));
    return {
      totalProducts: products.length,
      recentlyAdded: products.filter((p) => new Date(p.created_at) > weekAgo).length,
      expiringSoon: products.filter(
        (p) => p.expiry_date && new Date(p.expiry_date) > now && new Date(p.expiry_date) < monthAhead
      ).length,
      categories: categories.size,
    };
  }, [products]);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userEmail,
        login,
        logout,
        isDemoMode,
        products,
        getProduct,
        createProduct,
        updateProduct,
        deleteProduct,
        refreshProducts,
        getStats,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
