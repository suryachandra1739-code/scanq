"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { formatDate, isExpired, isExpiringSoon, decodeUuid } from "@/lib/utils";
import type { Product } from "@/lib/types";

// Direct fetch by short_code — no AppContext dependency
async function fetchProductByCode(code: string): Promise<Product | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isDemoMode = !supabaseUrl || supabaseUrl === "your_supabase_project_url" || !supabaseUrl.startsWith("https://");

  if (isDemoMode) {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("qr_products");
    if (!stored) return null;
    try {
      const products: Product[] = JSON.parse(stored);
      const uuid = decodeUuid(code);
      return products.find((p) => p.id === uuid) ?? null;
    } catch {
      return null;
    }
  } else {
    try {
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const uuid = decodeUuid(code);
      const res = await fetch(
        `${supabaseUrl}/rest/v1/products?id=eq.${encodeURIComponent(uuid)}&select=*`,
        {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
          cache: "no-store",
        }
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data.length > 0 ? data[0] : null;
    } catch (err) {
      console.error("Failed to fetch product:", err);
      return null;
    }
  }
}

export default function ShortCodeProductPage() {
  const params = useParams();
  const code = params.code as string;
  const [product, setProduct] = useState<Product | null | undefined>(undefined);

  useEffect(() => {
    fetchProductByCode(code).then((p) => setProduct(p));
  }, [code]);

  // Loading
  if (product === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-base)" }}>
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p style={{ fontSize: "13px", color: "var(--color-muted)" }}>Verifying product...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-base)" }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-muted)" }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 500 }} className="mb-1">Product Not Found</h1>
          <p style={{ fontSize: "12px", color: "var(--color-muted)" }}>This QR code does not match any registered product.</p>
        </div>
      </div>
    );
  }

  const expired = isExpired(product.expiry_date);
  const expiringSoon = isExpiringSoon(product.expiry_date);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-base)" }}>
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ color: "var(--color-foreground)" }}>
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
            </div>
            <div className="verified-badge mx-auto w-fit mb-4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Verified Product
            </div>
          </div>
        </motion.div>

        {/* Product Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass-card p-5 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 500 }} className="mb-1">{product.name}</h1>
              <span className="badge">{product.category}</span>
            </div>
            {expired ? (
              <span className="badge badge-danger">Expired</span>
            ) : expiringSoon ? (
              <span className="badge badge-warning">Expiring Soon</span>
            ) : (
              <span className="badge badge-success">Active</span>
            )}
          </div>

          {product.description && (
            <p style={{ fontSize: "13px", color: "var(--color-muted)", lineHeight: 1.6 }} className="mb-4">{product.description}</p>
          )}

          <div className="space-y-3">
            {[
              { label: "GST Number", value: product.gst_number },
              { label: "Batch Number", value: product.batch_number },
              { label: "Serial Number", value: product.serial_number },
              { label: "Manufacture Date", value: product.manufacture_date ? formatDate(product.manufacture_date) : "" },
              { label: "Expiry Date", value: product.expiry_date ? formatDate(product.expiry_date) : "" },
            ].filter(f => f.value).map((field) => (
              <div key={field.label} className="flex justify-between items-baseline py-2"
                style={{ borderBottom: "1px solid var(--color-border)" }}>
                <span className="section-label">{field.label}</span>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-foreground)" }}>{field.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Additional Info */}
        {Object.keys(product.additional_info || {}).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="glass-card p-5 mb-4">
            <p className="section-label mb-3">Additional Information</p>
            <div className="space-y-3">
              {Object.entries(product.additional_info).map(([key, val]) => (
                <div key={key} className="flex justify-between items-baseline py-2"
                  style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <span style={{ fontSize: "12px", color: "var(--color-muted)" }}>{key}</span>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-foreground)" }}>{val}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Manual Download */}
        {product.manual_url && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="glass-card p-5 mb-4">
            <p className="section-label mb-3">Product Manual</p>
            <a href={product.manual_url} target="_blank" rel="noopener noreferrer"
              className="btn-secondary w-full no-underline" style={{ display: "flex" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Manual (PDF)
            </a>
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center mt-6">
          <p style={{ fontSize: "11px", color: "var(--color-tertiary)" }}>
            Verified by ScanQ · {formatDate(product.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
