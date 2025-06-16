'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Navbar } from '@/components/layout/Navbar'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Navbar />
            {children}
          </div>
        </AuthProvider>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  )
} 