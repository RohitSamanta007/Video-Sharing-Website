import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { auth } from "./auth"
import { headers } from "next/headers"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text:string):string{
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
