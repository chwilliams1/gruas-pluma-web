import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { isNonEmptyString, sanitizeString } from '@/lib/validation'

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      include: { _count: { select: { solicitudes: true } } },
      orderBy: { creadoEn: 'desc' }
    })
    return NextResponse.json(clientes)
  } catch {
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    if (!isNonEmptyString(data.nombre)) {
      return NextResponse.json({ error: 'nombre es requerido' }, { status: 400 })
    }

    const cliente = await prisma.cliente.create({
      data: {
        nombre: sanitizeString(data.nombre),
        telefono: isNonEmptyString(data.telefono) ? sanitizeString(data.telefono, 20) : null,
        direccion: isNonEmptyString(data.direccion) ? sanitizeString(data.direccion, 300) : null,
      }
    })
    return NextResponse.json(cliente, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 })
  }
}
