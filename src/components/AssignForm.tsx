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
    <form onSubmit={handleSubmit} className="flex gap-3 items-center">
      <select
        name="choferId"
        className="px-4 py-2.5 rounded-lg border border-brand-border text-[13px] min-w-[200px] outline-none bg-brand-bg text-brand-text focus:border-brand-accent transition-colors"
      >
        <option value="">Asignar chofer...</option>
        {choferes.map(c => (
          <option key={c.id} value={c.id}>{c.nombre}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accent-dark transition-colors text-white text-[13px] font-bold cursor-pointer border-none shadow-sm disabled:opacity-50"
      >
        {isPending ? 'Asignando...' : 'Asignar y notificar'}
      </button>
    </form>
  )
}
