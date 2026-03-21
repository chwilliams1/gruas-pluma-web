import prisma from '@/lib/prisma'
import { Badge } from '@/components/ui/Badge'
import { AssignForm } from '@/components/AssignForm'
import { NuevaSolicitudForm } from '@/components/NuevaSolicitudForm'
import { SearchFilterBar, Pagination } from '@/components/SearchFilterBar'
import { Prisma } from '@prisma/client'
import { formatFecha } from '@/lib/formatDate'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

export default async function SolicitudesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams
  const q = params.q || ''
  const estado = params.estado || ''
  const page = Math.max(1, parseInt(params.page || '1', 10))

  const where: Prisma.SolicitudWhereInput = {}

  if (q) {
    where.OR = [
      { codigo: { contains: q, mode: 'insensitive' } },
      { descripcion: { contains: q, mode: 'insensitive' } },
      { direccion: { contains: q, mode: 'insensitive' } },
      { cliente: { nombre: { contains: q, mode: 'insensitive' } } },
    ]
  }

  if (estado) {
    where.estado = estado
  }

  const [solicitudes, totalCount] = await Promise.all([
    prisma.solicitud.findMany({
      where,
      include: { cliente: true, chofer: true },
      orderBy: { creadoEn: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.solicitud.count({ where }),
  ])

  const choferes = await prisma.usuario.findMany({
    where: { rol: 'CHOFER' },
    select: { id: true, nombre: true }
  })
  const clientes = await prisma.cliente.findMany({
    select: { id: true, nombre: true }
  })

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-text m-0">Solicitudes de Servicio</h1>
          <p className="text-[13px] text-brand-text-light mt-1">{totalCount} solicitudes</p>
        </div>
        <NuevaSolicitudForm clientes={clientes} />
      </div>

      <SearchFilterBar
        placeholder="Buscar por codigo, cliente, direccion..."
        filters={[
          {
            key: 'estado',
            label: 'Estado',
            options: [
              { label: 'Nueva', value: 'NUEVA' },
              { label: 'Asignada', value: 'ASIGNADA' },
              { label: 'En camino', value: 'EN_CAMINO' },
              { label: 'En sitio', value: 'EN_SITIO' },
              { label: 'En progreso', value: 'EN_PROGRESO' },
              { label: 'Completada', value: 'COMPLETADA' },
            ]
          }
        ]}
      />

      <div className="flex flex-col gap-3 sm:gap-4">
        {solicitudes.map(s => (
          <div key={s.id} className={`bg-brand-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-brand-border border-l-4 ${s.estado === 'NUEVA' ? 'border-l-brand-warning' : s.estado === 'ASIGNADA' ? 'border-l-brand-blue' : 'border-l-brand-success'}`}>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-3 sm:mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-brand-primary">{s.cliente.nombre}</span>
                <Badge type={s.estado === 'NUEVA' ? 'warning' : s.estado === 'COMPLETADA' ? 'success' : 'blue'}>
                  {s.estado === 'NUEVA' ? 'Nueva solicitud' : s.estado === 'ASIGNADA' ? `Asignada a ${s.chofer?.nombre}` : s.estado === 'COMPLETADA' ? 'Completada' : s.estado.replace('_', ' ')}
                </Badge>
              </div>
              <span className="text-[12px] sm:text-[13px] text-brand-text-light">{s.codigo}</span>
            </div>

            <div className="text-[13px] sm:text-[14px] text-brand-text mb-3 sm:mb-4">
              {s.descripcion}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] sm:text-[13px] text-brand-text-light mb-4 sm:mb-5">
              <span>📅 {formatFecha(s.fecha)}</span>
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

      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  )
}
