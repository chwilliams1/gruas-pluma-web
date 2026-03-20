'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { hashPassword } from '@/lib/auth'
import {
  isNonEmptyString,
  isValidEnum,
  safeParseFloat,
  safeParseInt,
  sanitizeString,
  sanitizeDescription,
  safeJsonParse,
  ESTADOS_GRUA,
  ESTADOS_REPORTE,
} from '@/lib/validation'
import crypto from 'crypto'

function generateCode(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

// ─── Solicitudes ───

export async function assignDriver(solicitudId: string, choferId: string) {
  if (!isNonEmptyString(solicitudId) || !isNonEmptyString(choferId)) {
    throw new Error('solicitudId y choferId son requeridos')
  }

  const [solicitud, chofer] = await Promise.all([
    prisma.solicitud.findUnique({ where: { id: solicitudId } }),
    prisma.usuario.findUnique({ where: { id: choferId } }),
  ])

  if (!solicitud) throw new Error('Solicitud no encontrada')
  if (!chofer || chofer.rol !== 'CHOFER' || !chofer.activo) {
    throw new Error('Chofer no válido o inactivo')
  }

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

  if (!isNonEmptyString(clienteId) || !isNonEmptyString(tipo) ||
      !isNonEmptyString(descripcion) || !isNonEmptyString(fecha) ||
      !isNonEmptyString(hora) || !isNonEmptyString(direccion)) {
    throw new Error('Todos los campos son requeridos')
  }

  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } })
  if (!cliente) throw new Error('Cliente no encontrado')

  await prisma.solicitud.create({
    data: {
      codigo: generateCode('SOL'),
      clienteId,
      tipo: sanitizeString(tipo, 50),
      descripcion: sanitizeDescription(descripcion),
      fecha: sanitizeString(fecha, 50),
      hora: sanitizeString(hora, 50),
      direccion: sanitizeString(direccion, 300),
      estado: 'NUEVA',
    }
  })
  revalidatePath('/solicitudes')
  revalidatePath('/')
}

// ─── Reportes ───

export async function togglePagado(reporteId: string) {
  if (!isNonEmptyString(reporteId)) throw new Error('reporteId es requerido')

  const reporte = await prisma.reporte.findUnique({ where: { id: reporteId } })
  if (!reporte) throw new Error('Reporte no encontrado')

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
  const rut = formData.get('rut') as string
  const telefono = formData.get('telefono') as string
  const direccion = formData.get('direccion') as string

  if (!isNonEmptyString(nombre)) {
    throw new Error('Nombre es requerido')
  }

  await prisma.cliente.create({
    data: {
      nombre: sanitizeString(nombre),
      rut: isNonEmptyString(rut) ? sanitizeString(rut, 20) : null,
      telefono: isNonEmptyString(telefono) ? sanitizeString(telefono, 20) : null,
      direccion: isNonEmptyString(direccion) ? sanitizeString(direccion, 300) : null,
    }
  })
  revalidatePath('/clientes')
}

export async function importClientes(jsonData: string): Promise<{ created: number, updated: number, errors: string[] }> {
  const { data: rows, error: parseError } = safeJsonParse<Record<string, string>[]>(jsonData)
  if (parseError || !rows || !Array.isArray(rows)) {
    return { created: 0, updated: 0, errors: [parseError || 'Datos inválidos'] }
  }

  const errors: string[] = []
  let created = 0
  let updated = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2

    const nombre = sanitizeString(row['nombre'] || row['empresa'] || '')
    const rut = sanitizeString(row['rut'] || '', 20)
    const telefono = sanitizeString(row['telefono'] || '', 20)
    const direccion = sanitizeString(row['direccion'] || row['dirección'] || '', 300)

    if (!nombre) {
      errors.push(`Fila ${rowNum}: falta el nombre/empresa`)
      continue
    }

    const existing = await prisma.cliente.findFirst({
      where: { nombre: { equals: nombre, mode: 'insensitive' } }
    })

    if (existing) {
      const updateData: Record<string, string> = {}
      if (rut && !existing.rut) updateData.rut = rut
      if (telefono && !existing.telefono) updateData.telefono = telefono
      if (direccion && !existing.direccion) updateData.direccion = direccion

      if (Object.keys(updateData).length > 0) {
        await prisma.cliente.update({ where: { id: existing.id }, data: updateData })
        updated++
      }
      continue
    }

    await prisma.cliente.create({
      data: {
        nombre,
        rut: rut || null,
        telefono: telefono || null,
        direccion: direccion || null,
      }
    })
    created++
  }

  revalidatePath('/clientes')
  return { created, updated, errors }
}

