import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isExternalRetailer(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('klikindomaret.com') || url.includes('alfagift.id');
}
