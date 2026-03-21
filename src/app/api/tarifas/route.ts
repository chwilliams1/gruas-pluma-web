import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const tarifas = await prisma.tarifa.findMany({
      orderBy: { nombre: 'asc' },
    })
    return NextResponse.json(tarifas)
  } catch {
    return NextResponse.json({ error: 'Error al obtener tarifas' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json()

    if (!data.id || typeof data.valorHora !== 'number' || data.valorHora <= 0) {
      return NextResponse.json({ error: 'id y valorHora valido son requeridos' }, { status: 400 })
    }

    const tarifa = await prisma.tarifa.update({
      where: { id: data.id },
      data: {
        valorHora: data.valorHora,
        minimoHoras: typeof data.minimoHoras === 'number' ? data.minimoHoras : undefined,
        activa: typeof data.activa === 'boolean' ? data.activa : undefined,
      },
    })

    return NextResponse.json(tarifa)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar tarifa' }, { status: 500 })
  }
}
