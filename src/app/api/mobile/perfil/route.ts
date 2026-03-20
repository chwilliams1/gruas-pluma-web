import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticateRequest, unauthorizedResponse } from '@/lib/auth'
import { getCorsHeaders, corsOptions } from '@/lib/cors'
import { isNonEmptyString, sanitizeString } from '@/lib/validation'

export async function OPTIONS(req: Request) {
  return corsOptions(req)
}

export async function GET(req: Request) {
  const headers = getCorsHeaders(req)
  const auth = authenticateRequest(req)
  if (!auth) return unauthorizedResponse(headers)

  try {
    const chofer = await prisma.usuario.findUnique({
      where: { id: auth.userId },
      include: {
        grua: true,
        _count: { select: { solicitudes: true, reportes: true } },
      },
    })

    if (!chofer) {
      return NextResponse.json(
        { error: 'Chofer no encontrado' },
        { status: 404, headers }
      )
    }

    return NextResponse.json(
      {
        id: chofer.id,
        nombre: chofer.nombre,
        email: chofer.email,
        telefono: chofer.telefono,
        licencia: chofer.licencia,
        activo: chofer.activo,
        grua: chofer.grua,
        stats: {
          totalSolicitudes: chofer._count.solicitudes,
          totalReportes: chofer._count.reportes,
        },
      },
      { headers }
    )
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener perfil' },
      { status: 500, headers }
    )
  }
}

export async function PATCH(req: Request) {
  const headers = getCorsHeaders(req)
  const auth = authenticateRequest(req)
  if (!auth) return unauthorizedResponse(headers)

  try {
    const { telefono } = await req.json()

    if (telefono !== undefined && typeof telefono !== 'string') {
      return NextResponse.json(
        { error: 'Teléfono debe ser texto' },
        { status: 400, headers }
      )
    }

    const updated = await prisma.usuario.update({
      where: { id: auth.userId },
      data: { telefono: isNonEmptyString(telefono) ? sanitizeString(telefono, 20) : null },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        licencia: true,
      },
    })

    return NextResponse.json(updated, { headers })
  } catch {
    return NextResponse.json(
      { error: 'Error al actualizar perfil' },
      { status: 500, headers }
    )
  }
}
