'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 px-4 pt-[72px] pb-6 sm:px-6 lg:px-8 lg:pt-8 xl:px-10 max-h-screen overflow-auto relative z-0">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </>
  )
}
