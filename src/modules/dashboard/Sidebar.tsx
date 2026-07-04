import { Link, useLocation } from 'react-router-dom'
import { Brain, BookOpen, FolderKanban, GitBranch, Home, Network, Search, Sparkles } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const nav = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/memory', label: 'Memory', icon: Brain },
  { to: '/skills', label: 'Skills', icon: Sparkles },
  { to: '/knowledge', label: 'Knowledge Graph', icon: Network },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/guide', label: 'User Guide', icon: BookOpen },
]

export function Sidebar() {
  const location = useLocation()
  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex items-center gap-2 border-b px-6 py-5">
        <GitBranch className="h-6 w-6 text-primary" />
        <div>
          <div className="font-bold">Goorm Hermes</div>
          <div className="text-xs text-muted-foreground">Developer Knowledge OS</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {nav.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
