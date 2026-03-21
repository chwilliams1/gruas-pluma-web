import { NextResponse } from 'next/server'
import { authenticateRequest, unauthorizedResponse } from '@/lib/auth'
import { getCorsHeaders, corsOptions } from '@/lib/cors'

export async function OPTIONS(req: Request) {
  return corsOptions(req)
}

export async function GET(req: Request) {
  const headers = getCorsHeaders(req)
  const auth = authenticateRequest(req)
  if (!auth) return unauthorizedResponse(headers)

  const url = new URL(req.url)
  const rut = url.searchParams.get('rut')

  if (!rut || !/^\d{7,8}-[\dkK]$/i.test(rut)) {
    return NextResponse.json(
      { error: 'Formato de RUT invalido' },
      { status: 400, headers }
    )
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(
      `https://api.libreapi.cl/rut/activities/${encodeURIComponent(rut)}`,
      { signal: controller.signal }
    )
    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.json(
        { error: 'No encontrado' },
        { status: 404, headers }
      )
    }

    const data = await res.json()
    const razonSocial = data?.data?.razon_social || data?.razon_social

    if (!razonSocial) {
      return NextResponse.json(
        { error: 'No encontrado' },
        { status: 404, headers }
      )
    }

    return NextResponse.json({ razonSocial }, { headers })
  } catch {
    return NextResponse.json(
      { error: 'Servicio de consulta no disponible' },
      { status: 502, headers }
    )
  }
}
