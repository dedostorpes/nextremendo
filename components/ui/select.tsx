import * as React from "react"
import { cn } from "@/lib/utils"

export function Select({ children, ...props }: { children: React.ReactNode }) {
  return <div {...props}>{children}</div>
}

export function SelectTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("border px-3 py-2 rounded-md bg-white text-sm", className)}>{children}</div>
}

export function SelectValue({ placeholder }: { placeholder: string }) {
  return <span className="text-neutral-500">{placeholder}</span>
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <div className="mt-1 border rounded-md bg-white p-2 shadow-md">{children}</div>
}

export function SelectItem({ children, value }: { children: React.ReactNode; value: string }) {
  return <div className="p-2 hover:bg-neutral-100 cursor-pointer" data-value={value}>{children}</div>
}
