export function formatFecha(fecha: string | Date | null | undefined): string {
  if (!fecha) return '-'
  if (fecha instanceof Date) return fecha.toLocaleDateString('es-CL')
  const d = new Date(fecha)
  if (!isNaN(d.getTime())) return d.toLocaleDateString('es-CL')
  // Already a display string like "19 Mar 2026"
  return fecha
}

export function toInputDate(fecha: string | Date | null | undefined): string {
  if (!fecha) return ''
  if (fecha instanceof Date) return fecha.toISOString().slice(0, 10)
  const d = new Date(fecha)
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  return ''
}
