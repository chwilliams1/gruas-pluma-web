'use client'

import { togglePagado } from '@/lib/actions'
import { useTransition } from 'react'

export function TogglePagadoBtn({ reporteId, pagado }: { reporteId: string, pagado: boolean }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => togglePagado(reporteId))}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold cursor-pointer border-none transition-all hover:scale-105 disabled:opacity-50 ${
        pagado
          ? 'bg-brand-success-bg text-brand-success'
          : 'bg-brand-danger-bg text-brand-danger'
      }`}
    >
      {isPending ? '...' : pagado ? '✓ Pagado' : '○ Por cobrar'}
    </button>
  )
}
