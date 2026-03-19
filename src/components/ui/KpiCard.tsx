import { ReactNode } from "react";

export function KpiCard({ icon, value, label, type = "default", trend }: { icon: ReactNode, value: string | number, label: string, type?: "default" | "blue" | "success" | "danger", trend?: number }) {
  const colors = {
    default: { bg: "bg-brand-divider", text: "text-brand-primary" },
    blue: { bg: "bg-brand-blue-bg", text: "text-brand-blue" },
    success: { bg: "bg-brand-success-bg", text: "text-brand-success" },
    danger: { bg: "bg-brand-danger-bg", text: "text-brand-danger" },
  }
  return (
    <div className="bg-brand-card rounded-2xl p-5 shadow-sm border border-brand-border flex-1 min-w-[200px]">
      <div className="flex justify-between items-start">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${colors[type].bg}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold ${trend > 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className={`text-3xl font-bold mt-4 ${colors[type].text}`}>{value}</div>
      <div className="text-[13px] text-brand-text-light mt-1">{label}</div>
    </div>
  )
}
