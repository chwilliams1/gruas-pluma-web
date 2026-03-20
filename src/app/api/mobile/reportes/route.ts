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

    // Determine flow: "asignado" (has solicitudId) or "directo" (has clienteNombre)
    const isDirecto = !data.solicitudId && isNonEmptyString(data.clienteNombre)

    if (!isDirecto) {
      // === Flow: Servicio asignado (original) ===
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

      const horasReales = Math.max(0, Number(data.horas))
      const horasCobradas = Math.max(3, horasReales)
      const conAlzahombre = !!data.conAlzahombre
      const valorHora = conAlzahombre ? 65000 : 60000

      const result = await prisma.$transaction(async (tx) => {
        const rptCodigo = `RPT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`

        const reporte = await tx.reporte.create({
          data: {
            codigo: rptCodigo,
            solicitudId: data.solicitudId,
            choferId: auth.userId,
            fecha: new Date().toLocaleDateString('es-CL'),
            horas: horasReales,
            descripcion: String(data.descripcion).slice(0, 2000),
            evidencia: data.evidencia || null,
            conAlzahombre,
            valorHora,
            monto: horasCobradas * valorHora,
          },
        })

        await tx.solicitud.update({
          where: { id: data.solicitudId },
          data: { estado: 'COMPLETADA' },
        })

        return reporte
      })

      return NextResponse.json(result, { status: 201, headers })

    } else {
      // === Flow: Cliente directo ===
      if (!isPositiveNumber(data.horas) || !isNonEmptyString(data.descripcion)) {
        return NextResponse.json(
          { error: 'clienteNombre, horas y descripcion son requeridos' },
          { status: 400, headers }
        )
      }

      if (!isNonEmptyString(data.direccion)) {
        return NextResponse.json(
          { error: 'direccion es requerida para cliente directo' },
          { status: 400, headers }
        )
      }

      const horasReales = Math.max(0, Number(data.horas))
      const horasCobradas = Math.max(3, horasReales)
      const conAlzahombre = !!data.conAlzahombre
      const valorHora = conAlzahombre ? 65000 : 60000

      const result = await prisma.$transaction(async (tx) => {
        // 1. Create client
        const cliente = await tx.cliente.create({
          data: {
            nombre: String(data.clienteNombre).trim().slice(0, 500),
            telefono: data.clienteTelefono ? String(data.clienteTelefono).trim().slice(0, 50) : null,
            direccion: String(data.direccion).trim().slice(0, 500),
          },
        })

        // 2. Create solicitud
        const solCodigo = `SOL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
        const solicitud = await tx.solicitud.create({
          data: {
            codigo: solCodigo,
            clienteId: cliente.id,
            choferId: auth.userId,
            tipo: data.tipo || 'Otro',
            descripcion: String(data.descripcion).slice(0, 2000),
            fecha: new Date().toLocaleDateString('es-CL'),
            hora: data.horaInicio || 'Sin especificar',
            direccion: String(data.direccion).trim().slice(0, 500),
            estado: 'COMPLETADA',
          },
        })

        // 3. Create reporte
        const rptCodigo = `RPT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
        const reporte = await tx.reporte.create({
          data: {
            codigo: rptCodigo,
            solicitudId: solicitud.id,
            choferId: auth.userId,
            fecha: new Date().toLocaleDateString('es-CL'),
            horas: horasReales,
            descripcion: String(data.descripcion).slice(0, 2000),
            evidencia: data.evidencia || null,
            conAlzahombre,
            pagado: !!data.pagado,
            factura: !!data.factura,
            valorHora,
            monto: horasCobradas * valorHora,
          },
        })

        return reporte
      })

      return NextResponse.json(result, { status: 201, headers })
    }
  } catch {
    return NextResponse.json(
      { error: 'Error al crear reporte' },
      { status: 500, headers }
    )
  }
}
