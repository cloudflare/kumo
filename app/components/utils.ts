import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeRandomId(): string {
  const g: any = typeof globalThis !== "undefined" ? (globalThis as any) : {};
  const c = g.crypto;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  // RFC4122 v4 using getRandomValues if available
  if (c && typeof c.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    c.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
    const toHex = (n: number) => n.toString(16).padStart(2, "0");
    const hex = Array.from(bytes, toHex).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
      12,
      16
    )}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  // Last-resort fallback
  return `r${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}
