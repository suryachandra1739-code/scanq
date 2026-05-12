"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { formatDate, isExpired, isExpiringSoon, truncate, getProductUrl } from "@/lib/utils";

export default function ProductListPage() {
  const router = useRouter();
  const { products, deleteProduct, showToast } = useApp();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats).sort();
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.batch_number?.toLowerCase().includes(search.toLowerCase()) ||
        p.serial_number?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      showToast("Product deleted successfully", "success");
      setDeleteId(null);
    } catch {
      showToast("Failed to delete product", "error");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 500 }} className="mb-0.5">Products</h1>
          <p style={{ fontSize: "12px", color: "var(--color-muted)" }}>{products.length} products registered</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary no-underline">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-tertiary)" }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search products, batch no, serial no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-field w-auto min-w-[160px] cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-muted mb-4">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto opacity-30">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-muted text-sm">
              {search || categoryFilter !== "all" ? "No products match your filters" : "No products yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[700px]">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Batch No.</th>
                  <th>Mfg. Date</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.3 }}
                    onClick={() => router.push(`/admin/products/${product.id}`)}
                    className="cursor-pointer"
                  >
                    <td>
                      <span className="text-foreground font-medium">
                        {truncate(product.name, 30)}
                      </span>
                    </td>
                    <td><span className="badge badge-accent">{product.category}</span></td>
                    <td className="text-muted font-mono text-xs">{product.batch_number || "—"}</td>
                    <td className="text-sm">{formatDate(product.manufacture_date)}</td>
                    <td className="text-sm">{formatDate(product.expiry_date)}</td>
                    <td>
                      {isExpired(product.expiry_date) ? (
                        <span className="badge badge-danger">Expired</span>
                      ) : isExpiringSoon(product.expiry_date) ? (
                        <span className="badge badge-warning">Expiring</span>
                      ) : (
                        <span className="badge badge-success">Active</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {/* Copy QR Link */}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(getProductUrl(product.id));
                            showToast("Product URL copied!", "success");
                          }}
                          className="btn-ghost p-2"
                          title="Copy QR link"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                        </button>
                        {/* View QR */}
                        <Link href={`/admin/products/${product.id}?tab=qr`} className="btn-ghost p-2 no-underline" title="View QR Code">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                          </svg>
                        </Link>
                        {/* Edit */}
                        <Link href={`/admin/products/${product.id}`} className="btn-ghost p-2 no-underline" title="Edit Product">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Link>
                        {/* Delete */}
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="btn-ghost p-2 text-muted hover:text-danger"
                          title="Delete Product"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-danger-bg text-danger">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Delete Product</h3>
                <p className="text-sm text-muted">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-muted mb-6">
              The QR code for this product will stop working. Any printed QR codes will lead to a &ldquo;not found&rdquo; page.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="btn-danger">Delete Product</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
