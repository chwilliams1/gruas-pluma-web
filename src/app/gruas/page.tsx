import prisma from '@/lib/prisma'
import { NuevaGruaForm } from '@/components/NuevaGruaForm'
import { DeleteGruaBtn } from '@/components/DeleteGruaBtn'
import { ToggleEstadoGruaBtn } from '@/components/ToggleEstadoGruaBtn'
import { EditGruaBtn } from '@/components/EditGruaForm'
import { Gauge, Calendar, Weight, User } from 'lucide-react'

export const dynamic = 'force-dynamic'

const tipoStyles: Record<string, string> = {
  'Pluma': 'bg-[rgba(245,158,11,0.1)] text-brand-accent',
  'Telescópica': 'bg-brand-blue-bg text-brand-blue',
  'Articulada': 'bg-brand-purple-bg text-brand-purple',
}

export default async function GruasPage() {
  const gruas = await prisma.grua.findMany({
    include: {
      choferes: { select: { id: true, nombre: true, activo: true } },
      _count: { select: { solicitudes: true } }
    },
    orderBy: { creadoEn: 'desc' }
  })

  const disponibles = gruas.filter(g => g.estado === 'DISPONIBLE').length
  const enServicio = gruas.filter(g => g.estado === 'EN_SERVICIO').length
  const mantencion = gruas.filter(g => g.estado === 'MANTENCION').length

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-text m-0">Grúas</h1>
          <p className="text-[13px] text-brand-text-light mt-1">
            {gruas.length} grúas — {disponibles} disponibles, {enServicio} en servicio, {mantencion} en mantención
          </p>
        </div>
        <NuevaGruaForm />
      </div>

      <div className="bg-brand-card rounded-2xl overflow-hidden shadow-sm border border-brand-border">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-divider text-[11px] font-bold text-brand-text-light uppercase tracking-wider">
              <th className="py-3 px-6 border-b-2 border-brand-border">Grúa</th>
              <th className="py-3 px-6 border-b-2 border-brand-border">Tipo</th>
              <th className="py-3 px-6 border-b-2 border-brand-border">Capacidad</th>
              <th className="py-3 px-6 border-b-2 border-brand-border">Conductor(es)</th>
              <th className="py-3 px-6 border-b-2 border-brand-border text-center">Servicios</th>
              <th className="py-3 px-6 border-b-2 border-brand-border text-center">Estado</th>
              <th className="py-3 px-6 border-b-2 border-brand-border w-12"></th>
            </tr>
          </thead>
          <tbody>
            {gruas.map(g => (
              <tr key={g.id} className="hover:bg-brand-bg transition-colors border-b border-brand-divider last:border-0 group">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-[11px] font-bold text-brand-text shrink-0">
                      {g.patente.slice(0, 4)}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-brand-text">{g.patente}</div>
                      <div className="text-[11px] text-brand-text-light">
                        {g.marca} {g.modelo}
                        {g.anio && (
                          <span className="inline-flex items-center gap-0.5 ml-2">
                            <Calendar size={10} /> {g.anio}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${tipoStyles[g.tipo] || 'bg-brand-divider text-brand-text-light'}`}>
                    {g.tipo}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1.5">
                    <Weight size={13} className="text-brand-text-light" />
                    <span className="text-[13px] font-semibold text-brand-text">{g.capacidad}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  {g.choferes.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {g.choferes.map(ch => (
                        <div key={ch.id} className="flex items-center gap-1.5 text-[12px] text-brand-text-mid">
                          <User size={12} className="text-brand-text-light" />
                          <span>{ch.nombre}</span>
                          {!ch.activo && <span className="text-[10px] text-brand-danger">(inactivo)</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[12px] text-brand-text-light italic">Sin conductor</span>
                  )}
                </td>
                <td className="py-4 px-6 text-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-[13px] font-bold ${g._count.solicitudes > 0 ? 'bg-brand-blue-bg text-brand-blue' : 'bg-brand-divider text-brand-text-light'}`}>
                    {g._count.solicitudes}
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <ToggleEstadoGruaBtn gruaId={g.id} estado={g.estado} />
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1">
                    <EditGruaBtn grua={{ id: g.id, patente: g.patente, marca: g.marca, modelo: g.modelo, anio: g.anio, tipo: g.tipo, capacidad: g.capacidad, estado: g.estado }} />
                    <DeleteGruaBtn gruaId={g.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {gruas.length === 0 && (
          <div className="text-[13px] text-brand-text-light py-12 text-center italic">No hay grúas registradas</div>
        )}
      </div>
    </div>
  )
}