export async function deleteCliente(clienteId: string) {
  if (!isNonEmptyString(clienteId)) throw new Error('clienteId es requerido')

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

  if (!isNonEmptyString(nombre) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
    throw new Error('Nombre, email y password son requeridos')
  }

  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres')
  }

  // Check if email already exists
  const existing = await prisma.usuario.findUnique({ where: { email } })
  if (existing) {
    throw new Error('Ya existe un usuario con ese email')
  }

  const hashedPassword = await hashPassword(password)

  await prisma.usuario.create({
    data: {
      nombre: sanitizeString(nombre),
      email: sanitizeString(email, 100),
      password: hashedPassword,
      rol: 'CHOFER',
      telefono: isNonEmptyString(telefono) ? sanitizeString(telefono, 20) : null,
      licencia: isNonEmptyString(licencia) ? sanitizeString(licencia, 20) : null,
      gruaId: isNonEmptyString(gruaId) ? gruaId : null,
    }
  })
  revalidatePath('/conductores')
}

export async function deleteConductor(conductorId: string) {
  if (!isNonEmptyString(conductorId)) throw new Error('conductorId es requerido')

  const solCount = await prisma.solicitud.count({ where: { choferId: conductorId } })
  const repCount = await prisma.reporte.count({ where: { choferId: conductorId } })
  if (solCount > 0 || repCount > 0) {
    throw new Error('No se puede eliminar: tiene solicitudes o reportes asociados')
  }
  await prisma.usuario.delete({ where: { id: conductorId } })
  revalidatePath('/conductores')
}

export async function toggleActivoConductor(conductorId: string) {
  if (!isNonEmptyString(conductorId)) throw new Error('conductorId es requerido')

  const usuario = await prisma.usuario.findUnique({ where: { id: conductorId } })
  if (!usuario) throw new Error('Conductor no encontrado')

  await prisma.usuario.update({
    where: { id: conductorId },
    data: { activo: !usuario.activo }
  })
  revalidatePath('/conductores')
}

// ─── Grúas ───

export async function createGrua(formData: FormData) {
  const patente = formData.get('patente') as string
  const marca = formData.get('marca') as string
  const modelo = formData.get('modelo') as string
  const anioStr = formData.get('anio') as string
  const tipo = formData.get('tipo') as string
  const capacidad = formData.get('capacidad') as string
  const estado = formData.get('estado') as string

  if (!isNonEmptyString(patente) || !isNonEmptyString(marca) ||
      !isNonEmptyString(modelo) || !isNonEmptyString(tipo) || !isNonEmptyString(capacidad)) {
    throw new Error('Patente, marca, modelo, tipo y capacidad son requeridos')
  }

  if (estado && !isValidEnum(estado, ESTADOS_GRUA)) {
    throw new Error('Estado de grúa no válido')
  }

  // Check patente uniqueness
  const existing = await prisma.grua.findUnique({ where: { patente: patente.toUpperCase() } })
  if (existing) {
    throw new Error('Ya existe una grúa con esa patente')
  }

  await prisma.grua.create({
    data: {
      patente: sanitizeString(patente, 20).toUpperCase(),
      marca: sanitizeString(marca, 50),
      modelo: sanitizeString(modelo, 50),
      anio: safeParseInt(anioStr),
      tipo: sanitizeString(tipo, 50),
      capacidad: sanitizeString(capacidad, 50),
      estado: isValidEnum(estado, ESTADOS_GRUA) ? estado : 'DISPONIBLE',
    }
  })
  revalidatePath('/gruas')
}

export async function deleteGrua(gruaId: string) {
  if (!isNonEmptyString(gruaId)) throw new Error('gruaId es requerido')

  const choferCount = await prisma.usuario.count({ where: { gruaId } })
  const solCount = await prisma.solicitud.count({ where: { gruaId } })
  if (choferCount > 0 || solCount > 0) {
    throw new Error('No se puede eliminar: tiene choferes o solicitudes asociadas')
  }
  await prisma.grua.delete({ where: { id: gruaId } })
  revalidatePath('/gruas')
}

export async function updateEstadoGrua(gruaId: string, estado: string) {
  if (!isNonEmptyString(gruaId)) throw new Error('gruaId es requerido')
  if (!isValidEnum(estado, ESTADOS_GRUA)) throw new Error('Estado no válido')

  const grua = await prisma.grua.findUnique({ where: { id: gruaId } })
  if (!grua) throw new Error('Grúa no encontrada')

  await prisma.grua.update({
    where: { id: gruaId },
    data: { estado }
  })
  revalidatePath('/gruas')
}

