'use client'

import { cycleEstadoReporte } from '@/lib/actions'
import { useTransition } from 'react'

const estadoStyle = (estado: string) => {
  switch (estado) {
    case 'FACTURADO': return 'bg-info-subtle text-info hover:bg-info-light'
    case 'POR FACTURAR': return 'bg-warning-subtle text-warning hover:bg-warning-light'
    case 'ESPERA OC': return 'bg-amber-100 text-amber-700 hover:bg-amber-200'
    default: return 'bg-[rgba(0,0,0,0.04)] text-ink-tertiary hover:bg-[rgba(0,0,0,0.08)]'
  }
}

const estadoLabel: Record<string, string> = {
  'SIN FACTURA': 'Sin factura',
  'POR FACTURAR': 'Por facturar',
  'FACTURADO': 'Facturado',
  'ESPERA OC': 'Espera OC',
}

export function CycleEstadoBtn({ reporteId, estado }: { reporteId: string, estado: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => cycleEstadoReporte(reporteId))}
      disabled={isPending}
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer border-none transition-colors duration-150 disabled:opacity-50 ${estadoStyle(estado)}`}
    >
      {isPending ? '...' : estadoLabel[estado] ?? estado}
    </button>
  )
}
