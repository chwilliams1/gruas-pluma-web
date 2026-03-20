import prisma from '@/lib/prisma'
import { Badge } from '@/components/ui/Badge'
import { AssignForm } from '@/components/AssignForm'
import { NuevaSolicitudForm } from '@/components/NuevaSolicitudForm'

export const dynamic = 'force-dynamic'

export default async function SolicitudesPage() {
  const solicitudes = await prisma.solicitud.findMany({
    include: { cliente: true, chofer: true },
    orderBy: { creadoEn: 'desc' }
  })
  const choferes = await prisma.usuario.findMany({
    where: { rol: 'CHOFER' },
    select: { id: true, nombre: true }
  })
  const clientes = await prisma.cliente.findMany({
    select: { id: true, nombre: true }
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-text m-0">Solicitudes de Servicio</h1>
          <p className="text-[13px] text-brand-text-light mt-1">{solicitudes.length} solicitudes</p>
        </div>
        <NuevaSolicitudForm clientes={clientes} />
      </div>

      <div className="flex flex-col gap-3 sm:gap-4">
        {solicitudes.map(s => (
          <div key={s.id} className={`bg-brand-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-brand-border border-l-4 ${s.estado === 'NUEVA' ? 'border-l-brand-warning' : s.estado === 'ASIGNADA' ? 'border-l-brand-blue' : 'border-l-brand-success'}`}>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-3 sm:mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-brand-primary">{s.cliente.nombre}</span>
                <Badge type={s.estado === 'NUEVA' ? 'warning' : s.estado === 'ASIGNADA' ? 'blue' : 'success'}>
                  {s.estado === 'NUEVA' ? 'Nueva solicitud' : s.estado === 'ASIGNADA' ? `Asignada a ${s.chofer?.nombre}` : 'Completada'}
                </Badge>
              </div>
              <span className="text-[12px] sm:text-[13px] text-brand-text-light">{s.codigo}</span>
            </div>

            <div className="text-[13px] sm:text-[14px] text-brand-text mb-3 sm:mb-4">
              {s.descripcion}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] sm:text-[13px] text-brand-text-light mb-4 sm:mb-5">
              <span>📅 {s.fecha}</span>
              <span>🕐 {s.hora}</span>
              <span>📍 {s.direccion}</span>
              {s.cliente.telefono && <span>📞 {s.cliente.telefono}</span>}
              <span>🔧 {s.tipo}</span>
            </div>

            {s.estado === 'NUEVA' && (
              <AssignForm solicitudId={s.id} choferes={choferes} />
            )}
          </div>
        ))}

        {solicitudes.length === 0 && (
          <div className="text-[13px] text-brand-text-light py-12 text-center italic bg-brand-card rounded-2xl border border-brand-border">No hay solicitudes</div>
        )}
      </div>
    </div>
  )
}
