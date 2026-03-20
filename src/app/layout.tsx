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
      <body className="flex min-h-screen bg-brand-bg text-brand-text">
        <Sidebar />
        <main className="flex-1 p-4 pt-20 sm:p-6 sm:pt-22 lg:p-8 lg:pt-8 xl:p-10 max-h-screen overflow-auto relative z-0">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
