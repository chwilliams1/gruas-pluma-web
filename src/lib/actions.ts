'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ─── Solicitudes ───

export async function assignDriver(solicitudId: string, choferId: string) {
  await prisma.solicitud.update({
    where: { id: solicitudId },
    data: { choferId, estado: 'ASIGNADA' }
  })
  revalidatePath('/solicitudes')
  revalidatePath('/')
}

export async function createSolicitud(formData: FormData) {
  const clienteId = formData.get('clienteId') as string
  const tipo = formData.get('tipo') as string
  const descripcion = formData.get('descripcion') as string
  const fecha = formData.get('fecha') as string
  const hora = formData.get('hora') as string
  const direccion = formData.get('direccion') as string

  const count = await prisma.solicitud.count()
  const codigo = `SOL-${String(count + 1).padStart(3, '0')}`

  await prisma.solicitud.create({
    data: { codigo, clienteId, tipo, descripcion, fecha, hora, direccion, estado: 'NUEVA' }
  })
  revalidatePath('/solicitudes')
  revalidatePath('/')
}

// ─── Reportes ───

export async function togglePagado(reporteId: string) {
  const reporte = await prisma.reporte.findUnique({ where: { id: reporteId } })
  if (!reporte) return
  await prisma.reporte.update({
    where: { id: reporteId },
    data: { pagado: !reporte.pagado }
  })
  revalidatePath('/reportes')
  revalidatePath('/facturacion')
  revalidatePath('/')
}

// ─── Clientes ───

export async function createCliente(formData: FormData) {
  const nombre = formData.get('nombre') as string
  const telefono = formData.get('telefono') as string
  const direccion = formData.get('direccion') as string

  await prisma.cliente.create({
    data: { nombre, telefono, direccion }
  })
  revalidatePath('/clientes')
}

export async function deleteCliente(clienteId: string) {
  // Check if client has solicitudes
  const count = await prisma.solicitud.count({ where: { clienteId } })
  if (count > 0) {
    throw new Error('No se puede eliminar un cliente con solicitudes asociadas')
  }
  await prisma.cliente.delete({ where: { id: clienteId } })
  revalidatePath('/clientes')
}

// ─── Conductores ───

export async function createConductor(formData: FormData) {
  const nombre = formData.get('nombre') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const telefono = formData.get('telefono') as string
  const licencia = formData.get('licencia') as string
  const gruaId = formData.get('gruaId') as string

  await prisma.usuario.create({
    data: {
      nombre,
      email,
      password,
      rol: 'CHOFER',
      telefono: telefono || null,
      licencia: licencia || null,
      gruaId: gruaId || null,
    }
  })
  revalidatePath('/conductores')
}

export async function deleteConductor(conductorId: string) {
  const solCount = await prisma.solicitud.count({ where: { choferId: conductorId } })
  const repCount = await prisma.reporte.count({ where: { choferId: conductorId } })
  if (solCount > 0 || repCount > 0) {
    throw new Error('No se puede eliminar: tiene solicitudes o reportes asociados')
  }
  await prisma.usuario.delete({ where: { id: conductorId } })
  revalidatePath('/conductores')
}

export async function toggleActivoConductor(conductorId: string) {
  const usuario = await prisma.usuario.findUnique({ where: { id: conductorId } })
  if (!usuario) return
  await prisma.usuario.update({
    where: { id: conductorId },
    data: { activo: !usuario.activo }
  })
  revalidatePath('/conductores')
}

// ─── Grúas ───

export async function createGrua(formData: FormData) {
  const patente = (formData.get('patente') as string).toUpperCase()
  const marca = formData.get('marca') as string
  const modelo = formData.get('modelo') as string
  const anioStr = formData.get('anio') as string
  const tipo = formData.get('tipo') as string
  const capacidad = formData.get('capacidad') as string
  const estado = formData.get('estado') as string

  await prisma.grua.create({
    data: {
      patente,
      marca,
      modelo,
      anio: anioStr ? parseInt(anioStr) : null,
      tipo,
      capacidad,
      estado,
    }
  })
  revalidatePath('/gruas')
}

export async function deleteGrua(gruaId: string) {
  const choferCount = await prisma.usuario.count({ where: { gruaId } })
  const solCount = await prisma.solicitud.count({ where: { gruaId } })
  if (choferCount > 0 || solCount > 0) {
    throw new Error('No se puede eliminar: tiene choferes o solicitudes asociadas')
  }
  await prisma.grua.delete({ where: { id: gruaId } })
  revalidatePath('/gruas')
}

export async function updateEstadoGrua(gruaId: string, estado: string) {
  await prisma.grua.update({
    where: { id: gruaId },
    data: { estado }
  })
  revalidatePath('/gruas')
}

