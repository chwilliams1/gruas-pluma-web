import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticateRequest, unauthorizedResponse } from '@/lib/auth'
import { getCorsHeaders, corsOptions } from '@/lib/cors'

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
    const { motivo } = await req.json()

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

    const updated = await prisma.solicitud.update({
      where: { id },
      data: {
        choferId: null,
        estado: 'NUEVA',
      },
    })

    return NextResponse.json(
      { message: 'Solicitud rechazada', motivo: motivo || null, solicitud: updated },
      { headers }
    )
  } catch {
    return NextResponse.json(
      { error: 'Error al rechazar solicitud' },
      { status: 500, headers }
    )
  }
}
