import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { comparePassword, signToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Email y password son requeridos' }, { status: 400 })
    }

    const user = await prisma.usuario.findUnique({ where: { email } })

    if (!user || !user.password || !(await comparePassword(password, user.password))) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    if (!user.activo) {
      return NextResponse.json({ error: 'Usuario desactivado' }, { status: 403 })
    }

    const token = signToken({ userId: user.id, rol: user.rol })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol,
        email: user.email,
      }
    })
  } catch {
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 })
  }
}