export async function updateGrua(formData: FormData) {
  const id = formData.get('id') as string
  const patente = formData.get('patente') as string
  const marca = formData.get('marca') as string
  const modelo = formData.get('modelo') as string
  const anioStr = formData.get('anio') as string
  const tipo = formData.get('tipo') as string
  const capacidad = formData.get('capacidad') as string
  const estado = formData.get('estado') as string

  if (!isNonEmptyString(id) || !isNonEmptyString(patente) || !isNonEmptyString(marca) ||
      !isNonEmptyString(modelo) || !isNonEmptyString(tipo) || !isNonEmptyString(capacidad)) {
    throw new Error('Todos los campos obligatorios son requeridos')
  }

  if (estado && !isValidEnum(estado, ESTADOS_GRUA)) {
    throw new Error('Estado de grúa no válido')
  }

  const grua = await prisma.grua.findUnique({ where: { id } })
  if (!grua) throw new Error('Grúa no encontrada')

  // Check patente uniqueness if changed
  const patenteUpper = sanitizeString(patente, 20).toUpperCase()
  if (patenteUpper !== grua.patente) {
    const existing = await prisma.grua.findUnique({ where: { patente: patenteUpper } })
    if (existing) throw new Error('Ya existe una grúa con esa patente')
  }

  await prisma.grua.update({
    where: { id },
    data: {
      patente: patenteUpper,
      marca: sanitizeString(marca, 50),
      modelo: sanitizeString(modelo, 50),
      anio: safeParseInt(anioStr),
      tipo: sanitizeString(tipo, 50),
      capacidad: sanitizeString(capacidad, 50),
      estado: isValidEnum(estado, ESTADOS_GRUA) ? estado : grua.estado,
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

  if (!isNonEmptyString(id) || !isNonEmptyString(nombre)) {
    throw new Error('ID y nombre son requeridos')
  }

  const conductor = await prisma.usuario.findUnique({ where: { id } })
  if (!conductor) throw new Error('Conductor no encontrado')

  // Check email uniqueness if changed
  if (isNonEmptyString(email) && email !== conductor.email) {
    const existing = await prisma.usuario.findUnique({ where: { email } })
    if (existing) throw new Error('Ya existe un usuario con ese email')
  }

  const data: Record<string, unknown> = {
    nombre: sanitizeString(nombre),
    email: isNonEmptyString(email) ? sanitizeString(email, 100) : null,
    telefono: isNonEmptyString(telefono) ? sanitizeString(telefono, 20) : null,
    licencia: isNonEmptyString(licencia) ? sanitizeString(licencia, 20) : null,
    gruaId: isNonEmptyString(gruaId) ? gruaId : null,
  }

  if (isNonEmptyString(password)) {
    if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres')
    data.password = await hashPassword(password)
  }

  await prisma.usuario.update({ where: { id }, data })
  revalidatePath('/conductores')
}

// ─── Editar Cliente ───

export async function updateCliente(formData: FormData) {
  const id = formData.get('id') as string
  const nombre = formData.get('nombre') as string
  const rut = formData.get('rut') as string
  const telefono = formData.get('telefono') as string
  const direccion = formData.get('direccion') as string

  if (!isNonEmptyString(id) || !isNonEmptyString(nombre)) {
    throw new Error('ID y nombre son requeridos')
  }

  const cliente = await prisma.cliente.findUnique({ where: { id } })
  if (!cliente) throw new Error('Cliente no encontrado')

  await prisma.cliente.update({
    where: { id },
    data: {
      nombre: sanitizeString(nombre),
      rut: isNonEmptyString(rut) ? sanitizeString(rut, 20) : null,
      telefono: isNonEmptyString(telefono) ? sanitizeString(telefono, 20) : null,
      direccion: isNonEmptyString(direccion) ? sanitizeString(direccion, 300) : null,
    }
  })
  revalidatePath('/clientes')
}

// ─── Eliminar Reporte ───

export async function deleteReporte(reporteId: string) {
  if (!isNonEmptyString(reporteId)) throw new Error('reporteId es requerido')

  const reporte = await prisma.reporte.findUnique({ where: { id: reporteId } })
  if (!reporte) throw new Error('Reporte no encontrado')

  // Use transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    await tx.reporte.delete({ where: { id: reporteId } })
    await tx.solicitud.delete({ where: { id: reporte.solicitudId } })
  })

  revalidatePath('/reportes')
  revalidatePath('/facturacion')
  revalidatePath('/estadisticas')
  revalidatePath('/')
}

// ─── Editar Reporte ───

export async function updateReporte(formData: FormData) {
  const id = formData.get('id') as string
  const choferId = formData.get('choferId') as string
  const clienteId = formData.get('clienteId') as string
  const fecha = formData.get('fecha') as string
  const horas = safeParseFloat(formData.get('horas') as string)
  const horasExtra = safeParseFloat(formData.get('horasExtra') as string)
  const valorHora = safeParseFloat(formData.get('valorHora') as string, 60000)
  const descripcion = formData.get('descripcion') as string
  const estadoReporte = formData.get('estadoReporte') as string || 'sin factura'
  const pagado = formData.get('pagado') === 'true'
  const numeroReporteStr = formData.get('numeroReporte') as string

  if (!isNonEmptyString(id) || !isNonEmptyString(choferId) || !isNonEmptyString(clienteId) || !isNonEmptyString(fecha)) {
    throw new Error('ID, chofer, cliente y fecha son requeridos')
  }

  if (!isValidEnum(estadoReporte, ESTADOS_REPORTE)) {
    throw new Error('Estado de reporte no válido')
  }

  const monto = (horas + horasExtra) * valorHora

  const reporte = await prisma.reporte.findUnique({ where: { id } })
  if (!reporte) throw new Error('Reporte no encontrado')

  // Verify chofer and client exist
  const [chofer, cliente] = await Promise.all([
    prisma.usuario.findUnique({ where: { id: choferId } }),
    prisma.cliente.findUnique({ where: { id: clienteId } }),
  ])
  if (!chofer) throw new Error('Chofer no encontrado')
  if (!cliente) throw new Error('Cliente no encontrado')

  await prisma.$transaction(async (tx) => {
    await tx.reporte.update({
      where: { id },
      data: {
        choferId,
        fecha: sanitizeString(fecha, 50),
        horas,
        horasExtra,
        valorHora,
        descripcion: isNonEmptyString(descripcion) ? sanitizeDescription(descripcion) : reporte.descripcion,
        estadoReporte,
        pagado,
        factura: estadoReporte === 'facturado',
        monto,
        numeroReporte: safeParseInt(numeroReporteStr),
      }
    })

    await tx.solicitud.update({
      where: { id: reporte.solicitudId },
      data: {
        clienteId,
        choferId,
        fecha: sanitizeString(fecha, 50),
        descripcion: isNonEmptyString(descripcion) ? sanitizeDescription(descripcion) : undefined,
      }
    })
  })

  revalidatePath('/reportes')
  revalidatePath('/facturacion')
  revalidatePath('/estadisticas')
  revalidatePath('/')
}

// ─── Crear Reporte Manual ───

export async function createReporte(formData: FormData) {
  const choferId = formData.get('choferId') as string
  const clienteId = formData.get('clienteId') as string
  const fecha = formData.get('fecha') as string
  const horas = safeParseFloat(formData.get('horas') as string)
  const horasExtra = safeParseFloat(formData.get('horasExtra') as string)
  const valorHora = safeParseFloat(formData.get('valorHora') as string, 60000)
  const descripcion = formData.get('descripcion') as string
  const estadoReporte = formData.get('estadoReporte') as string || 'sin factura'
  const pagado = formData.get('pagado') === 'true'
  const numeroReporteStr = formData.get('numeroReporte') as string

  if (!isNonEmptyString(choferId) || !isNonEmptyString(clienteId) || !isNonEmptyString(fecha)) {
    throw new Error('Chofer, cliente y fecha son requeridos')
  }

  const [chofer, cliente] = await Promise.all([
    prisma.usuario.findUnique({ where: { id: choferId } }),
    prisma.cliente.findUnique({ where: { id: clienteId } }),
  ])
  if (!chofer) throw new Error('Chofer no encontrado')
  if (!cliente) throw new Error('Cliente no encontrado')

  const monto = (horas + horasExtra) * valorHora
  const descSanitized = isNonEmptyString(descripcion) ? sanitizeDescription(descripcion) : 'Reporte manual'

  await prisma.$transaction(async (tx) => {
    const solicitud = await tx.solicitud.create({
      data: {
        codigo: generateCode('SOL'),
        clienteId,
        choferId,
        tipo: 'Otro',
        descripcion: descSanitized,
        fecha: sanitizeString(fecha, 50),
        hora: 'Mañana (8-12)',
        direccion: cliente.direccion || 'Sin dirección',
        estado: 'COMPLETADA',
      }
    })

    await tx.reporte.create({
      data: {
        codigo: generateCode('RPT'),
        numeroReporte: safeParseInt(numeroReporteStr),
        solicitudId: solicitud.id,
        choferId,
        fecha: sanitizeString(fecha, 50),
        horas,
        horasExtra,
        valorHora,
        descripcion: descSanitized,
        monto,
        pagado,
        factura: estadoReporte === 'facturado',
        estadoReporte: isValidEnum(estadoReporte, ESTADOS_REPORTE) ? estadoReporte : 'sin factura',
      }
    })
  })

  revalidatePath('/reportes')
  revalidatePath('/facturacion')
  revalidatePath('/estadisticas')
  revalidatePath('/')
}

// ─── Importar Reportes CSV ───

export async function importReportes(jsonData: string): Promise<{ created: number, errors: string[] }> {
  const { data: rows, error: parseError } = safeJsonParse<Record<string, string>[]>(jsonData)
  if (parseError || !rows || !Array.isArray(rows)) {
    return { created: 0, errors: [parseError || 'Datos inválidos'] }
  }

  const errors: string[] = []
  let created = 0

  const choferes = await prisma.usuario.findMany({ where: { rol: 'CHOFER' } })
  const clientes = await prisma.cliente.findMany()

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2

    const choferName = sanitizeString(row['responsable'] || row['chofer'] || '')
    const clienteName = sanitizeString(row['empresa'] || row['cliente'] || '')
    const horas = safeParseFloat(row['horas'] || '0')
    const horasExtra = safeParseFloat(row['h extra'] || row['horas_extra'] || row['hextra'] || '0')
    const descripcion = sanitizeDescription(row['informacion'] || row['descripcion'] || '')
    const fecha = sanitizeString(row['fecha'] || '', 50)
    const montoStr = row['monto reporte'] || row['monto'] || ''
    const valorHoraStr = row['valor hora'] || row['valor_hora'] || ''
    const numReporteStr = row['n reporte'] || row['nreporte'] || row['numero_reporte'] || ''
    const rutStr = sanitizeString(row['rut'] || '', 20)
    const pagado = (row['estado'] || row['pagado'] || '').toLowerCase()
    const estadoReporte = (row['estado de reporte'] || row['estado_reporte'] || row['factura'] || '').toLowerCase()

    if (!choferName || !clienteName || !fecha) {
      errors.push(`Fila ${rowNum}: faltan campos obligatorios (responsable/chofer, empresa/cliente, fecha)`)
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
      errors.push(`Fila ${rowNum}: cliente/empresa "${clienteName}" no encontrado`)
      continue
    }

    // Update client RUT if provided and not set
    if (rutStr && !cliente.rut) {
      await prisma.cliente.update({
        where: { id: cliente.id },
        data: { rut: rutStr }
      })
    }

    const valorHora = valorHoraStr ? safeParseFloat(valorHoraStr.replace(/[$.]/g, '').trim(), 60000) : 60000
    const monto = montoStr ? safeParseFloat(montoStr.replace(/[$.]/g, '').trim(), (horas + horasExtra) * valorHora) : (horas + horasExtra) * valorHora
    const numeroReporte = safeParseInt(numReporteStr)

    const esPagado = pagado === 'pagado' || pagado === 'si' || pagado === 'sí' || pagado === 'true'
    let estadoRpt: string = 'sin factura'
    if (estadoReporte.includes('facturado') || estadoReporte === 'si' || estadoReporte === 'sí' || estadoReporte === 'true') {
      estadoRpt = 'facturado'
    } else if (estadoReporte.includes('espera')) {
      estadoRpt = 'ESPERA OC'
    }

    try {
      await prisma.$transaction(async (tx) => {
        const solicitud = await tx.solicitud.create({
          data: {
            codigo: generateCode('SOL'),
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

        await tx.reporte.create({
          data: {
            codigo: generateCode('RPT'),
            numeroReporte,
            solicitudId: solicitud.id,
            choferId: chofer.id,
            fecha,
            horas: horas || 0,
            horasExtra,
            valorHora,
            descripcion: descripcion || 'Importado desde CSV',
            monto,
            pagado: esPagado,
            factura: estadoRpt === 'facturado',
            estadoReporte: estadoRpt,
          }
        })
      })
      created++
    } catch {
      errors.push(`Fila ${rowNum}: error al importar registro`)
    }
  }

  revalidatePath('/reportes')
  revalidatePath('/facturacion')
  revalidatePath('/estadisticas')
  revalidatePath('/clientes')
  revalidatePath('/')

  return { created, errors }
}
