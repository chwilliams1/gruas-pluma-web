'use client'

import { togglePagado } from '@/lib/actions'
import { useTransition } from 'react'

export function TogglePagadoBtn({ reporteId, pagado }: { reporteId: string, pagado: boolean }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => togglePagado(reporteId))}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer border-none transition-colors duration-150 disabled:opacity-50 ${
        pagado
          ? 'bg-success-subtle text-success hover:bg-success-light'
          : 'bg-danger-subtle text-danger hover:bg-danger-light'
      }`}
    >
      {isPending ? '...' : pagado ? '✓ Pagado' : '○ Por cobrar'}
    </button>
  )
}
