'use client'

import { updateEstadoGrua } from '@/lib/actions'
import { useTransition } from 'react'

const estadoStyles: Record<string, string> = {
  DISPONIBLE: 'bg-success-subtle text-success',
  EN_SERVICIO: 'bg-info-subtle text-info',
  MANTENCION: 'bg-amber-subtle text-amber',
}

const estadoLabels: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  EN_SERVICIO: 'En Servicio',
  MANTENCION: 'Mantención',
}

const nextEstado: Record<string, string> = {
  DISPONIBLE: 'EN_SERVICIO',
  EN_SERVICIO: 'MANTENCION',
  MANTENCION: 'DISPONIBLE',
}

export function ToggleEstadoGruaBtn({ gruaId, estado }: { gruaId: string, estado: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => updateEstadoGrua(gruaId, nextEstado[estado]))}
      disabled={isPending}
      className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer border-none transition-colors duration-150 disabled:opacity-50 ${estadoStyles[estado] || ''}`}
      title={`Cambiar a ${estadoLabels[nextEstado[estado]]}`}
    >
      {isPending ? '...' : estadoLabels[estado] || estado}
    </button>
  )
}
