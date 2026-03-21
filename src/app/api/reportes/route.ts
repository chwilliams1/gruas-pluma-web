import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { isNonEmptyString, isPositiveNumber } from '@/lib/validation'
import { nextReporteCodigo } from '@/lib/correlativo'
import crypto from 'crypto'

export async function GET() {
  try {
    const reportes = await prisma.reporte.findMany({
      include: {
        solicitud: { include: { cliente: true } },
        chofer: { select: { id: true, nombre: true, email: true } }
      },
      orderBy: { creadoEn: 'desc' }
    })
    return NextResponse.json(reportes)
  } catch {
    return NextResponse.json({ error: 'Error al obtener reportes' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    if (!isNonEmptyString(data.solicitudId) || !isNonEmptyString(data.choferId) ||
        !isPositiveNumber(data.horas) || !isNonEmptyString(data.descripcion)) {
      return NextResponse.json(
        { error: 'solicitudId, choferId, horas y descripcion son requeridos' },
        { status: 400 }
      )
    }

    // Verify solicitud exists and has no report yet
    const solicitud = await prisma.solicitud.findUnique({ where: { id: data.solicitudId } })
    if (!solicitud) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 })
    }

    const existingReport = await prisma.reporte.findUnique({ where: { solicitudId: data.solicitudId } })
    if (existingReport) {
      return NextResponse.json({ error: 'Ya existe un reporte para esta solicitud' }, { status: 409 })
    }

    const horas = Math.max(0, Number(data.horas))
    const valorHora = Number(data.valorHora) || 60000

    const result = await prisma.$transaction(async (tx) => {
      const { codigo, numeroReporte } = await nextReporteCodigo(tx)

      const reporte = await tx.reporte.create({
        data: {
          codigo,
          numeroReporte,
          solicitudId: data.solicitudId,
          choferId: data.choferId,
          fecha: new Date(),
          horas,
          descripcion: String(data.descripcion).slice(0, 2000),
          evidencia: data.evidencia || null,
          pagado: Boolean(data.pagado),
          factura: Boolean(data.factura),
          estadoReporte: data.factura ? 'POR FACTURAR' : 'SIN FACTURA',
          valorHora,
          monto: horas * valorHora,
        }
      })

      await tx.solicitud.update({
        where: { id: data.solicitudId },
        data: { estado: 'COMPLETADA' }
      })

      return reporte
    })

    return NextResponse.json(result, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear reporte' }, { status: 500 })
  }
}
