'use client'

import { toggleActivoConductor } from '@/lib/actions'
import { useTransition } from 'react'

export function ToggleActivoBtn({ conductorId, activo }: { conductorId: string, activo: boolean }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => toggleActivoConductor(conductorId))}
      disabled={isPending}
      className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer border-none transition-colors duration-150 disabled:opacity-50 ${
        activo
          ? 'bg-success-subtle text-success hover:bg-success-light'
          : 'bg-danger-subtle text-danger hover:bg-danger-light'
      }`}
    >
      {isPending ? '...' : activo ? 'Activo' : 'Inactivo'}
    </button>
  )
}