export async function updateGrua(formData: FormData) {
  const id = formData.get('id') as string
  const patente = (formData.get('patente') as string).toUpperCase()
  const marca = formData.get('marca') as string
  const modelo = formData.get('modelo') as string
  const anioStr = formData.get('anio') as string
  const tipo = formData.get('tipo') as string
  const capacidad = formData.get('capacidad') as string
  const estado = formData.get('estado') as string

  await prisma.grua.update({
    where: { id },
    data: {
      patente,
      marca,
      modelo,
      anio: anioStr ? parseInt(anioStr) : null,
      tipo,
      capacidad,
      estado,
    }
  })
  revalidatePath('/gruas')
}

// ─── Editar Conductor ───

export async function updateConductor(formData: FormData) {
  const id = formData.get('id') as string
  const nombre = formData.get('nombre') as string
  const email = formData.get('email') as string
  const telefono = formData.get('telefono') as string
  const licencia = formData.get('licencia') as string
  const gruaId = formData.get('gruaId') as string
  const password = formData.get('password') as string

  const data: Record<string, unknown> = {
    nombre,
    email: email || null,
    telefono: telefono || null,
    licencia: licencia || null,
    gruaId: gruaId || null,
  }
  if (password) {
    data.password = password
  }

  await prisma.usuario.update({ where: { id }, data })
  revalidatePath('/conductores')
}

// ─── Editar Cliente ───

export async function updateCliente(formData: FormData) {
  const id = formData.get('id') as string
  const nombre = formData.get('nombre') as string
  const telefono = formData.get('telefono') as string
  const direccion = formData.get('direccion') as string

  await prisma.cliente.update({
    where: { id },
    data: {
      nombre,
      telefono: telefono || null,
      direccion: direccion || null,
    }
  })
  revalidatePath('/clientes')
}

// ─── Importar Reportes CSV ───

export async function importReportes(jsonData: string): Promise<{ created: number, errors: string[] }> {
  const rows = JSON.parse(jsonData) as Record<string, string>[]
  const errors: string[] = []
  let created = 0

  const choferes = await prisma.usuario.findMany({ where: { rol: 'CHOFER' } })
  const clientes = await prisma.cliente.findMany()
  const reporteCount = await prisma.reporte.count()

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2

    const choferName = row['chofer'] || ''
    const clienteName = row['cliente'] || ''
    const horas = parseFloat(row['horas'] || '0')
    const descripcion = row['descripcion'] || ''
    const fecha = row['fecha'] || ''
    const montoStr = row['monto'] || ''
    const pagado = (row['pagado'] || '').toLowerCase()
    const factura = (row['factura'] || '').toLowerCase()

    if (!choferName || !clienteName || !fecha) {
      errors.push(`Fila ${rowNum}: faltan campos obligatorios (chofer, cliente, fecha)`)
      continue
    }

    const chofer = choferes.find(c =>
      c.nombre.toLowerCase() === choferName.toLowerCase()
    )
    if (!chofer) {
      errors.push(`Fila ${rowNum}: conductor "${choferName}" no encontrado`)
      continue
    }

    const cliente = clientes.find(c =>
      c.nombre.toLowerCase() === clienteName.toLowerCase()
    )
    if (!cliente) {
      errors.push(`Fila ${rowNum}: cliente "${clienteName}" no encontrado`)
      continue
    }

    const monto = montoStr ? parseFloat(montoStr) : horas * 45000

    const solCount = await prisma.solicitud.count()
    const solCodigo = `SOL-${String(solCount + 1).padStart(3, '0')}`
    const rptCodigo = `RPT-${String(reporteCount + created + 1).padStart(4, '0')}`

    const solicitud = await prisma.solicitud.create({
      data: {
        codigo: solCodigo,
        clienteId: cliente.id,
        choferId: chofer.id,
        tipo: 'Otro',
        descripcion: descripcion || 'Importado desde CSV',
        fecha,
        hora: 'Mañana (8-12)',
        direccion: cliente.direccion || 'Sin dirección',
        estado: 'COMPLETADA',
      }
    })

    await prisma.reporte.create({
      data: {
        codigo: rptCodigo,
        solicitudId: solicitud.id,
        choferId: chofer.id,
        fecha,
        horas: horas || 0,
        descripcion: descripcion || 'Importado desde CSV',
        monto,
        pagado: pagado === 'si' || pagado === 'sí' || pagado === 'true',
        factura: factura === 'si' || factura === 'sí' || factura === 'true',
      }
    })

    created++
  }

  revalidatePath('/reportes')
  revalidatePath('/facturacion')
  revalidatePath('/estadisticas')
  revalidatePath('/')

  return { created, errors }
}
