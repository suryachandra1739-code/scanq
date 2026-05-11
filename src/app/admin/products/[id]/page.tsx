"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { PRODUCT_CATEGORIES, formatDate, isExpired, isExpiringSoon, getProductUrl } from "@/lib/utils";
import QRCode from "qrcode";
import type { ProductFormData } from "@/lib/types";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = params.id as string;
  const { getProduct, updateProduct, deleteProduct, showToast } = useApp();
  const product = getProduct(productId);

  const initialTab = searchParams.get("tab") === "qr" ? "qr" : "details";
  const [activeTab, setActiveTab] = useState<"details" | "qr">(initialTab);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [manualFile, setManualFile] = useState<File | null>(null);

  const [form, setForm] = useState<ProductFormData>({
    name: "", category: "", gst_number: "", batch_number: "",
    serial_number: "", manufacture_date: "", expiry_date: "",
    description: "", additional_info: {},
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        category: product.category,
        gst_number: product.gst_number || "",
        batch_number: product.batch_number || "",
        serial_number: product.serial_number || "",
        manufacture_date: product.manufacture_date || "",
        expiry_date: product.expiry_date || "",
        description: product.description || "",
        additional_info: product.additional_info || {},
      });
    }
  }, [product]);

  const generateQR = useCallback(async () => {
    if (!productId) return;
    try {
      const url = getProductUrl(productId);
      const dataUrl = await QRCode.toDataURL(url, {
        width: 512,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "H",
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error("QR generation failed:", err);
    }
  }, [productId]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted mb-4">Product not found</p>
        <button onClick={() => router.push("/admin/products")} className="btn-secondary">
          Back to Products
        </button>
      </div>
    );
  }

  const updateField = (key: keyof ProductFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.name || !form.category) {
      showToast("Product name and category are required", "error");
      return;
    }
    setLoading(true);
    try {
      await updateProduct(productId, form, manualFile);
      showToast("Product updated successfully!", "success");
      setEditing(false);
      setManualFile(null);
    } catch {
      showToast("Failed to update product", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(productId);
      showToast("Product deleted", "success");
      router.push("/admin/products");
    } catch {
      showToast("Failed to delete product", "error");
    }
  };

  const downloadQR = (format: "png" | "svg") => {
    if (format === "png" && qrDataUrl) {
      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = `${product.name.replace(/\s+/g, "_")}_QR.png`;
      link.click();
    } else if (format === "svg") {
      const url = getProductUrl(productId);
      QRCode.toString(url, { type: "svg", margin: 2, errorCorrectionLevel: "H" }, (err, svg) => {
        if (err || !svg) return;
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${product.name.replace(/\s+/g, "_")}_QR.svg`;
        link.click();
      });
    }
    showToast(`QR code downloaded as ${format.toUpperCase()}`, "success");
  };

  const productUrl = getProductUrl(productId);

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => router.push("/admin/products")} className="btn-ghost mb-4 -ml-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Products
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold">{product.name}</h1>
              {isExpired(product.expiry_date) ? (
                <span className="badge badge-danger">Expired</span>
              ) : isExpiringSoon(product.expiry_date) ? (
                <span className="badge badge-warning">Expiring Soon</span>
              ) : (
                <span className="badge badge-success">Active</span>
              )}
            </div>
            <p className="text-muted text-sm">{product.category} · Added {formatDate(product.created_at)}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {!editing && activeTab === "details" && (
              <button onClick={() => setEditing(true)} className="btn-secondary">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
            )}
            <button onClick={() => setDeleteModal(true)} className="btn-danger">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-surface w-fit">
        <button
          onClick={() => setActiveTab("details")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "details" ? "bg-surface-3 text-foreground" : "text-muted hover:text-foreground"
          }`}
        >
          Product Details
        </button>
        <button
          onClick={() => setActiveTab("qr")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "qr" ? "bg-surface-3 text-foreground" : "text-muted hover:text-foreground"
          }`}
        >
          QR Code
        </button>
      </div>

      {/* Details Tab */}
      {activeTab === "details" && (
        <motion.div
          key="details"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {editing ? (
            /* Edit Mode */
            <div className="space-y-6">
              <div className="glass-card p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-muted mb-2">Product Name *</label>
                    <input type="text" value={form.name} onChange={(e) => updateField("name", e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">Category *</label>
                    <select value={form.category} onChange={(e) => updateField("category", e.target.value)} className="input-field cursor-pointer">
                      {PRODUCT_CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">GST Number</label>
                    <input type="text" value={form.gst_number} onChange={(e) => updateField("gst_number", e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">Batch Number</label>
                    <input type="text" value={form.batch_number} onChange={(e) => updateField("batch_number", e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">Serial Number</label>
                    <input type="text" value={form.serial_number} onChange={(e) => updateField("serial_number", e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">Manufacturing Date</label>
                    <input type="date" value={form.manufacture_date} onChange={(e) => updateField("manufacture_date", e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">Expiry Date</label>
                    <input type="date" value={form.expiry_date} onChange={(e) => updateField("expiry_date", e.target.value)} className="input-field" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-muted mb-2">Description</label>
                    <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} className="input-field min-h-[100px] resize-y" rows={3} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-muted mb-2">Replace Manual (PDF)</label>
                    <input ref={fileInputRef} type="file" accept="application/pdf" onChange={(e) => setManualFile(e.target.files?.[0] || null)} className="input-field" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={loading} className="btn-primary">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Saving...
                    </span>
                  ) : "Save Changes"}
                </button>
                <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="glass-card p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Product Name", value: product.name },
                  { label: "Category", value: product.category },
                  { label: "GST Number", value: product.gst_number },
                  { label: "Batch Number", value: product.batch_number },
                  { label: "Serial Number", value: product.serial_number },
                  { label: "Manufacturing Date", value: formatDate(product.manufacture_date) },
                  { label: "Expiry Date", value: formatDate(product.expiry_date) },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-sm font-medium">{item.value || "—"}</p>
                  </div>
                ))}
              </div>

              {product.description && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Description</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{product.description}</p>
                </div>
              )}

              {product.additional_info && Object.keys(product.additional_info).length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">Additional Information</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.additional_info).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-muted mb-0.5">{key}</p>
                        <p className="text-sm font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.manual_url && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Product Manual</p>
                  <p className="text-sm text-success flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                    Manual uploaded
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* QR Tab */}
      {activeTab === "qr" && (
        <motion.div
          key="qr"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="glass-card p-8 text-center">
            <h2 className="text-lg font-semibold mb-2">QR Code</h2>
            <p className="text-muted text-sm mb-8">Scan this code or print it on your product packaging</p>

            {qrDataUrl && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
              >
                <div className="bg-white p-4 sm:p-6 rounded-2xl inline-block mb-6 shadow-lg shadow-black/20">
                  <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 sm:w-64 sm:h-64" />
                </div>
              </motion.div>
            )}

            <div className="mb-6">
              <p className="text-xs text-muted mb-2">This QR code points to:</p>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface text-xs sm:text-sm font-mono text-accent max-w-full overflow-x-auto">
                {productUrl}
                <button
                  onClick={() => { navigator.clipboard.writeText(productUrl); showToast("URL copied!", "success"); }}
                  className="p-1 rounded hover:bg-surface-2 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button onClick={() => downloadQR("png")} className="btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PNG
              </button>
              <button onClick={() => downloadQR("svg")} className="btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download SVG
              </button>
              <button
                onClick={() => window.open(productUrl, "_blank")}
                className="btn-ghost text-accent"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Preview Page
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-danger-bg text-danger">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Delete Product</h3>
                <p className="text-sm text-muted">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-muted mb-6">
              All printed QR codes for <strong className="text-foreground">{product.name}</strong> will stop working.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleDelete} className="btn-danger">Delete Product</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
