import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticateRequest, unauthorizedResponse } from '@/lib/auth'
import { getCorsHeaders, corsOptions } from '@/lib/cors'
import { isValidEnum, ESTADOS_SOLICITUD } from '@/lib/validation'

export async function OPTIONS(req: Request) {
  return corsOptions(req)
}

export async function GET(req: Request) {
  const headers = getCorsHeaders(req)
  const auth = authenticateRequest(req)
  if (!auth) return unauthorizedResponse(headers)

  const { searchParams } = new URL(req.url)
  const estado = searchParams.get('estado')

  try {
    const where: Record<string, string> = { choferId: auth.userId }
    if (estado && isValidEnum(estado, ESTADOS_SOLICITUD)) {
      where.estado = estado
    }

    const solicitudes = await prisma.solicitud.findMany({
      where,
      include: {
        cliente: { select: { id: true, nombre: true, telefono: true, direccion: true } },
        grua: { select: { id: true, patente: true, tipo: true, capacidad: true } },
        reporte: { select: { id: true, codigo: true } },
      },
      orderBy: { creadoEn: 'desc' },
    })

    return NextResponse.json(solicitudes, { headers })
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener solicitudes' },
      { status: 500, headers }
    )
  }
}
