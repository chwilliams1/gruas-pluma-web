import prisma from '@/lib/prisma'
import { NuevoClienteForm } from '@/components/NuevoClienteForm'
import { DeleteClienteBtn } from '@/components/DeleteClienteBtn'
import { EditClienteBtn } from '@/components/EditClienteForm'
import { Phone, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    include: { _count: { select: { solicitudes: true } } },
    orderBy: { creadoEn: 'desc' }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-text m-0">Clientes</h1>
          <p className="text-[13px] text-brand-text-light mt-1">{clientes.length} clientes registrados</p>
        </div>
        <NuevoClienteForm />
      </div>

      <div className="bg-brand-card rounded-2xl overflow-hidden shadow-sm border border-brand-border">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-divider text-[11px] font-bold text-brand-text-light uppercase tracking-wider">
              <th className="py-3 px-6 border-b-2 border-brand-border">Cliente</th>
              <th className="py-3 px-6 border-b-2 border-brand-border">Teléfono</th>
              <th className="py-3 px-6 border-b-2 border-brand-border">Dirección</th>
              <th className="py-3 px-6 border-b-2 border-brand-border text-center">Solicitudes</th>
              <th className="py-3 px-6 border-b-2 border-brand-border w-12"></th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.id} className="hover:bg-brand-bg transition-colors border-b border-brand-divider last:border-0 group">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-purple-bg text-brand-purple flex items-center justify-center text-[12px] font-bold shrink-0">
                      {c.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-brand-text">{c.nombre}</div>
                      <div className="text-[11px] text-brand-text-light">Desde {c.creadoEn.toLocaleDateString('es-CL')}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1.5 text-[13px] text-brand-text-mid">
                    <Phone size={13} className="text-brand-text-light" />
                    {c.telefono || '—'}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1.5 text-[13px] text-brand-text-mid">
                    <MapPin size={13} className="text-brand-text-light" />
                    {c.direccion || '—'}
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-[13px] font-bold ${c._count.solicitudes > 0 ? 'bg-brand-blue-bg text-brand-blue' : 'bg-brand-divider text-brand-text-light'
                    }`}>
                    {c._count.solicitudes}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1">
                    <EditClienteBtn cliente={{ id: c.id, nombre: c.nombre, telefono: c.telefono, direccion: c.direccion }} />
                    <DeleteClienteBtn clienteId={c.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clientes.length === 0 && (
          <div className="text-[13px] text-brand-text-light py-12 text-center italic">No hay clientes registrados</div>
        )}
      </div>
    </div>
  )
}
