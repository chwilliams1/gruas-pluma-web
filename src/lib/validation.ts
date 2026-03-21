// Validation schemas and helpers

// ─── Enum values ───
export const ROLES = ['ADMIN', 'CHOFER'] as const
export const ESTADOS_SOLICITUD = ['NUEVA', 'ASIGNADA', 'EN_CAMINO', 'EN_SITIO', 'EN_PROGRESO', 'COMPLETADA'] as const
export const TIPOS_SOLICITUD = ['Izaje', 'Montaje', 'Descarga', 'Traslado', 'Otro'] as const
export const ESTADOS_GRUA = ['DISPONIBLE', 'EN_SERVICIO', 'MANTENCION'] as const
export const TIPOS_GRUA = ['Pluma', 'Telescópica', 'Articulada'] as const
export const ESTADOS_REPORTE = ['SIN FACTURA', 'POR FACTURAR', 'FACTURADO', 'ESPERA OC'] as const

export type EstadoSolicitud = typeof ESTADOS_SOLICITUD[number]
export type TipoSolicitud = typeof TIPOS_SOLICITUD[number]
export type EstadoGrua = typeof ESTADOS_GRUA[number]
export type EstadoReporte = typeof ESTADOS_REPORTE[number]

// ─── Validation helpers ───

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function isValidEnum<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
}

export function isPositiveNumber(value: unknown): boolean {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return typeof n === 'number' && !isNaN(n) && n >= 0 && isFinite(n)
}

export function safeParseFloat(value: string | null, defaultValue: number = 0): number {
  if (!value) return defaultValue
  const n = parseFloat(value)
  if (isNaN(n) || !isFinite(n)) return defaultValue
  return Math.max(0, n)
}

export function safeParseInt(value: string | null, defaultValue: number | null = null): number | null {
  if (!value) return defaultValue
  const n = parseInt(value, 10)
  if (isNaN(n)) return defaultValue
  return n
}

// Max lengths to prevent abuse
const MAX_STRING_LENGTH = 500
const MAX_DESCRIPTION_LENGTH = 2000

export function sanitizeString(value: string, maxLength: number = MAX_STRING_LENGTH): string {
  return value.trim().slice(0, maxLength)
}

export function sanitizeDescription(value: string): string {
  return value.trim().slice(0, MAX_DESCRIPTION_LENGTH)
}

// ─── Form validation ───

export interface ValidationError {
  field: string
  message: string
}

export function validateRequired(fields: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = []
  for (const [field, value] of Object.entries(fields)) {
    if (!isNonEmptyString(value)) {
      errors.push({ field, message: `${field} es requerido` })
    }
  }
  return errors
}

// ─── JSON parsing ───

export function safeJsonParse<T>(jsonData: string): { data: T | null; error: string | null } {
  try {
    const data = JSON.parse(jsonData) as T
    return { data, error: null }
  } catch {
    return { data: null, error: 'JSON inválido' }
  }
}
