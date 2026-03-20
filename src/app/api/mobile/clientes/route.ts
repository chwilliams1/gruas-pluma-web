import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticateRequest, unauthorizedResponse } from '@/lib/auth'
import { getCorsHeaders, corsOptions } from '@/lib/cors'

export async function OPTIONS(req: Request) {
  return corsOptions(req)
}

export async function GET(req: Request) {
  const headers = getCorsHeaders(req)
  const auth = authenticateRequest(req)
  if (!auth) return unauthorizedResponse(headers)

  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('q')

    const clientes = await prisma.cliente.findMany({
      where: q
        ? { nombre: { contains: q, mode: 'insensitive' } }
        : undefined,
      select: {
        id: true,
        nombre: true,
        rut: true,
        telefono: true,
        direccion: true,
        _count: { select: { solicitudes: true } },
      },
      orderBy: [
        { solicitudes: { _count: 'desc' } },
        { creadoEn: 'desc' },
      ],
      take: 50,
    })

    return NextResponse.json(clientes, { headers })
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener clientes' },
      { status: 500, headers }
    )
  }
}
