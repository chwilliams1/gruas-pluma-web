'use client'

import { toggleActivoConductor } from '@/lib/actions'
import { useTransition } from 'react'

export function ToggleActivoBtn({ conductorId, activo }: { conductorId: string, activo: boolean }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => toggleActivoConductor(conductorId))}
      disabled={isPending}
      className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer border-none transition-all disabled:opacity-50 ${
        activo
          ? 'bg-brand-success-bg text-brand-success hover:bg-[rgba(16,185,129,0.2)]'
          : 'bg-brand-danger-bg text-brand-danger hover:bg-[rgba(239,68,68,0.2)]'
      }`}
    >
      {isPending ? '...' : activo ? 'Activo' : 'Inactivo'}
    </button>
  )
}
