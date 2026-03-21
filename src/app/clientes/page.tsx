import prisma from '@/lib/prisma'
import { NuevoClienteForm } from '@/components/NuevoClienteForm'
import { ImportClientesCSV } from '@/components/ImportClientesCSV'
import { DeleteClienteBtn } from '@/components/DeleteClienteBtn'
import { EditClienteBtn } from '@/components/EditClienteForm'
import { Phone, MapPin } from 'lucide-react'
import { SearchFilterBar, Pagination } from '@/components/SearchFilterBar'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25

export default async function ClientesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams
  const q = params.q || ''
  const page = Math.max(1, parseInt(params.page || '1', 10))

  const where: Prisma.ClienteWhereInput = {}

  if (q) {
    where.OR = [
      { nombre: { contains: q, mode: 'insensitive' } },
      { rut: { contains: q, mode: 'insensitive' } },
      { telefono: { contains: q, mode: 'insensitive' } },
      { direccion: { contains: q, mode: 'insensitive' } },
    ]
  }

  const [clientes, totalCount] = await Promise.all([
    prisma.cliente.findMany({
      where,
      include: { _count: { select: { solicitudes: true } } },
      orderBy: { creadoEn: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.cliente.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-text m-0">Clientes</h1>
          <p className="text-[13px] text-brand-text-light mt-1">{totalCount} clientes registrados</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <NuevoClienteForm />
          <ImportClientesCSV />
        </div>
      </div>

      <SearchFilterBar placeholder="Buscar por nombre, RUT, telefono..." />

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {clientes.map(c => (
          <div key={c.id} className="bg-brand-card rounded-xl p-4 shadow-sm border border-brand-border">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-brand-purple-bg text-brand-purple flex items-center justify-center text-[12px] font-bold shrink-0">
                  {c.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-brand-text truncate">{c.nombre}</div>
                  <div className="text-[11px] text-brand-text-light">{c.rut || 'Sin RUT'}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <EditClienteBtn cliente={{ id: c.id, nombre: c.nombre, rut: c.rut, telefono: c.telefono, direccion: c.direccion }} />
                <DeleteClienteBtn clienteId={c.id} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 text-[12px] text-brand-text-mid">
              {c.telefono && (
                <div className="flex items-center gap-1.5">
                  <Phone size={12} className="text-brand-text-light shrink-0" />
                  <span className="truncate">{c.telefono}</span>
                </div>
              )}
              {c.direccion && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-brand-text-light shrink-0" />
                  <span className="truncate">{c.direccion}</span>
                </div>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-brand-divider flex items-center justify-between text-[11px] text-brand-text-light">
              <span>Desde {c.creadoEn.toLocaleDateString('es-CL')}</span>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-bold ${c._count.solicitudes > 0 ? 'bg-brand-blue-bg text-brand-blue' : 'bg-brand-divider text-brand-text-light'}`}>
                {c._count.solicitudes} solicitudes
              </span>
            </div>
          </div>
        ))}
        {clientes.length === 0 && (
          <div className="text-[13px] text-brand-text-light py-12 text-center italic bg-brand-card rounded-xl border border-brand-border">No hay clientes registrados</div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-brand-card rounded-2xl overflow-hidden shadow-sm border border-brand-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-divider text-[11px] font-bold text-brand-text-light uppercase tracking-wider">
                <th className="py-3 px-6 border-b-2 border-brand-border">Cliente</th>
                <th className="py-3 px-6 border-b-2 border-brand-border">RUT</th>
                <th className="py-3 px-6 border-b-2 border-brand-border">Telefono</th>
                <th className="py-3 px-6 border-b-2 border-brand-border">Direccion</th>
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
                    <span className="text-[12px] text-brand-text-mid font-mono">{c.rut || '—'}</span>
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
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-[13px] font-bold ${c._count.solicitudes > 0 ? 'bg-brand-blue-bg text-brand-blue' : 'bg-brand-divider text-brand-text-light'}`}>
                      {c._count.solicitudes}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1">
                      <EditClienteBtn cliente={{ id: c.id, nombre: c.nombre, rut: c.rut, telefono: c.telefono, direccion: c.direccion }} />
                      <DeleteClienteBtn clienteId={c.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {clientes.length === 0 && (
          <div className="text-[13px] text-brand-text-light py-12 text-center italic">No hay clientes registrados</div>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  )
}
