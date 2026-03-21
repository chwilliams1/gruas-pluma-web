import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticateRequest, unauthorizedResponse } from '@/lib/auth'
import { getCorsHeaders, corsOptions } from '@/lib/cors'

export async function OPTIONS(req: Request) {
  return corsOptions(req)
}

export async function POST(req: Request) {
  const headers = getCorsHeaders(req)
  const auth = authenticateRequest(req)
  if (!auth) return unauthorizedResponse(headers)

  try {
    const { pushToken } = await req.json()

    if (!pushToken || typeof pushToken !== 'string') {
      return NextResponse.json(
        { error: 'pushToken es requerido' },
        { status: 400, headers }
      )
    }

    await prisma.usuario.update({
      where: { id: auth.userId },
      data: { pushToken },
    })

    return NextResponse.json({ ok: true }, { headers })
  } catch {
    return NextResponse.json(
      { error: 'Error al guardar push token' },
      { status: 500, headers }
    )
  }
}
