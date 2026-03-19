'use client'

import { updateEstadoGrua } from '@/lib/actions'
import { useTransition } from 'react'

const estadoStyles: Record<string, string> = {
  DISPONIBLE: 'bg-brand-success-bg text-brand-success',
  EN_SERVICIO: 'bg-brand-blue-bg text-brand-blue',
  MANTENCION: 'bg-[rgba(245,158,11,0.1)] text-brand-accent',
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
      className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer border-none transition-all disabled:opacity-50 ${estadoStyles[estado] || ''}`}
      title={`Cambiar a ${estadoLabels[nextEstado[estado]]}`}
    >
      {isPending ? '...' : estadoLabels[estado] || estado}
    </button>
  )
}
