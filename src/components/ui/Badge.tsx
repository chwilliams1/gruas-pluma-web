import { ReactNode } from "react";

export function Badge({ children, type = "default" }: { children: ReactNode, type?: "default" | "success" | "danger" | "warning" | "blue" }) {
  const styles = {
    default: "bg-brand-divider text-brand-text-mid",
    success: "bg-brand-success-bg text-brand-success",
    danger: "bg-brand-danger-bg text-brand-danger",
    warning: "bg-brand-warning-bg text-brand-accent-dark",
    blue: "bg-brand-blue-bg text-brand-blue",
  }
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold ${styles[type]}`}>
      {children}
    </span>
  )
}
