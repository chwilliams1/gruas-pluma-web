import prisma from '@/lib/prisma'
import { KpiCard } from '@/components/ui/KpiCard'
import { BarChart3, Clock, Users, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EstadisticasPage() {
  const reportes = await prisma.reporte.findMany({
    include: { solicitud: { include: { cliente: true } }, chofer: true }
  })
  const solicitudes = await prisma.solicitud.findMany({
    include: { cliente: true, chofer: true }
  })

  // KPIs
  const totalServicios = solicitudes.length
  const totalHoras = reportes.reduce((s, r) => s + r.horas + (r.horasExtra ?? 0), 0)
  const totalMonto = reportes.reduce((s, r) => s + r.monto, 0)
  const pctCobrado = reportes.length > 0
    ? Math.round((reportes.filter(r => r.pagado).length / reportes.length) * 100)
    : 0

  // Distribución por tipo
  const tipoCount: Record<string, number> = {}
  solicitudes.forEach(s => {
    tipoCount[s.tipo] = (tipoCount[s.tipo] || 0) + 1
  })
  const tipos = Object.entries(tipoCount).sort((a, b) => b[1] - a[1])
  const maxTipo = tipos.length > 0 ? tipos[0][1] : 1

  // Top clientes
  const clienteCount: Record<string, { nombre: string, count: number, monto: number }> = {}
  solicitudes.forEach(s => {
    if (!clienteCount[s.clienteId]) clienteCount[s.clienteId] = { nombre: s.cliente.nombre, count: 0, monto: 0 }
    clienteCount[s.clienteId].count++
  })
  reportes.forEach(r => {
    const cId = r.solicitud.clienteId
    if (clienteCount[cId]) clienteCount[cId].monto += r.monto
  })
  const topClientes = Object.values(clienteCount).sort((a, b) => b.count - a.count).slice(0, 5)

  // Top choferes
  const choferCount: Record<string, { nombre: string, count: number, horas: number }> = {}
  reportes.forEach(r => {
    if (!choferCount[r.choferId]) choferCount[r.choferId] = { nombre: r.chofer.nombre, count: 0, horas: 0 }
    choferCount[r.choferId].count++
    choferCount[r.choferId].horas += r.horas
  })
  const topChoferes = Object.values(choferCount).sort((a, b) => b.horas - a.horas).slice(0, 5)

  const typeColors = ['bg-brand-accent', 'bg-brand-blue', 'bg-brand-success', 'bg-brand-purple', 'bg-brand-danger']

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-text m-0">Estadísticas</h1>
          <p className="text-[13px] text-brand-text-light mt-1">Métricas de operación y rendimiento</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <KpiCard icon={<BarChart3 size={20}/>} value={totalServicios} label="Total servicios" type="blue" />
        <KpiCard icon={<Clock size={20}/>} value={`${totalHoras}h`} label="Horas operadas" />
        <KpiCard icon={<TrendingUp size={20}/>} value={`$${(totalMonto/1000).toFixed(0)}k`} label="Monto total" type="success" />
        <KpiCard icon={<Users size={20}/>} value={`${pctCobrado}%`} label="Tasa de cobro" type={pctCobrado >= 70 ? 'success' : 'danger'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Distribución por tipo */}
        <div className="bg-brand-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-brand-border">
          <h2 className="text-sm sm:text-base font-bold text-brand-text mb-4 sm:mb-6">Servicios por Tipo</h2>
          <div className="flex flex-col gap-4">
            {tipos.map(([tipo, count], i) => (
              <div key={tipo}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[13px] font-semibold text-brand-text">{tipo}</span>
                  <span className="text-[13px] text-brand-text-mid font-bold">{count}</span>
                </div>
                <div className="w-full h-2.5 bg-brand-divider rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${typeColors[i % typeColors.length]}`}
                    style={{ width: `${(count / maxTipo) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {tipos.length === 0 && (
              <p className="text-[13px] text-brand-text-light italic">Sin datos</p>
            )}
          </div>
        </div>

        {/* Top Clientes */}
        <div className="bg-brand-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-brand-border">
          <h2 className="text-sm sm:text-base font-bold text-brand-text mb-4 sm:mb-6">Top Clientes</h2>
          <div className="flex flex-col">
            {topClientes.map((c, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-brand-divider last:border-0">
                <div className="w-8 h-8 rounded-full bg-brand-purple-bg text-brand-purple flex items-center justify-center text-[11px] font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-brand-text truncate">{c.nombre}</div>
                  <div className="text-[11px] text-brand-text-light">{c.count} servicios</div>
                </div>
                <div className="text-[13px] font-bold text-brand-text shrink-0">${(c.monto / 1000).toFixed(0)}k</div>
              </div>
            ))}
            {topClientes.length === 0 && (
              <p className="text-[13px] text-brand-text-light italic">Sin datos</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Choferes */}
      <div className="bg-brand-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-brand-border">
        <h2 className="text-sm sm:text-base font-bold text-brand-text mb-4 sm:mb-6">Rendimiento de Choferes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          {topChoferes.map((ch, i) => (
            <div key={i} className="bg-brand-bg rounded-xl p-4 border border-brand-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-accent to-brand-accent-dark flex items-center justify-center text-[12px] font-bold text-white shrink-0">
                  {ch.nombre.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-brand-text truncate">{ch.nombre}</div>
                  <div className="text-[11px] text-brand-text-light">{ch.count} reportes</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-brand-primary">{ch.horas}h</div>
              <div className="text-[11px] text-brand-text-light">Horas trabajadas</div>
            </div>
          ))}
          {topChoferes.length === 0 && (
            <p className="text-[13px] text-brand-text-light italic">Sin datos</p>
          )}
        </div>
      </div>
    </div>
  )
}
