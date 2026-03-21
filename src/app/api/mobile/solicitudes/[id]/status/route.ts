import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticateRequest, unauthorizedResponse } from '@/lib/auth'
import { getCorsHeaders, corsOptions } from '@/lib/cors'
import crypto from 'crypto'

const VALID_TRANSITIONS: Record<string, string[]> = {
  ASIGNADA: ['EN_CAMINO'],
  EN_CAMINO: ['EN_SITIO'],
  EN_SITIO: ['EN_PROGRESO'],
  EN_PROGRESO: ['COMPLETADA'],
}

export async function OPTIONS(req: Request) {
  return corsOptions(req)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getCorsHeaders(req)
  const auth = authenticateRequest(req)
  if (!auth) return unauthorizedResponse(headers)

  try {
    const { id } = await params
    const { estado } = await req.json()

    if (!estado || typeof estado !== 'string') {
      return NextResponse.json(
        { error: 'estado es requerido' },
        { status: 400, headers }
      )
    }

    const solicitud = await prisma.solicitud.findUnique({ where: { id } })

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

    const allowed = VALID_TRANSITIONS[solicitud.estado]
    if (!allowed || !allowed.includes(estado)) {
      return NextResponse.json(
        { error: `No se puede cambiar de ${solicitud.estado} a ${estado}` },
        { status: 400, headers }
      )
    }

    const prevEstado = solicitud.estado

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.solicitud.update({
        where: { id },
        data: { estado },
        include: { cliente: true, grua: true },
      })

      await tx.historialEstado.create({
        data: {
          id: crypto.randomUUID(),
          solicitudId: id,
          estadoAnterior: prevEstado,
          estadoNuevo: estado,
          usuarioId: auth.userId,
        },
      })

      return result
    })

    return NextResponse.json(updated, { headers })
  } catch {
    return NextResponse.json(
      { error: 'Error al actualizar estado' },
      { status: 500, headers }
    )
  }
}
