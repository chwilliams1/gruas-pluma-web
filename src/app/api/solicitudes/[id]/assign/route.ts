import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { choferId } = await req.json()
    const solicitud = await prisma.solicitud.update({
      where: { id },
      data: { choferId, estado: 'ASIGNADA' }
    })
    return NextResponse.json(solicitud)
  } catch (error) {
    return NextResponse.json({ error: 'Error al asignar chofer' }, { status: 500 })
  }
}
