import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const choferId = searchParams.get('choferId')
  
  try {
    const solicitudes = await prisma.solicitud.findMany({
      where: choferId ? { choferId } : undefined,
      include: {
        cliente: true
      },
      orderBy: { creadoEn: 'desc' }
    })
    return NextResponse.json(solicitudes)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener solicitudes' }, { status: 500 })
  }
}
