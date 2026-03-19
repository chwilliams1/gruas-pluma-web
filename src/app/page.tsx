import prisma from '@/lib/prisma'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { FileText, Clock, DollarSign, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const reportes = await prisma.reporte.findMany({
    include: { solicitud: { include: { cliente: true } } }
  })
  const solicitudes = await prisma.solicitud.findMany({
    include: { cliente: true, chofer: true },
    orderBy: { creadoEn: 'desc' },
    take: 5
  })

  // KPIs
  const totalHoras = reportes.reduce((s, r) => s + r.horas, 0)
  const cobrado = reportes.filter(r => r.pagado).reduce((s, r) => s + r.monto, 0)
  const pendiente = reportes.filter(r => !r.pagado).reduce((s, r) => s + r.monto, 0)
  const nuevasSol = solicitudes.filter(s => s.estado === 'NUEVA').length

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-text m-0">Dashboard</h1>
          <p className="text-[13px] text-brand-text-light mt-1">Resumen de operaciones</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8 flex-wrap">
        <KpiCard icon={<FileText size={20}/>} value={reportes.length} label="Reportes de servicio" type="blue" />
        <KpiCard icon={<Clock size={20}/>} value={`${totalHoras}h`} label="Horas operadas" />
        <KpiCard icon={<DollarSign size={20}/>} value={`$${(cobrado/1000).toFixed(0)}k`} label="Total cobrado" type="success" />
        <KpiCard icon={<AlertTriangle size={20}/>} value={`$${(pendiente/1000).toFixed(0)}k`} label="Pendiente de cobro" type="danger" />
      </div>

      <div className="flex gap-4">
        {/* Últimas Solicitudes */}
        <div className="flex-1 bg-brand-card rounded-2xl p-6 shadow-sm border border-brand-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-brand-text">Últimas Solicitudes</h2>
            {nuevasSol > 0 && <Badge type="danger">{nuevasSol} nuevas</Badge>}
          </div>

          <div className="flex flex-col">
            {solicitudes.map(s => (
              <div key={s.id} className="py-3 border-b border-brand-divider last:border-0 hover:bg-brand-bg transition-colors -mx-6 px-6 cursor-pointer">
                <div className="flex justify-between mb-1.5">
                  <span className="text-[13px] font-semibold text-brand-text">{s.cliente.nombre}</span>
                  <Badge type={s.estado === 'NUEVA' ? 'warning' : s.estado === 'ASIGNADA' ? 'blue' : 'success'}>
                    {s.estado}
                  </Badge>
                </div>
                <div className="text-[12px] text-brand-text-light">
                  {s.tipo} · {s.fecha} · {s.hora} {s.chofer && `· Asignada a ${s.chofer.nombre}`}
                </div>
              </div>
            ))}
            {solicitudes.length === 0 && (
              <div className="text-[13px] text-brand-text-light py-8 text-center italic">No hay solicitudes recientes</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
