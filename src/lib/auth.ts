import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production')
  }
  return secret || 'dev-secret-change-in-production'
}

export interface JwtPayload {
  userId: string
  rol: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '24h' })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getSecret()) as JwtPayload
  } catch {
    return null
  }
}

export function extractToken(req: Request): string | null {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7)
}

export function authenticateRequest(req: Request): JwtPayload | null {
  const token = extractToken(req)
  if (!token) return null
  return verifyToken(token)
}

export function unauthorizedResponse(headers?: Record<string, string>) {
  return NextResponse.json(
    { error: 'No autorizado' },
    { status: 401, headers }
  )
}

export function forbiddenResponse(headers?: Record<string, string>) {
  return NextResponse.json(
    { error: 'Acceso denegado' },
    { status: 403, headers }
  )
}

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
