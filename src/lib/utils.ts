export function formatDate(dateString: string): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function isExpired(dateString: string): boolean {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
}

export function isExpiringSoon(dateString: string, days: number = 30): boolean {
  if (!dateString) return false;
  const expiry = new Date(dateString);
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  return diff > 0 && diff < days * 24 * 60 * 60 * 1000;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function truncate(str: string, length: number): string {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.substring(0, length) + "…";
}

export function getBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function getProductUrl(productId: string): string {
  return `${getBaseUrl()}/product/${productId}`;
}

export const PRODUCT_CATEGORIES = [
  "Insecticide",
  "Herbicide",
  "Fungicide",
  "Fertilizer",
  "Seed Treatment",
  "Plant Growth Regulator",
  "Bio-Pesticide",
  "Other",
] as const;
