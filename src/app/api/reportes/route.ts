import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const reportes = await prisma.reporte.findMany({
      include: {
        solicitud: { include: { cliente: true } },
        chofer: true
      },
      orderBy: { creadoEn: 'desc' }
    })
    return NextResponse.json(reportes)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener reportes' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const reporte = await prisma.reporte.create({
      data: {
        codigo: `RPT-${Date.now().toString().slice(-4)}`,
        solicitudId: data.solicitudId,
        choferId: data.choferId,
        fecha: new Date().toLocaleDateString('es-CL'),
        horas: Number(data.horas),
        descripcion: data.descripcion,
        evidencia: data.evidencia || null,
        pagado: Boolean(data.pagado),
        factura: Boolean(data.factura),
        monto: Number(data.horas) * 45000 
      }
    })

    await prisma.solicitud.update({
      where: { id: data.solicitudId },
      data: { estado: 'COMPLETADA' }
    })

    return NextResponse.json(reporte, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al crear reporte' }, { status: 500 })
  }
}
