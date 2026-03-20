import type { Metadata } from 'next'
import { Sidebar } from '@/components/Sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Grúas Pluma | Dashboard',
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
        <Sidebar />
        <main className="flex-1 px-4 pt-[72px] pb-6 sm:px-6 lg:px-8 lg:pt-8 xl:px-10 max-h-screen overflow-auto relative z-0">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
