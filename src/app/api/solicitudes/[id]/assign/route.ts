import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { isNonEmptyString } from '@/lib/validation'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { choferId } = await req.json()

    if (!isNonEmptyString(choferId)) {
      return NextResponse.json({ error: 'choferId es requerido' }, { status: 400 })
    }

    // Verify chofer exists and is active
    const chofer = await prisma.usuario.findUnique({ where: { id: choferId } })
    if (!chofer || chofer.rol !== 'CHOFER' || !chofer.activo) {
      return NextResponse.json({ error: 'Chofer no válido o inactivo' }, { status: 400 })
    }

    const solicitud = await prisma.solicitud.findUnique({ where: { id } })
    if (!solicitud) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 })
    }

    const updated = await prisma.solicitud.update({
      where: { id },
      data: { choferId, estado: 'ASIGNADA' }
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Error al asignar chofer' }, { status: 500 })
  }
}
