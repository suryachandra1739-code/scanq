"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { formatDate, isExpiringSoon, isExpired } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { products, getStats } = useApp();
  const stats = getStats();
  const recentProducts = products.slice(0, 5);

  const statCards = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      ),
    },
    {
      label: "Added This Week",
      value: stats.recentlyAdded,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
    },
    {
      label: "Expiring Soon",
      value: stats.expiringSoon,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: "Categories",
      value: stats.categories,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      ),
    },
  ];

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
  };

  return (
    <div>
      <div className="mb-6">
        <h1 style={{ fontSize: "20px", fontWeight: 500 }} className="mb-1">Dashboard</h1>
        <p style={{ fontSize: "12px", color: "var(--color-muted)" }}>Overview of your product traceability system</p>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
      >
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            variants={itemVariants}
            className="stat-card"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "var(--color-surface-3)", color: "var(--color-foreground)" }}>
                {card.icon}
              </div>
            </div>
            <div style={{ fontSize: "24px", fontWeight: 500, color: "var(--color-foreground)" }} className="mb-0.5">{card.value}</div>
            <div style={{ fontSize: "11px", color: "var(--color-muted)" }}>{card.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/products/new" className="btn-primary no-underline">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add New Product
          </Link>
          <Link href="/admin/products" className="btn-secondary no-underline">
            View All Products
          </Link>
        </div>
      </motion.div>

      {/* Recent Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Products</h2>
          <Link href="/admin/products" className="text-sm text-accent hover:underline no-underline">
            View all →
          </Link>
        </div>
        <div className="glass-card overflow-x-auto">
          {recentProducts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-muted mb-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto opacity-30">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              </div>
              <p className="text-muted text-sm mb-4">No products yet</p>
              <Link href="/admin/products/new" className="btn-primary no-underline text-sm">
                Add your first product
              </Link>
            </div>
          ) : (
            <table className="data-table min-w-[600px]">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Batch No.</th>
                  <th>Expiry</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((product) => (
                  <tr key={product.id} onClick={() => router.push(`/admin/products/${product.id}`)} className="cursor-pointer">
                    <td>
                      <span className="text-foreground font-medium">
                        {product.name}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-accent">{product.category}</span>
                    </td>
                    <td className="text-muted font-mono text-xs">{product.batch_number || "—"}</td>
                    <td className="text-sm">{formatDate(product.expiry_date)}</td>
                    <td>
                      {isExpired(product.expiry_date) ? (
                        <span className="badge badge-danger">Expired</span>
                      ) : isExpiringSoon(product.expiry_date) ? (
                        <span className="badge badge-warning">Expiring Soon</span>
                      ) : (
                        <span className="badge badge-success">Active</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
