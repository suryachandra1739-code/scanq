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

export function generateShortCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const BASE62_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export function encodeUuid(uuid: string): string {
  if (!uuid || !uuid.includes('-')) return uuid; // Fallback if not a standard UUID
  try {
    const hex = uuid.replace(/-/g, "");
    let num = BigInt("0x" + hex);
    let base62 = "";
    if (num === BigInt(0)) return "0";
    while (num > BigInt(0)) {
      const rem = num % BigInt(62);
      base62 = BASE62_CHARSET[Number(rem)] + base62;
      num = num / BigInt(62);
    }
    return base62;
  } catch (e) {
    return uuid;
  }
}

export function decodeUuid(code: string): string {
  if (code.includes('-')) return code; // Already a UUID
  try {
    let num = BigInt(0);
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const val = BigInt(BASE62_CHARSET.indexOf(char));
      if (val < BigInt(0)) return code; // Invalid char
      num = num * BigInt(62) + val;
    }
    let hex = num.toString(16);
    hex = hex.padStart(32, "0");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  } catch (e) {
    return code;
  }
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
  return `${getBaseUrl()}/p/${encodeUuid(productId)}`;
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
