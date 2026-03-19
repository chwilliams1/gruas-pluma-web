import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      include: { _count: { select: { solicitudes: true } } },
      orderBy: { creadoEn: 'desc' }
    })
    return NextResponse.json(clientes)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const cliente = await prisma.cliente.create({
      data: {
        nombre: data.nombre,
        telefono: data.telefono || null,
        direccion: data.direccion || null
      }
    })
    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 })
  }
}
