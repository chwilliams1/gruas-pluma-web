import type { PrismaClient } from '@prisma/client'

type TxOrPrisma = PrismaClient | Parameters<Parameters<PrismaClient['$transaction']>[0]>[0]

export async function nextReporteCodigo(tx: TxOrPrisma): Promise<{ codigo: string; numeroReporte: number }> {
  const last = await (tx as any).reporte.findFirst({
    orderBy: { numeroReporte: 'desc' },
    where: { numeroReporte: { not: null } },
    select: { numeroReporte: true },
  })
  const next = (last?.numeroReporte ?? 0) + 1
  return {
    codigo: `RPT-${String(next).padStart(4, '0')}`,
    numeroReporte: next,
  }
}

export async function nextSolicitudCodigo(tx: TxOrPrisma): Promise<string> {
  const last = await (tx as any).solicitud.findFirst({
    orderBy: { creadoEn: 'desc' },
    select: { codigo: true },
  })
  // Extract number from SOL-XXXX pattern
  const match = last?.codigo?.match(/SOL-(\d+)/)
  const next = match ? parseInt(match[1], 10) + 1 : 1
  return `SOL-${String(next).padStart(4, '0')}`
}
