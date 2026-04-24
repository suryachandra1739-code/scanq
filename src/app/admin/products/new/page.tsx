"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { PRODUCT_CATEGORIES } from "@/lib/utils";
import type { ProductFormData } from "@/lib/types";

export default function NewProductPage() {
  const router = useRouter();
  const { createProduct, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [form, setForm] = useState<ProductFormData>({
    name: "",
    category: "",
    gst_number: "",
    batch_number: "",
    serial_number: "",
    manufacture_date: "",
    expiry_date: "",
    description: "",
    additional_info: {},
  });

  const [extraFields, setExtraFields] = useState<{ key: string; value: string }[]>([]);

  const updateField = (key: keyof ProductFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setManualFile(file);
    } else {
      showToast("Please upload a PDF file", "error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        setManualFile(file);
      } else {
        showToast("Please upload a PDF file", "error");
      }
    }
  };

  const addExtraField = () => {
    setExtraFields((prev) => [...prev, { key: "", value: "" }]);
  };

  const updateExtraField = (index: number, field: "key" | "value", val: string) => {
    setExtraFields((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const removeExtraField = (index: number) => {
    setExtraFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category) {
      showToast("Product name and category are required", "error");
      return;
    }

    setLoading(true);
    try {
      const additionalInfo: Record<string, string> = {};
      extraFields.forEach((f) => {
        if (f.key.trim()) additionalInfo[f.key.trim()] = f.value.trim();
      });

      const product = await createProduct(
        { ...form, additional_info: additionalInfo },
        manualFile
      );

      showToast("Product created successfully!", "success");
      router.push(`/admin/products/${product.id}?tab=qr`);
    } catch {
      showToast("Failed to create product", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => router.back()} className="btn-ghost mb-4 -ml-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold mb-1">Add New Product</h1>
        <p className="text-muted text-sm">Fill in the product details. A QR code will be generated automatically.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card p-6"
        >
          <h2 className="text-base font-semibold mb-5 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-muted mb-2">Product Name *</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="input-field"
                placeholder="e.g. CropShield Pro 500ml"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-muted mb-2">Category *</label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="input-field cursor-pointer"
                required
              >
                <option value="">Select category</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="gst" className="block text-sm font-medium text-muted mb-2">GST Number</label>
              <input
                id="gst"
                type="text"
                value={form.gst_number}
                onChange={(e) => updateField("gst_number", e.target.value)}
                className="input-field"
                placeholder="e.g. 29ABCDE1234F1Z5"
              />
            </div>
          </div>
        </motion.div>

        {/* Identification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="glass-card p-6"
        >
          <h2 className="text-base font-semibold mb-5 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <path d="M4 7V4h3" /><path d="M20 7V4h-3" /><path d="M4 17v3h3" /><path d="M20 17v3h-3" />
              <rect x="7" y="7" width="10" height="10" rx="1" />
            </svg>
            Identification & Dates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="batch" className="block text-sm font-medium text-muted mb-2">Batch Number</label>
              <input
                id="batch"
                type="text"
                value={form.batch_number}
                onChange={(e) => updateField("batch_number", e.target.value)}
                className="input-field"
                placeholder="e.g. BATCH-2024-0891"
              />
            </div>

            <div>
              <label htmlFor="serial" className="block text-sm font-medium text-muted mb-2">Serial Number</label>
              <input
                id="serial"
                type="text"
                value={form.serial_number}
                onChange={(e) => updateField("serial_number", e.target.value)}
                className="input-field"
                placeholder="e.g. CSP-500-78234"
              />
            </div>

            <div>
              <label htmlFor="mfg-date" className="block text-sm font-medium text-muted mb-2">Manufacturing Date</label>
              <input
                id="mfg-date"
                type="date"
                value={form.manufacture_date}
                onChange={(e) => updateField("manufacture_date", e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="exp-date" className="block text-sm font-medium text-muted mb-2">Expiry Date</label>
              <input
                id="exp-date"
                type="date"
                value={form.expiry_date}
                onChange={(e) => updateField("expiry_date", e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="glass-card p-6"
        >
          <h2 className="text-base font-semibold mb-5 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
            </svg>
            Description
          </h2>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="input-field min-h-[120px] resize-y"
            placeholder="Product description, usage instructions, safety information..."
            rows={4}
          />
        </motion.div>

        {/* PDF Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="glass-card p-6"
        >
          <h2 className="text-base font-semibold mb-5 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Product Manual (PDF)
          </h2>

          <div
            className={`drop-zone ${dragOver ? "drag-over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {manualFile ? (
              <div className="flex items-center justify-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{manualFile.name}</p>
                  <p className="text-xs text-muted">{(manualFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setManualFile(null); }}
                  className="ml-4 p-1 rounded-lg text-muted hover:text-danger hover:bg-danger-bg transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted mb-3">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="text-sm text-muted mb-1">
                  Drag & drop a PDF file here, or <span className="text-accent font-medium">click to browse</span>
                </p>
                <p className="text-xs text-muted/60">PDF files only, up to 10MB</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Additional Information
            </h2>
            <button type="button" onClick={addExtraField} className="btn-ghost text-accent">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Field
            </button>
          </div>

          {extraFields.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">
              Add custom fields like Active Ingredient, Dosage, Weight, etc.
            </p>
          ) : (
            <div className="space-y-3">
              {extraFields.map((field, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => updateExtraField(index, "key", e.target.value)}
                    className="input-field flex-1"
                    placeholder="Field name"
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => updateExtraField(index, "value", e.target.value)}
                    className="input-field flex-1"
                    placeholder="Value"
                  />
                  <button
                    type="button"
                    onClick={() => removeExtraField(index)}
                    className="p-3 rounded-xl text-muted hover:text-danger hover:bg-danger-bg transition-all shrink-0"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex gap-3 pb-8"
        >
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
                Create Product & Generate QR
              </>
            )}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancel
          </button>
        </motion.div>
      </form>
    </div>
  );
}
