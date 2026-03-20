import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticateRequest, unauthorizedResponse } from '@/lib/auth'
import { getCorsHeaders, corsOptions } from '@/lib/cors'
import { isNonEmptyString, isPositiveNumber } from '@/lib/validation'
import crypto from 'crypto'

export async function OPTIONS(req: Request) {
  return corsOptions(req)
}

export async function GET(req: Request) {
  const headers = getCorsHeaders(req)
  const auth = authenticateRequest(req)
  if (!auth) return unauthorizedResponse(headers)

  try {
    const reportes = await prisma.reporte.findMany({
      where: { choferId: auth.userId },
      include: {
        solicitud: {
          include: { cliente: { select: { nombre: true, telefono: true } } },
        },
      },
      orderBy: { creadoEn: 'desc' },
    })

    return NextResponse.json(reportes, { headers })
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener reportes' },
      { status: 500, headers }
    )
  }
}

export async function POST(req: Request) {
  const headers = getCorsHeaders(req)
  const auth = authenticateRequest(req)
  if (!auth) return unauthorizedResponse(headers)

  try {
    const data = await req.json()

    if (!isNonEmptyString(data.solicitudId) || !isPositiveNumber(data.horas) || !isNonEmptyString(data.descripcion)) {
      return NextResponse.json(
        { error: 'solicitudId, horas y descripcion son requeridos' },
        { status: 400, headers }
      )
    }

    const solicitud = await prisma.solicitud.findUnique({
      where: { id: data.solicitudId },
    })

    if (!solicitud) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404, headers }
      )
    }

    if (solicitud.choferId !== auth.userId) {
      return NextResponse.json(
        { error: 'Esta solicitud no está asignada a este chofer' },
        { status: 403, headers }
      )
    }

    const existingReport = await prisma.reporte.findUnique({
      where: { solicitudId: data.solicitudId },
    })

    if (existingReport) {
      return NextResponse.json(
        { error: 'Ya existe un reporte para esta solicitud' },
        { status: 409, headers }
      )
    }

    const horas = Math.max(0, Number(data.horas))
    const valorHora = solicitud.gruaId
      ? 60000
      : 45000

    const result = await prisma.$transaction(async (tx) => {
      const rptCodigo = `RPT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`

      const reporte = await tx.reporte.create({
        data: {
          codigo: rptCodigo,
          solicitudId: data.solicitudId,
          choferId: auth.userId,
          fecha: new Date().toLocaleDateString('es-CL'),
          horas,
          descripcion: String(data.descripcion).slice(0, 2000),
          evidencia: data.evidencia || null,
          valorHora,
          monto: horas * valorHora,
        },
      })

      await tx.solicitud.update({
        where: { id: data.solicitudId },
        data: { estado: 'COMPLETADA' },
      })

      return reporte
    })

    return NextResponse.json(result, { status: 201, headers })
  } catch {
    return NextResponse.json(
      { error: 'Error al crear reporte' },
      { status: 500, headers }
    )
  }
}
