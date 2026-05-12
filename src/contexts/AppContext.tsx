"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
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
  {
    id: "demo-004",
    name: "BioProtect Plus",
    category: "Bio-Pesticide",
    gst_number: "29ABCDE1234F1Z5",
    batch_number: "BATCH-2025-0199",
    serial_number: "BPP-100-88211",
    manufacture_date: "2025-02-15",
    expiry_date: "2026-02-15",
    description: "Organic bio-pesticide derived from Neem extract. Effective against caterpillars and aphids.",
    manual_url: null,
    additional_info: { "Active Ingredient": "Azadirachtin 0.15% EC", "Application": "Foliar spray" },
    created_by: "demo-admin",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "demo-005",
    name: "RootBoost Growth Regulator",
    category: "Plant Growth Regulator",
    gst_number: "29ABCDE1234F1Z5",
    batch_number: "BATCH-2024-1102",
    serial_number: "RBG-500-44920",
    manufacture_date: "2024-12-05",
    expiry_date: "2026-12-05",
    description: "Promotes vigorous root development and early plant establishment in fruit trees and vegetables.",
    manual_url: null,
    additional_info: { "Active Ingredient": "Indole-3-butyric acid", "Dosage": "2ml per liter" },
    created_by: "demo-admin",
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "demo-006",
    name: "FungiStop 80 WP",
    category: "Fungicide",
    gst_number: "29ABCDE1234F1Z5",
    batch_number: "BATCH-2025-0045",
    serial_number: "FS-80-77123",
    manufacture_date: "2025-03-01",
    expiry_date: "2027-03-01",
    description: "Contact fungicide for the control of early and late blight in potatoes and tomatoes.",
    manual_url: null,
    additional_info: { "Active Ingredient": "Mancozeb 75% WP", "Disease": "Blight, Mildew" },
    created_by: "demo-admin",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "demo-007",
    name: "AquaSave Soil Conditioner",
    category: "Other",
    gst_number: "29ABCDE1234F1Z5",
    batch_number: "BATCH-2024-0999",
    serial_number: "ASC-10-55891",
    manufacture_date: "2024-10-20",
    expiry_date: "2029-10-20",
    description: "Improves soil water retention and aeration. Ideal for sandy and drought-prone soils.",
    manual_url: null,
    additional_info: { "Composition": "Polyacrylamide 90%", "Usage": "Mix with topsoil" },
    created_by: "demo-admin",
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: "demo-008",
    name: "NitroMax Liquid Urea",
    category: "Fertilizer",
    gst_number: "29ABCDE1234F1Z5",
    batch_number: "BATCH-2025-0211",
    serial_number: "NMU-5L-33219",
    manufacture_date: "2025-04-10",
    expiry_date: "2026-04-10",
    description: "High-concentration liquid nitrogen fertilizer for rapid greening and growth.",
    manual_url: null,
    additional_info: { "Nitrogen Content": "32%", "Application": "Drip irrigation or foliar" },
    created_by: "demo-admin",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  }
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

// ===== Lazy Supabase singleton =====
let _supabaseClient: ReturnType<typeof import("@supabase/ssr").createBrowserClient> | null = null;

function getSupabase() {
  if (!_supabaseClient) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createBrowserClient } = require("@supabase/ssr");
    _supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabaseClient!;
}

