import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Limpiar DB
  await prisma.reporte.deleteMany()
  await prisma.solicitud.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.grua.deleteMany()

  // Hash passwords para que funcionen con bcrypt.compare() en el login
  const hash123 = await bcrypt.hash('123', 12)
  const hashAdmin = await bcrypt.hash('password123', 12)

  // ─── Grúas ───
  const grua1 = await prisma.grua.create({
    data: {
      patente: 'RKJL-45',
      marca: 'Liebherr',
      modelo: 'LTM 1025-3.1',
      anio: 2022,
      capacidad: '25 ton',
      tipo: 'Telescópica',
      estado: 'DISPONIBLE'
    }
  })

  const grua2 = await prisma.grua.create({
    data: {
      patente: 'GGWP-12',
      marca: 'Tadano',
      modelo: 'GR-500EXL',
      anio: 2021,
      capacidad: '50 ton',
      tipo: 'Telescópica',
      estado: 'EN_SERVICIO'
    }
  })

  const grua3 = await prisma.grua.create({
    data: {
      patente: 'BXTY-78',
      marca: 'Manitowoc',
      modelo: 'GMK 3060',
      anio: 2023,
      capacidad: '60 ton',
      tipo: 'Pluma',
      estado: 'DISPONIBLE'
    }
  })

  const grua4 = await prisma.grua.create({
    data: {
      patente: 'HKZM-33',
      marca: 'Palfinger',
      modelo: 'PK 65002',
      anio: 2020,
      capacidad: '18 ton',
      tipo: 'Articulada',
      estado: 'MANTENCION'
    }
  })

  const grua5 = await prisma.grua.create({
    data: {
      patente: 'NRVT-91',
      marca: 'Liebherr',
      modelo: 'LTM 1100-5.2',
      anio: 2024,
      capacidad: '100 ton',
      tipo: 'Telescópica',
      estado: 'DISPONIBLE'
    }
  })

  // ─── Usuarios ───
  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Charles Duarte',
      email: 'admin@gruaspluma.cl',
      password: hashAdmin,
      rol: 'ADMIN'
    }
  })

  const juan = await prisma.usuario.create({
    data: {
      nombre: 'Juan Pérez',
      email: 'juan@gruaspluma.cl',
      password: hash123,
      rol: 'CHOFER',
      telefono: '+56 9 6543 2100',
      licencia: 'A-4',
      gruaId: grua1.id
    }
  })

  const carlos = await prisma.usuario.create({
    data: {
      nombre: 'Carlos Muñoz',
      email: 'carlos@gruaspluma.cl',
      password: hash123,
      rol: 'CHOFER',
      telefono: '+56 9 7654 3210',
      licencia: 'A-2',
      gruaId: grua2.id
    }
  })

  const pedro = await prisma.usuario.create({
    data: {
      nombre: 'Pedro Soto',
      email: 'pedro@gruaspluma.cl',
      password: hash123,
      rol: 'CHOFER',
      telefono: '+56 9 8765 4320',
      licencia: 'A-4',
      gruaId: grua3.id
    }
  })

  // ─── Clientes ───
  const cli1 = await prisma.cliente.create({
    data: { nombre: 'Constructora Andes', telefono: '+56 9 8765 4321', direccion: 'Av Kennedy 123, Las Condes' }
  })
  const cli2 = await prisma.cliente.create({
    data: { nombre: 'Minera del Sur', telefono: '+56 9 1111 2222', direccion: 'Faena 4, Rancagua' }
  })
  const cli3 = await prisma.cliente.create({
    data: { nombre: 'Inmobiliaria Pacífico', telefono: '+56 9 3333 4444', direccion: 'Av Providencia 2100' }
  })
  const cli4 = await prisma.cliente.create({
    data: { nombre: 'ENEL Chile', telefono: '+56 9 5555 6666', direccion: 'Santa Rosa 76, Santiago Centro' }
  })
  const cli5 = await prisma.cliente.create({
    data: { nombre: 'Constructora Los Robles', telefono: '+56 9 7777 8888', direccion: 'Camino Lo Prado 340' }
  })
  const cli6 = await prisma.cliente.create({
    data: { nombre: 'Municipalidad de Pudahuel', telefono: '+56 2 2222 3333', direccion: 'San Pablo 8444, Pudahuel' }
  })

  // ─── Solicitudes NUEVAS ───
  await prisma.solicitud.create({
    data: {
      codigo: 'SOL-012', clienteId: cli1.id,
      tipo: 'Izaje', descripcion: 'Necesitamos subir 3 vigas de acero al tercer piso del edificio en construcción',
      fecha: '20 Mar 2026', hora: 'Mañana (8-12)', direccion: 'Av. Industrial 450, Pudahuel', estado: 'NUEVA'
    }
  })
  await prisma.solicitud.create({
    data: {
      codigo: 'SOL-013', clienteId: cli3.id,
      tipo: 'Descarga', descripcion: 'Descarga de contenedores con materiales de construcción en obra de 12 pisos',
      fecha: '21 Mar 2026', hora: 'Tarde (14-18)', direccion: 'Av Providencia 2400', estado: 'NUEVA'
    }
  })
  await prisma.solicitud.create({
    data: {
      codigo: 'SOL-014', clienteId: cli6.id,
      tipo: 'Montaje', descripcion: 'Montaje de estructura metálica para techumbre de cancha municipal',
      fecha: '22 Mar 2026', hora: 'Mañana (8-12)', direccion: 'Complejo Deportivo Pudahuel', estado: 'NUEVA'
    }
  })

  // ─── Solicitudes ASIGNADAS (con grúa) ───
  await prisma.solicitud.create({
    data: {
      codigo: 'SOL-010', clienteId: cli2.id, choferId: carlos.id, gruaId: grua2.id,
      tipo: 'Montaje', descripcion: 'Montaje de poste de alta tensión',
      fecha: '21 Mar 2026', hora: 'Mañana (8-12)', direccion: 'Subestación Norte', estado: 'ASIGNADA'
    }
  })
  await prisma.solicitud.create({
    data: {
      codigo: 'SOL-011', clienteId: cli4.id, choferId: pedro.id, gruaId: grua3.id,
      tipo: 'Izaje', descripcion: 'Izaje de transformador eléctrico de 2 toneladas',
      fecha: '20 Mar 2026', hora: 'Tarde (14-18)', direccion: 'Subestación Maipú', estado: 'ASIGNADA'
    }
  })

  // ─── Solicitudes COMPLETADAS con reportes ───
  const solC1 = await prisma.solicitud.create({
    data: {
      codigo: 'SOL-009', clienteId: cli1.id, choferId: juan.id, gruaId: grua1.id,
      tipo: 'Izaje', descripcion: 'Izaje de estructura metálica principal',
      fecha: '19 Mar 2026', hora: 'Mañana (8-12)', direccion: 'Obra Los Robles', estado: 'COMPLETADA'
    }
  })
  const solC2 = await prisma.solicitud.create({
    data: {
      codigo: 'SOL-008', clienteId: cli2.id, choferId: carlos.id, gruaId: grua2.id,
      tipo: 'Traslado', descripcion: 'Traslado de maquinaria pesada desde bodega a faena',
      fecha: '18 Mar 2026', hora: 'Mañana (8-12)', direccion: 'Bodega Central → Faena 4', estado: 'COMPLETADA'
    }
  })
  const solC3 = await prisma.solicitud.create({
    data: {
      codigo: 'SOL-007', clienteId: cli3.id, choferId: juan.id, gruaId: grua1.id,
      tipo: 'Descarga', descripcion: 'Descarga de paneles prefabricados de hormigón',
      fecha: '17 Mar 2026', hora: 'Tarde (14-18)', direccion: 'Av Providencia 2100', estado: 'COMPLETADA'
    }
  })
  const solC4 = await prisma.solicitud.create({
    data: {
      codigo: 'SOL-006', clienteId: cli5.id, choferId: pedro.id, gruaId: grua3.id,
      tipo: 'Izaje', descripcion: 'Izaje de vigas de acero para segundo piso',
      fecha: '16 Mar 2026', hora: 'Mañana (8-12)', direccion: 'Camino Lo Prado 340', estado: 'COMPLETADA'
    }
  })
  const solC5 = await prisma.solicitud.create({
    data: {
      codigo: 'SOL-005', clienteId: cli4.id, choferId: carlos.id, gruaId: grua2.id,
      tipo: 'Montaje', descripcion: 'Instalación de poste de distribución eléctrica',
      fecha: '15 Mar 2026', hora: 'Mañana (8-12)', direccion: 'Av Libertador 890', estado: 'COMPLETADA'
    }
  })
  const solC6 = await prisma.solicitud.create({
    data: {
      codigo: 'SOL-004', clienteId: cli1.id, choferId: juan.id, gruaId: grua1.id,
      tipo: 'Izaje', descripcion: 'Colocación de tanque de agua en azotea',
      fecha: '14 Mar 2026', hora: 'Tarde (14-18)', direccion: 'Av Kennedy 123', estado: 'COMPLETADA'
    }
  })

  // ─── Reportes ───
  await prisma.reporte.create({
    data: { codigo: 'RPT-0041', solicitudId: solC1.id, choferId: juan.id, fecha: '19 Mar 2026', horas: 4,
      descripcion: 'Izaje de estructura metálica completado sin incidentes. Grúa Liebherr 25 ton.', pagado: true, factura: true, monto: 180000 }
  })
  await prisma.reporte.create({
    data: { codigo: 'RPT-0040', solicitudId: solC2.id, choferId: carlos.id, fecha: '18 Mar 2026', horas: 6,
      descripcion: 'Traslado de retroexcavadora completado. Ruta por Ruta 5.', pagado: false, factura: true, monto: 270000 }
  })
  await prisma.reporte.create({
    data: { codigo: 'RPT-0039', solicitudId: solC3.id, choferId: juan.id, fecha: '17 Mar 2026', horas: 3,
      descripcion: 'Descarga de 8 paneles de hormigón prefabricado.', pagado: true, factura: true, monto: 135000 }
  })
  await prisma.reporte.create({
    data: { codigo: 'RPT-0038', solicitudId: solC4.id, choferId: pedro.id, fecha: '16 Mar 2026', horas: 5,
      descripcion: 'Izaje de 6 vigas de acero H. Condiciones climáticas óptimas.', pagado: false, factura: false, monto: 225000 }
  })
  await prisma.reporte.create({
    data: { codigo: 'RPT-0037', solicitudId: solC5.id, choferId: carlos.id, fecha: '15 Mar 2026', horas: 4,
      descripcion: 'Montaje de poste eléctrico de 18m. Coordinado con equipo ENEL.', pagado: true, factura: true, monto: 180000 }
  })
  await prisma.reporte.create({
    data: { codigo: 'RPT-0036', solicitudId: solC6.id, choferId: juan.id, fecha: '14 Mar 2026', horas: 2,
      descripcion: 'Colocación de tanque de agua de 5000L en azotea.', pagado: false, factura: false, monto: 90000 }
  })

  console.log('✅ Seed exitoso: 1 admin + 3 choferes, 5 grúas, 6 clientes, 11 solicitudes, 6 reportes')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
