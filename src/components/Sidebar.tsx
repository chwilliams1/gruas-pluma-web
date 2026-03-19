"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardList, Send, Users, FileText, BarChart3, Construction, Truck, HardHat } from 'lucide-react'

const SidebarItem = ({ icon, label, href, badge }: { icon: any, label: string, href: string, badge?: React.ReactNode }) => {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/' && pathname?.startsWith(`${href}`))

  return (
    <Link href={href} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] text-brand-accent font-semibold' : 'border border-transparent text-brand-text-light hover:bg-brand-bg hover:text-brand-text-mid'
    }`}>
      {icon}
      <span className="flex-1 text-[13px]">{label}</span>
      {badge && (
        <span className="bg-brand-danger text-brand-card text-[9px] font-bold px-2 py-0.5 rounded-full min-w-[18px] text-center">
          {badge}
        </span>
      )}
    </Link>
  )
}

export function Sidebar() {
  return (
    <div className="w-[260px] bg-brand-card border-r border-brand-border flex flex-col shrink-0 h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-accent to-brand-accent-dark flex items-center justify-center">
            <Construction className="text-white w-5 h-5" />
          </div>
          <div>
            <div className="text-[15px] font-bold text-brand-text">Grúas Pluma</div>
            <div className="text-[11px] text-brand-text-light">Panel de administración</div>
          </div>
        </div>
      </div>
      
      {/* Nav */}
      <div className="p-4 flex-1 flex flex-col gap-1">
        <div className="text-[10px] font-bold text-brand-text-light uppercase tracking-widest px-4 mb-2">General</div>
        <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" href="/" />
        <SidebarItem icon={<ClipboardList size={18} />} label="Reportes" href="/reportes" />
        <SidebarItem icon={<Send size={18} />} label="Solicitudes" href="/solicitudes" badge="Nuevas" />
        <SidebarItem icon={<Users size={18} />} label="Clientes" href="/clientes" />

        <div className="text-[10px] font-bold text-brand-text-light uppercase tracking-widest px-4 mt-6 mb-2">Flota</div>
        <SidebarItem icon={<HardHat size={18} />} label="Conductores" href="/conductores" />
        <SidebarItem icon={<Truck size={18} />} label="Grúas" href="/gruas" />

        <div className="text-[10px] font-bold text-brand-text-light uppercase tracking-widest px-4 mt-6 mb-2">Finanzas</div>
        <SidebarItem icon={<FileText size={18} />} label="Facturación" href="/facturacion" />
        <SidebarItem icon={<BarChart3 size={18} />} label="Estadísticas" href="/estadisticas" />
      </div>

      {/* User */}
      <div className="p-5 border-t border-brand-border flex items-center gap-3 cursor-pointer hover:bg-brand-bg transition-colors">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-accent to-brand-accent-dark flex items-center justify-center text-[12px] font-bold text-white shadow-sm">
          CD
        </div>
        <div>
          <div className="text-[13px] font-semibold text-brand-text">Charles Duarte</div>
          <div className="text-[11px] text-brand-text-light">Administrador</div>
        </div>
      </div>
    </div>
  )
}