// ===== PROVIDER =====
export function AppProvider({ children }: { children: ReactNode }) {
  const isDemoMode = !isSupabaseConfigured();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const initDone = useRef(false);

  // ===== Fetch products from Supabase (works for both auth'd and public) =====
  const fetchProducts = useCallback(async () => {
    if (isDemoMode) {
      setProducts(getStoredProducts());
      return;
    }
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Failed to fetch products:", error.message);
        return;
      }
      if (data) setProducts(data);
    } catch (err) {
      console.error("Products fetch error:", err);
    }
  }, [isDemoMode]);

  // ===== Init: check auth + fetch products =====
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    if (isDemoMode) {
      // Demo mode init
      const auth = localStorage.getItem(AUTH_KEY);
      if (auth) {
        try {
          const parsed = JSON.parse(auth);
          setIsAuthenticated(true);
          setUserEmail(parsed.email);
        } catch { /* ignore */ }
      }
      setProducts(getStoredProducts());
      setIsLoading(false);
    } else {
      // Supabase init
      const supabase = getSupabase();

      // Check current session
      supabase.auth.getSession().then(({ data: { session } }: { data: { session: { user: { email: string; id: string } } | null } }) => {
        setIsAuthenticated(!!session);
        setUserEmail(session?.user?.email ?? null);
        setIsLoading(false);
      });

      // Listen for auth state changes (login/logout/token refresh)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event: string, session: { user: { email: string; id: string } } | null) => {
          setIsAuthenticated(!!session);
          setUserEmail(session?.user?.email ?? null);
        }
      );

      // Always fetch products (public read is allowed by RLS)
      fetchProducts();

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [isDemoMode, fetchProducts]);

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
        try {
          const supabase = getSupabase();
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) {
            console.error("Login error:", error.message);
            return false;
          }
          setIsAuthenticated(true);
          setUserEmail(email);
          // Refresh products after login
          fetchProducts();
          return true;
        } catch (err) {
          console.error("Login failed:", err);
          return false;
        }
      }
    },
    [isDemoMode, fetchProducts]
  );

  // Logout
  const logout = useCallback(async () => {
    if (isDemoMode) {
      localStorage.removeItem(AUTH_KEY);
    } else {
      try {
        const supabase = getSupabase();
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Logout error:", err);
      }
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
        const supabase = getSupabase();

        // Upload PDF if provided
        if (manualFile) {
          const fileName = `${generateId()}-${manualFile.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("manuals")
            .upload(fileName, manualFile, {
              cacheControl: "3600",
              upsert: false,
            });
          if (uploadError) {
            console.error("Manual upload failed:", uploadError.message);
          } else if (uploadData) {
            const { data: urlData } = supabase.storage
              .from("manuals")
              .getPublicUrl(uploadData.path);
            manualUrl = urlData.publicUrl;
          }
        }

        // Get current user ID for created_by
        const { data: { user } } = await supabase.auth.getUser();

        const insertData = {
          name: data.name,
          category: data.category,
          gst_number: data.gst_number || "",
          batch_number: data.batch_number || "",
          serial_number: data.serial_number || "",
          manufacture_date: data.manufacture_date || null,
          expiry_date: data.expiry_date || null,
          description: data.description || "",
          additional_info: data.additional_info || {},
          manual_url: manualUrl,
          created_by: user?.id || null,
        };

        const { data: newProduct, error } = await supabase
          .from("products")
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error("Create product error:", error.message);
          throw new Error(error.message);
        }
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
        const supabase = getSupabase();

        if (manualFile) {
          const fileName = `${generateId()}-${manualFile.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("manuals")
            .upload(fileName, manualFile, {
              cacheControl: "3600",
              upsert: false,
            });
          if (uploadError) {
            console.error("Manual upload failed:", uploadError.message);
          } else if (uploadData) {
            const { data: urlData } = supabase.storage
              .from("manuals")
              .getPublicUrl(uploadData.path);
            manualUrl = urlData.publicUrl;
          }
        }

        const updateData: Record<string, unknown> = {
          name: data.name,
          category: data.category,
          gst_number: data.gst_number || "",
          batch_number: data.batch_number || "",
          serial_number: data.serial_number || "",
          manufacture_date: data.manufacture_date || null,
          expiry_date: data.expiry_date || null,
          description: data.description || "",
          additional_info: data.additional_info || {},
          updated_at: new Date().toISOString(),
        };
        if (manualUrl) updateData.manual_url = manualUrl;

        const { data: updatedProduct, error } = await supabase
          .from("products")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Update product error:", error.message);
          throw new Error(error.message);
        }
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
        const supabase = getSupabase();
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) {
          console.error("Delete product error:", error.message);
          throw new Error(error.message);
        }
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    },
    [isDemoMode, products]
  );

  // Refresh
  const refreshProducts = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

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
