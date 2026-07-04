import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DashboardPage } from '@/modules/dashboard/DashboardPage'
import { ProjectCatalogPage } from '@/modules/project/ProjectCatalogPage'
import { ProjectDetailPage } from '@/modules/project/ProjectDetailPage'
import { MemoryPage } from '@/modules/memory/MemoryPage'
import { SkillsPage } from '@/modules/skills/SkillsPage'
import { KnowledgePage } from '@/modules/knowledge/KnowledgePage'
import { SearchPage } from '@/modules/search/SearchPage'
import { UserGuidePage } from '@/modules/guide/UserGuidePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectCatalogPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/memory" element={<MemoryPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/guide" element={<UserGuidePage />} />
      </Routes>
    </BrowserRouter>
  )
}
