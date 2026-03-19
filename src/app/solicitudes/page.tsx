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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-text m-0">Solicitudes de Servicio</h1>
          <p className="text-[13px] text-brand-text-light mt-1">{solicitudes.length} solicitudes</p>
        </div>
        <NuevaSolicitudForm clientes={clientes} />
      </div>

      <div className="flex flex-col gap-4">
        {solicitudes.map(s => (
          <div key={s.id} className={`bg-brand-card rounded-2xl p-6 shadow-sm border border-brand-border border-l-4 ${s.estado === 'NUEVA' ? 'border-l-brand-warning' : s.estado === 'ASIGNADA' ? 'border-l-brand-blue' : 'border-l-brand-success'}`}>
            <div className="flex justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-brand-primary">{s.cliente.nombre}</span>
                <Badge type={s.estado === 'NUEVA' ? 'warning' : s.estado === 'ASIGNADA' ? 'blue' : 'success'}>
                  {s.estado === 'NUEVA' ? 'Nueva solicitud' : s.estado === 'ASIGNADA' ? `Asignada a ${s.chofer?.nombre}` : 'Completada'}
                </Badge>
              </div>
              <span className="text-[13px] text-brand-text-light">{s.codigo}</span>
            </div>
            
            <div className="text-[14px] text-brand-text mb-4">
              {s.descripcion}
            </div>

            <div className="flex gap-6 text-[13px] text-brand-text-light mb-5 flex-wrap">
              <span>📅 {s.fecha}</span>
              <span>🕐 {s.hora}</span>
              <span>📍 {s.direccion}</span>
              <span>📞 {s.cliente.telefono}</span>
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
