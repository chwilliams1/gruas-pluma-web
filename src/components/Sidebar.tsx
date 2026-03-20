"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LayoutDashboard, ClipboardList, Send, Users, FileText, BarChart3, Construction, Truck, HardHat, Menu, X } from 'lucide-react'

const SidebarItem = ({ icon, label, href, badge, onClick }: { icon: React.ReactNode, label: string, href: string, badge?: React.ReactNode, onClick?: () => void }) => {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/' && pathname?.startsWith(`${href}`))

  return (
    <Link href={href} onClick={onClick} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-150 ${
      active
        ? 'bg-amber-subtle text-amber font-semibold'
        : 'text-ink-tertiary hover:text-ink-secondary hover:bg-[rgba(0,0,0,0.03)]'
    }`}>
      {icon}
      <span className="flex-1 text-[13px] tracking-[-0.01em]">{label}</span>
      {badge && (
        <span className="bg-danger text-white text-[9px] font-semibold px-1.5 py-0.5 rounded min-w-[18px] text-center">
          {badge}
        </span>
      )}
    </Link>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.08em] px-3 mb-1.5 mt-6 first:mt-0">
      {children}
    </div>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="px-5 py-5 border-b border-edge">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber flex items-center justify-center">
            <Construction className="text-white w-[18px] h-[18px]" />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-ink tracking-[-0.02em]">Grúas Pluma</div>
            <div className="text-[11px] text-ink-tertiary tracking-[-0.01em]">Administración</div>
          </div>
        </div>
      </div>

      <nav className="px-3 py-4 flex-1 flex flex-col gap-0.5 overflow-y-auto">
        <SectionLabel>General</SectionLabel>
        <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" href="/" onClick={onNavigate} />
        <SidebarItem icon={<ClipboardList size={18} />} label="Reportes" href="/reportes" onClick={onNavigate} />
        <SidebarItem icon={<Send size={18} />} label="Solicitudes" href="/solicitudes" badge="!" onClick={onNavigate} />
        <SidebarItem icon={<Users size={18} />} label="Clientes" href="/clientes" onClick={onNavigate} />

        <SectionLabel>Flota</SectionLabel>
        <SidebarItem icon={<HardHat size={18} />} label="Conductores" href="/conductores" onClick={onNavigate} />
        <SidebarItem icon={<Truck size={18} />} label="Grúas" href="/gruas" onClick={onNavigate} />

        <SectionLabel>Finanzas</SectionLabel>
        <SidebarItem icon={<FileText size={18} />} label="Facturación" href="/facturacion" onClick={onNavigate} />
        <SidebarItem icon={<BarChart3 size={18} />} label="Estadísticas" href="/estadisticas" onClick={onNavigate} />
      </nav>

      <div className="px-4 py-4 border-t border-edge flex items-center gap-3 cursor-pointer hover:bg-[rgba(0,0,0,0.02)] transition-colors duration-150">
        <div className="w-8 h-8 rounded-full bg-amber flex items-center justify-center text-[11px] font-semibold text-white">
          CD
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-ink truncate">Charles Duarte</div>
          <div className="text-[11px] text-ink-tertiary">Admin</div>
        </div>
      </div>
    </>
  )
}

export function Sidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-surface-0 border-b border-edge flex items-center gap-3 px-4 h-14">
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 rounded-lg border border-edge flex items-center justify-center text-ink-secondary hover:bg-[rgba(0,0,0,0.03)] transition-colors duration-150"
        >
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-amber flex items-center justify-center">
            <Construction className="text-white w-3.5 h-3.5" />
          </div>
          <span className="text-[14px] font-semibold text-ink tracking-[-0.02em]">Grúas Pluma</span>
        </div>
      </div>

      {/* Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[272px] bg-surface-0 flex flex-col transition-transform duration-200 ease-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-3 w-7 h-7 rounded-md border border-edge flex items-center justify-center text-ink-tertiary hover:text-ink-secondary transition-colors duration-150 z-10"
        >
          <X size={14} />
        </button>
        <SidebarContent onNavigate={() => setOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-[248px] bg-surface-0 border-r border-edge flex-col shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </div>
    </>
  )
}
