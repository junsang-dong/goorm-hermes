import { Footer } from './Footer'
import { Sidebar } from './Sidebar'

export function Layout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-auto">
        <main className="flex-1">
          <header className="border-b px-8 py-6">
            <h1 className="text-2xl font-bold">{title}</h1>
          </header>
          <div className="p-8">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  )
}
