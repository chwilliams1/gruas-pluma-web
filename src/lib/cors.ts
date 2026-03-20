import { NextResponse } from 'next/server'

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:19006']

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || ''
  const isLocalDev = origin.startsWith('http://localhost:')
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) || isLocalDev ? origin : ALLOWED_ORIGINS[0]

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

export function corsOptions(req: Request) {
  return NextResponse.json(null, { headers: getCorsHeaders(req) })
}
