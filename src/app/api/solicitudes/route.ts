import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCorsHeaders, corsOptions } from '@/lib/cors'
import { isNonEmptyString, isValidEnum, ESTADOS_SOLICITUD, sanitizeString, sanitizeDescription } from '@/lib/validation'
import { nextSolicitudCodigo } from '@/lib/correlativo'
import crypto from 'crypto'

export async function OPTIONS(req: Request) {
  return corsOptions(req)
}

export async function GET(req: Request) {
  const headers = getCorsHeaders(req)
  const { searchParams } = new URL(req.url)
  const choferId = searchParams.get('choferId')
  const estado = searchParams.get('estado')

  const where: Record<string, string> = {}
  if (isNonEmptyString(choferId)) where.choferId = choferId
  if (estado && isValidEnum(estado, ESTADOS_SOLICITUD)) where.estado = estado

  try {
    const solicitudes = await prisma.solicitud.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        cliente: true,
        chofer: { select: { id: true, nombre: true } },
      },
      orderBy: { creadoEn: 'desc' }
    })
    return NextResponse.json(solicitudes, { headers })
  } catch {
    return NextResponse.json({ error: 'Error al obtener solicitudes' }, { status: 500, headers })
  }
}

export async function POST(req: Request) {
  const headers = getCorsHeaders(req)
  try {
    const data = await req.json()

    if (!isNonEmptyString(data.clienteId) || !isNonEmptyString(data.tipo) ||
        !isNonEmptyString(data.descripcion) || !isNonEmptyString(data.fecha) ||
        !isNonEmptyString(data.hora) || !isNonEmptyString(data.direccion)) {
      return NextResponse.json(
        { error: 'clienteId, tipo, descripcion, fecha, hora y direccion son requeridos' },
        { status: 400, headers }
      )
    }

    // Verify client exists
    const cliente = await prisma.cliente.findUnique({ where: { id: data.clienteId } })
    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404, headers })
    }

    const codigo = await nextSolicitudCodigo(prisma)

    const solicitud = await prisma.solicitud.create({
      data: {
        codigo,
        clienteId: data.clienteId,
        tipo: sanitizeString(data.tipo, 50),
        descripcion: sanitizeDescription(data.descripcion),
        fecha: data.fecha ? new Date(data.fecha) : new Date(),
        hora: sanitizeString(data.hora, 50),
        direccion: sanitizeString(data.direccion, 300),
        gruaId: data.gruaId || null,
        choferId: data.choferId || null,
        estado: data.choferId ? 'ASIGNADA' : 'NUEVA',
      },
      include: { cliente: true }
    })
    return NextResponse.json(solicitud, { status: 201, headers })
  } catch {
    return NextResponse.json({ error: 'Error al crear solicitud' }, { status: 500, headers })
  }
}
