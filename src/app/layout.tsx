import type { Metadata } from 'next'
import { LayoutShell } from '@/components/LayoutShell'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gruas Pluma | Dashboard',
  description: 'Panel administrativo web',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="flex min-h-screen bg-canvas text-ink">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  )
}
