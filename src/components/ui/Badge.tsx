import { ReactNode } from "react";

const styles = {
  default: "bg-[rgba(0,0,0,0.05)] text-ink-secondary",
  success: "bg-success-subtle text-success",
  danger: "bg-danger-subtle text-danger",
  warning: "bg-warning-subtle text-warning",
  blue: "bg-info-subtle text-info",
}

export function Badge({ children, type = "default" }: { children: ReactNode, type?: keyof typeof styles }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium tracking-[-0.01em] ${styles[type]}`}>
      {children}
    </span>
  )
}
