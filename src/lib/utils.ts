import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Role = "dispatcher" | "technician" | "billing";
export type Priority = "stat" | "urgent" | "routine";
export type OrderStatus = "pending" | "assigned" | "en-route" | "in-progress" | "complete" | "billed";
export type SyncStatus = "synced" | "pending" | "conflict" | "offline";
