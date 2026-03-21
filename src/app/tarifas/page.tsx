import prisma from '@/lib/prisma'
import { EditTarifaForm } from '@/components/EditTarifaForm'

export const dynamic = 'force-dynamic'

export default async function TarifasPage() {
  const tarifas = await prisma.tarifa.findMany({
    orderBy: { nombre: 'asc' },
  })

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-[-0.02em] m-0">Tarifas</h1>
        <p className="text-[13px] text-ink-tertiary mt-1">Configura los precios por hora y minimo de horas</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tarifas.map(t => (
          <div key={t.id} className="bg-surface-0 rounded-xl p-5 border border-edge shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-semibold text-ink capitalize">{t.nombre}</h3>
                <p className="text-[12px] text-ink-tertiary mt-0.5">
                  {t.activa ? 'Activa' : 'Inactiva'}
                </p>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${t.activa ? 'bg-success' : 'bg-ink-muted'}`} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-canvas rounded-lg p-3">
                <p className="text-[10px] text-ink-tertiary uppercase tracking-wider mb-1">Valor/hora</p>
                <p className="text-[18px] font-bold text-ink">${t.valorHora.toLocaleString('es-CL')}</p>
              </div>
              <div className="bg-canvas rounded-lg p-3">
                <p className="text-[10px] text-ink-tertiary uppercase tracking-wider mb-1">Min. horas</p>
                <p className="text-[18px] font-bold text-ink">{t.minimoHoras}h</p>
              </div>
            </div>
            <EditTarifaForm tarifa={{ id: t.id, nombre: t.nombre, valorHora: t.valorHora, minimoHoras: t.minimoHoras, activa: t.activa }} />
          </div>
        ))}

        {tarifas.length === 0 && (
          <div className="col-span-full text-center text-ink-tertiary text-[13px] py-12">
            No hay tarifas configuradas
          </div>
        )}
      </div>
    </div>
  )
}
