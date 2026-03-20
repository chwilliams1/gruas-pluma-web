'use client'

import { assignDriver } from '@/lib/actions'
import { useTransition } from 'react'

export function AssignForm({ solicitudId, choferes }: { solicitudId: string, choferes: { id: string, nombre: string }[] }) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const choferId = formData.get('choferId') as string
    if (!choferId) return
    startTransition(() => assignDriver(solicitudId, choferId))
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:items-center">
      <select
        name="choferId"
        className="px-3 py-2.5 rounded-lg border border-control-border bg-control-bg text-[13px] text-ink sm:min-w-[200px] outline-none transition-colors duration-150 focus:border-amber focus:ring-2 focus:ring-control-focus"
      >
        <option value="">Asignar chofer...</option>
        {choferes.map(c => (
          <option key={c.id} value={c.id}>{c.nombre}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2.5 rounded-lg bg-amber hover:bg-amber-hover transition-colors duration-150 text-white text-[13px] font-medium cursor-pointer border-none disabled:opacity-50"
      >
        {isPending ? 'Asignando...' : 'Asignar'}
      </button>
    </form>
  )
}
