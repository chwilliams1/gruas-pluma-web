import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { comparePassword, signToken } from '@/lib/auth'
import { getCorsHeaders, corsOptions } from '@/lib/cors'

export async function OPTIONS(req: Request) {
  return corsOptions(req)
}

export async function POST(req: Request) {
  const headers = getCorsHeaders(req)
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Email y password son requeridos' },
        { status: 400, headers }
      )
    }

    const user = await prisma.usuario.findUnique({
      where: { email },
      include: { grua: true },
    })

    if (!user || !user.password || !(await comparePassword(password, user.password))) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401, headers }
      )
    }

    if (user.rol !== 'CHOFER') {
      return NextResponse.json(
        { error: 'Acceso solo para choferes' },
        { status: 403, headers }
      )
    }

    if (!user.activo) {
      return NextResponse.json(
        { error: 'Usuario desactivado' },
        { status: 403, headers }
      )
    }

    const token = signToken({ userId: user.id, rol: user.rol })

    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          telefono: user.telefono,
          licencia: user.licencia,
          rol: user.rol,
          grua: user.grua
            ? {
                id: user.grua.id,
                patente: user.grua.patente,
                marca: user.grua.marca,
                modelo: user.grua.modelo,
                capacidad: user.grua.capacidad,
                tipo: user.grua.tipo,
              }
            : null,
        },
      },
      { headers }
    )
  } catch {
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500, headers }
    )
  }
}
