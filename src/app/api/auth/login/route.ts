import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    const user = await prisma.usuario.findUnique({ where: { email } })
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }
    return NextResponse.json({
      id: user.id,
      nombre: user.nombre,
      rol: user.rol,
      email: user.email
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 })
  }
}
