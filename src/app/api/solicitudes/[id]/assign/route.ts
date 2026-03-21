import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { isNonEmptyString } from '@/lib/validation'
import { sendPushNotification } from '@/lib/pushNotification'
import crypto from 'crypto'

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

    const prevEstado = solicitud.estado

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.solicitud.update({
        where: { id },
        data: { choferId, estado: 'ASIGNADA' },
      })

      await tx.historialEstado.create({
        data: {
          id: crypto.randomUUID(),
          solicitudId: id,
          estadoAnterior: prevEstado,
          estadoNuevo: 'ASIGNADA',
          nota: `Asignado a ${chofer.nombre}`,
        },
      })

      return result
    })
    // Send push notification to assigned driver
    if (chofer.pushToken) {
      const sol = await prisma.solicitud.findUnique({
        where: { id },
        include: { cliente: { select: { nombre: true } } },
      })
      sendPushNotification(
        chofer.pushToken,
        'Nueva solicitud asignada',
        `${sol?.cliente?.nombre || 'Cliente'}: ${sol?.descripcion?.slice(0, 100) || 'Sin descripcion'}`,
        { solicitudId: id }
      )
    }

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Error al asignar chofer' }, { status: 500 })
  }
}
