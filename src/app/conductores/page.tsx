import prisma from '@/lib/prisma'
import { NuevoConductorForm } from '@/components/NuevoConductorForm'
import { DeleteConductorBtn } from '@/components/DeleteConductorBtn'
import { ToggleActivoBtn } from '@/components/ToggleActivoBtn'
import { EditConductorBtn } from '@/components/EditConductorForm'
import { Phone, Mail, CreditCard, Truck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ConductoresPage() {
  const conductores = await prisma.usuario.findMany({
    where: { rol: 'CHOFER' },
    include: {
      grua: true,
      _count: { select: { solicitudes: true, reportes: true } }
    },
    orderBy: { creadoEn: 'desc' }
  })

  const gruas = await prisma.grua.findMany({
    orderBy: { patente: 'asc' }
  })

  const activos = conductores.filter(c => c.activo).length

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-text m-0">Conductores</h1>
          <p className="text-[13px] text-brand-text-light mt-1">
            {conductores.length} conductores registrados — {activos} activos
          </p>
        </div>
        <NuevoConductorForm gruas={gruas.map(g => ({ id: g.id, patente: g.patente, marca: g.marca, modelo: g.modelo }))} />
      </div>

      <div className="bg-brand-card rounded-2xl overflow-hidden shadow-sm border border-brand-border">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-divider text-[11px] font-bold text-brand-text-light uppercase tracking-wider">
              <th className="py-3 px-6 border-b-2 border-brand-border">Conductor</th>
              <th className="py-3 px-6 border-b-2 border-brand-border">Contacto</th>
              <th className="py-3 px-6 border-b-2 border-brand-border">Licencia</th>
              <th className="py-3 px-6 border-b-2 border-brand-border">Grúa Asignada</th>
              <th className="py-3 px-6 border-b-2 border-brand-border text-center">Servicios</th>
              <th className="py-3 px-6 border-b-2 border-brand-border text-center">Estado</th>
              <th className="py-3 px-6 border-b-2 border-brand-border w-12"></th>
            </tr>
          </thead>
          <tbody>
            {conductores.map(c => (
              <tr key={c.id} className="hover:bg-brand-bg transition-colors border-b border-brand-divider last:border-0 group">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-blue-bg text-brand-blue flex items-center justify-center text-[12px] font-bold shrink-0">
                      {c.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-brand-text">{c.nombre}</div>
                      <div className="text-[11px] text-brand-text-light">Desde {c.creadoEn.toLocaleDateString('es-CL')}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1">
                    {c.email && (
                      <div className="flex items-center gap-1.5 text-[12px] text-brand-text-mid">
                        <Mail size={12} className="text-brand-text-light" />
                        {c.email}
                      </div>
                    )}
                    {c.telefono && (
                      <div className="flex items-center gap-1.5 text-[12px] text-brand-text-mid">
                        <Phone size={12} className="text-brand-text-light" />
                        {c.telefono}
                      </div>
                    )}
                    {!c.email && !c.telefono && <span className="text-[12px] text-brand-text-light">—</span>}
                  </div>
                </td>
                <td className="py-4 px-6">
                  {c.licencia ? (
                    <div className="flex items-center gap-1.5">
                      <CreditCard size={13} className="text-brand-text-light" />
                      <span className="px-2.5 py-0.5 rounded-md bg-brand-purple-bg text-brand-purple text-[12px] font-bold">{c.licencia}</span>
                    </div>
                  ) : (
                    <span className="text-[12px] text-brand-text-light">—</span>
                  )}
                </td>
                <td className="py-4 px-6">
                  {c.grua ? (
                    <div className="flex items-center gap-2">
                      <Truck size={14} className="text-brand-text-light" />
                      <div>
                        <div className="text-[12px] font-semibold text-brand-text">{c.grua.patente}</div>
                        <div className="text-[11px] text-brand-text-light">{c.grua.marca} {c.grua.modelo}</div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[12px] text-brand-text-light italic">Sin asignar</span>
                  )}
                </td>
                <td className="py-4 px-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-[13px] font-bold ${c._count.solicitudes > 0 ? 'bg-brand-blue-bg text-brand-blue' : 'bg-brand-divider text-brand-text-light'}`}>
                      {c._count.solicitudes}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  <ToggleActivoBtn conductorId={c.id} activo={c.activo} />
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1">
                    <EditConductorBtn
                      conductor={{ id: c.id, nombre: c.nombre, email: c.email, telefono: c.telefono, licencia: c.licencia, gruaId: c.gruaId }}
                      gruas={gruas.map(g => ({ id: g.id, patente: g.patente, marca: g.marca, modelo: g.modelo }))}
                    />
                    <DeleteConductorBtn conductorId={c.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {conductores.length === 0 && (
          <div className="text-[13px] text-brand-text-light py-12 text-center italic">No hay conductores registrados</div>
        )}
      </div>
    </div>
  )
}
