import { ReactNode } from "react";

const themes = {
  default: { accent: "bg-ink-tertiary", subtle: "bg-[rgba(0,0,0,0.04)]", text: "text-ink" },
  blue: { accent: "bg-info", subtle: "bg-info-subtle", text: "text-info" },
  success: { accent: "bg-success", subtle: "bg-success-subtle", text: "text-success" },
  danger: { accent: "bg-danger", subtle: "bg-danger-subtle", text: "text-danger" },
}

export function KpiCard({ icon, value, label, type = "default" }: {
  icon: ReactNode
  value: string | number
  label: string
  type?: keyof typeof themes
}) {
  const t = themes[type]
  return (
    <div className="bg-surface-1 rounded-xl border border-edge p-4 sm:p-5 flex flex-col relative overflow-hidden">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${t.accent}`} />

      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${t.subtle} flex items-center justify-center ${t.text} mb-3 sm:mb-4`}>
        {icon}
      </div>
      <div className={`text-xl sm:text-2xl font-semibold tabular-nums tracking-[-0.03em] ${t.text}`}>
        {value}
      </div>
      <div className="text-[12px] sm:text-[13px] text-ink-tertiary mt-1 tracking-[-0.01em]">{label}</div>
    </div>
  )
}
