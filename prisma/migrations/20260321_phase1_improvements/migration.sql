-- Phase 1 improvements migration
-- 1. Convert fecha String → DateTime in Solicitud and Reporte
-- 2. Add updatedAt to all models
-- 3. Add Tarifa model for configurable pricing
-- 4. Add HistorialEstado model for audit trail
-- 5. Add pushToken to Usuario
-- 6. Add indexes for performance

-- Add updatedAt columns (with default now() for existing rows)
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Grua" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Solicitud" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Reporte" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add pushToken to Usuario
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "pushToken" TEXT;

-- Convert fecha from String to DateTime
-- Step 1: Add new DateTime column
ALTER TABLE "Solicitud" ADD COLUMN IF NOT EXISTS "fecha_new" TIMESTAMP(3);
ALTER TABLE "Reporte" ADD COLUMN IF NOT EXISTS "fecha_new" TIMESTAMP(3);

-- Step 2: Migrate existing data (try to parse various date formats)
-- Chilean locale dates like "20-03-2026", "20 Mar 2026", etc.
UPDATE "Solicitud" SET "fecha_new" = CASE
  WHEN "fecha" ~ '^\d{4}-\d{2}-\d{2}' THEN "fecha"::timestamp
  WHEN "fecha" ~ '^\d{1,2}-\d{1,2}-\d{4}$' THEN TO_TIMESTAMP("fecha", 'DD-MM-YYYY')
  WHEN "fecha" ~ '^\d{1,2}/\d{1,2}/\d{4}$' THEN TO_TIMESTAMP("fecha", 'DD/MM/YYYY')
  ELSE "creadoEn"
END WHERE "fecha_new" IS NULL;

UPDATE "Reporte" SET "fecha_new" = CASE
  WHEN "fecha" ~ '^\d{4}-\d{2}-\d{2}' THEN "fecha"::timestamp
  WHEN "fecha" ~ '^\d{1,2}-\d{1,2}-\d{4}$' THEN TO_TIMESTAMP("fecha", 'DD-MM-YYYY')
  WHEN "fecha" ~ '^\d{1,2}/\d{1,2}/\d{4}$' THEN TO_TIMESTAMP("fecha", 'DD/MM/YYYY')
  ELSE "creadoEn"
END WHERE "fecha_new" IS NULL;

-- Step 3: Drop old column and rename new one
ALTER TABLE "Solicitud" DROP COLUMN "fecha";
ALTER TABLE "Solicitud" RENAME COLUMN "fecha_new" TO "fecha";
ALTER TABLE "Solicitud" ALTER COLUMN "fecha" SET NOT NULL;
ALTER TABLE "Solicitud" ALTER COLUMN "fecha" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Reporte" DROP COLUMN "fecha";
ALTER TABLE "Reporte" RENAME COLUMN "fecha_new" TO "fecha";
ALTER TABLE "Reporte" ALTER COLUMN "fecha" SET NOT NULL;
ALTER TABLE "Reporte" ALTER COLUMN "fecha" SET DEFAULT CURRENT_TIMESTAMP;

-- Create Tarifa table
CREATE TABLE IF NOT EXISTS "Tarifa" (
  "id" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "valorHora" DOUBLE PRECISION NOT NULL,
  "minimoHoras" DOUBLE PRECISION NOT NULL DEFAULT 3,
  "activa" BOOLEAN NOT NULL DEFAULT true,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Tarifa_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Tarifa_nombre_key" ON "Tarifa"("nombre");

-- Seed default tarifas
INSERT INTO "Tarifa" ("id", "nombre", "valorHora", "minimoHoras")
VALUES
  ('tarifa_standard', 'standard', 60000, 3),
  ('tarifa_alzahombre', 'alzahombre', 65000, 3)
ON CONFLICT ("nombre") DO NOTHING;

-- Create HistorialEstado table
CREATE TABLE IF NOT EXISTS "HistorialEstado" (
  "id" TEXT NOT NULL,
  "solicitudId" TEXT NOT NULL,
  "estadoAnterior" TEXT,
  "estadoNuevo" TEXT NOT NULL,
  "nota" TEXT,
  "usuarioId" TEXT,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HistorialEstado_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "HistorialEstado" ADD CONSTRAINT "HistorialEstado_solicitudId_fkey"
  FOREIGN KEY ("solicitudId") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HistorialEstado" ADD CONSTRAINT "HistorialEstado_usuarioId_fkey"
  FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add indexes
CREATE INDEX IF NOT EXISTS "Usuario_rol_idx" ON "Usuario"("rol");
CREATE INDEX IF NOT EXISTS "Usuario_email_idx" ON "Usuario"("email");
CREATE INDEX IF NOT EXISTS "Cliente_nombre_idx" ON "Cliente"("nombre");
CREATE INDEX IF NOT EXISTS "Cliente_rut_idx" ON "Cliente"("rut");
CREATE INDEX IF NOT EXISTS "Solicitud_choferId_idx" ON "Solicitud"("choferId");
CREATE INDEX IF NOT EXISTS "Solicitud_clienteId_idx" ON "Solicitud"("clienteId");
CREATE INDEX IF NOT EXISTS "Solicitud_estado_idx" ON "Solicitud"("estado");
CREATE INDEX IF NOT EXISTS "Solicitud_fecha_idx" ON "Solicitud"("fecha");
CREATE INDEX IF NOT EXISTS "Reporte_choferId_idx" ON "Reporte"("choferId");
CREATE INDEX IF NOT EXISTS "Reporte_fecha_idx" ON "Reporte"("fecha");
CREATE INDEX IF NOT EXISTS "Reporte_pagado_idx" ON "Reporte"("pagado");
CREATE INDEX IF NOT EXISTS "HistorialEstado_solicitudId_idx" ON "HistorialEstado"("solicitudId");
CREATE INDEX IF NOT EXISTS "HistorialEstado_creadoEn_idx" ON "HistorialEstado"("creadoEn");
