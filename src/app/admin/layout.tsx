"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, userEmail, logout, toasts, removeToast, isDemoMode } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      ),
      exact: true,
    },
    {
      href: "/admin/products",
      label: "Products",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      href: "/admin/products/new",
      label: "Add Product",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
    },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-12 flex items-center px-4 z-[60] lg:hidden"
        style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 -ml-1 rounded-lg transition-colors"
          style={{ color: "var(--color-foreground)" }} aria-label="Toggle menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {sidebarOpen ? (
              <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            ) : (
              <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
            )}
          </svg>
        </button>
        <div className="flex items-center gap-2 ml-3">
          <div className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: "var(--color-surface-3)" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ color: "var(--color-foreground)" }}>
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
          </div>
          <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-foreground)" }}>ScanQ</span>
        </div>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[69] lg:hidden"
            style={{ background: "rgba(0,0,0,0.3)" }}
            onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar — Level 1 surface */}
      <aside className={`
        w-56 fixed top-0 left-0 h-full flex flex-col z-[70]
        transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `} style={{
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
      }}>
        {/* Logo */}
        <div className="px-4 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <Link href="/admin" className="flex items-center gap-2.5 no-underline">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--color-surface-3)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ color: "var(--color-foreground)" }}>
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-foreground)" }}>ScanQ</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          <p className="section-label px-3 mb-2 mt-1">Navigation</p>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={`sidebar-link ${isActive(item.href, item.exact) ? "active" : ""}`}>
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Demo badge */}
        {isDemoMode && (
          <div className="mx-3 mb-2 px-3 py-2 rounded-lg" style={{
            fontSize: "11px", fontWeight: 500,
            color: "var(--color-muted)",
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
          }}>
            Demo Mode
          </div>
        )}

        {/* User */}
        <div className="px-3 py-3" style={{ borderTop: "1px solid var(--color-border)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "var(--color-surface-3)",
                fontSize: "11px", fontWeight: 500,
                color: "var(--color-foreground)",
              }}>
              {userEmail?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-foreground)" }} className="truncate">{userEmail}</p>
              <p style={{ fontSize: "11px", color: "var(--color-tertiary)" }}>Admin</p>
            </div>
            <button onClick={() => { logout(); router.push("/login"); }}
              className="p-1 rounded-md transition-colors"
              style={{ color: "var(--color-muted)" }}
              title="Sign out">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main panel — Level 1 surface, floats on dot grid */}
      <main className="flex-1 lg:ml-56 pt-12 lg:pt-0">
        <div className="min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1100px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Toasts */}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div key={toast.id}
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"} cursor-pointer`}
              onClick={() => removeToast(toast.id)}>
              <span className="flex items-center gap-2">
                {toast.type === "success" ? "✓" : "✕"} {toast.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
