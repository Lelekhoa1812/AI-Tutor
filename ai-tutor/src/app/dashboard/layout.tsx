'use client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* <h1 className="text-xl font-bold">AI Tutor</h1> */}
        </div>
      </header>
      <main className="container py-6">
        {children}
      </main>
    </div>
  )
} 