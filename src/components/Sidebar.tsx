"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LayoutDashboard, ClipboardList, Send, Users, FileText, BarChart3, Construction, Truck, HardHat, Menu, X } from 'lucide-react'

const SidebarItem = ({ icon, label, href, badge, onClick }: { icon: React.ReactNode, label: string, href: string, badge?: React.ReactNode, onClick?: () => void }) => {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/' && pathname?.startsWith(`${href}`))

  return (
    <Link href={href} onClick={onClick} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
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

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
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
        <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" href="/" onClick={onNavigate} />
        <SidebarItem icon={<ClipboardList size={18} />} label="Reportes" href="/reportes" onClick={onNavigate} />
        <SidebarItem icon={<Send size={18} />} label="Solicitudes" href="/solicitudes" badge="Nuevas" onClick={onNavigate} />
        <SidebarItem icon={<Users size={18} />} label="Clientes" href="/clientes" onClick={onNavigate} />

        <div className="text-[10px] font-bold text-brand-text-light uppercase tracking-widest px-4 mt-6 mb-2">Flota</div>
        <SidebarItem icon={<HardHat size={18} />} label="Conductores" href="/conductores" onClick={onNavigate} />
        <SidebarItem icon={<Truck size={18} />} label="Grúas" href="/gruas" onClick={onNavigate} />

        <div className="text-[10px] font-bold text-brand-text-light uppercase tracking-widest px-4 mt-6 mb-2">Finanzas</div>
        <SidebarItem icon={<FileText size={18} />} label="Facturación" href="/facturacion" onClick={onNavigate} />
        <SidebarItem icon={<BarChart3 size={18} />} label="Estadísticas" href="/estadisticas" onClick={onNavigate} />
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
    </>
  )
}

export function Sidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-brand-card border-b border-brand-border flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => setOpen(true)}
          className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-text-mid hover:bg-brand-divider transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent to-brand-accent-dark flex items-center justify-center">
            <Construction className="text-white w-4 h-4" />
          </div>
          <span className="text-[14px] font-bold text-brand-text">Grúas Pluma</span>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] bg-brand-card flex flex-col transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center text-brand-text-mid hover:bg-brand-divider transition-colors z-10"
        >
          <X size={16} />
        </button>
        <SidebarContent onNavigate={() => setOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-[260px] bg-brand-card border-r border-brand-border flex-col shrink-0 h-screen sticky top-0 overflow-y-auto">
        <SidebarContent />
      </div>
    </>
  )
}
