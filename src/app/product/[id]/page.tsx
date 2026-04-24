"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { formatDate, isExpired, isExpiringSoon } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function PublicProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const { getProduct, isLoading: appLoading } = useApp();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);

  useEffect(() => {
    if (!appLoading) {
      const p = getProduct(productId);
      setProduct(p ?? null);
    }
  }, [appLoading, productId, getProduct]);

  // Loading state
  if (product === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-muted text-sm">Loading product information...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (product === null) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-danger">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="text-muted text-sm">This QR code doesn&apos;t match any registered product. The product may have been removed.</p>
        </motion.div>
      </div>
    );
  }

  const expired = isExpired(product.expiry_date);
  const expiringSoon = isExpiringSoon(product.expiry_date);

  const details = [
    { label: "Batch Number", value: product.batch_number, icon: "🏭" },
    { label: "Serial Number", value: product.serial_number, icon: "🔢" },
    { label: "GST Number", value: product.gst_number, icon: "📋" },
    { label: "Manufacturing Date", value: formatDate(product.manufacture_date), icon: "📅" },
    { label: "Expiry Date", value: formatDate(product.expiry_date), icon: "⏰" },
  ];

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0" style={{
          background: "linear-gradient(135deg, rgba(27,79,114,0.08) 0%, rgba(184,134,11,0.06) 50%, rgba(184,134,11,0.04) 100%)",
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle, rgba(27,79,114,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 30% 0%, rgba(27,79,114,0.1) 0%, transparent 60%)",
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-16" style={{
          background: "linear-gradient(to top, var(--color-background), transparent)",
        }} />

        <div className="relative px-4 pt-8 pb-10 max-w-lg mx-auto">
          {/* Company Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(27,79,114,0.2), rgba(184,134,11,0.2))", border: "1px solid rgba(27,79,114,0.3)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
              </div>
              <span className="text-sm font-bold text-foreground">Company</span>
            </div>

            <div className="verified-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Verified Product
            </div>
          </motion.div>

          {/* Category Badge */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="badge badge-accent text-xs mb-3">{product.category}</span>
          </motion.div>

          {/* Product Name */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold mb-3 leading-tight"
          >
            {product.name}
          </motion.h1>

          {/* Status */}
          {expired && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.25)", color: "var(--color-danger)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              This product has expired
            </motion.div>
          )}
          {expiringSoon && !expired && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "rgba(202,138,4,0.12)", border: "1px solid rgba(202,138,4,0.25)", color: "var(--color-warning)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              Expiring soon — check expiry date below
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4 max-w-lg mx-auto -mt-2">
        {/* Product Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="glass-card p-5 mb-4"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            Product Details
          </h2>

          <div className="space-y-0">
            {details.map((detail, index) => (
              detail.value && detail.value !== "—" && (
                <motion.div
                  key={detail.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-center justify-between py-3.5 border-b border-border last:border-0"
                >
                  <span className="text-sm text-muted flex items-center gap-2">
                    <span className="text-base">{detail.icon}</span>
                    {detail.label}
                  </span>
                  <span className={`text-sm font-medium ${
                    detail.label === "Expiry Date" && expired ? "text-danger" :
                    detail.label === "Expiry Date" && expiringSoon ? "text-warning" : "text-foreground"
                  }`}>
                    {detail.value}
                  </span>
                </motion.div>
              )
            ))}
          </div>
        </motion.div>

        {/* Additional Info */}
        {product.additional_info && Object.keys(product.additional_info).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="glass-card p-5 mb-4"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              Specifications
            </h2>
            <div className="space-y-0">
              {Object.entries(product.additional_info).map(([key, value], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + index * 0.05 }}
                  className="flex items-center justify-between py-3.5 border-b border-border last:border-0"
                >
                  <span className="text-sm text-muted">{key}</span>
                  <span className="text-sm font-medium text-foreground">{value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Description */}
        {product.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="glass-card p-5 mb-4"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
              </svg>
              Description
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed">{product.description}</p>
          </motion.div>
        )}

        {/* Download Manual */}
        {product.manual_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="glass-card p-5 mb-4"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
              Product Manual
            </h2>
            <a
              href={product.manual_url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full no-underline"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Product Manual (PDF)
            </a>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-8 mb-4"
        >
          <div className="flex items-center justify-center gap-2 text-muted text-xs mb-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
            Powered by Company Traceability
          </div>
          <p className="text-[11px] text-muted/50">Product information verified and authentic</p>
        </motion.div>
      </div>
    </div>
  );
}
