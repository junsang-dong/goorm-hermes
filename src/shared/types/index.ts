export interface Project {
  id: string
  name: string
  description: string | null
  status: string
  tech_stack: string[] | null
  github_repo: string | null
  deploy_url: string | null
  created_at: string
  updated_at: string
}

export interface Repository {
  id: string
  project_id: string
  owner: string
  repo_name: string
  default_branch: string
  summary: string | null
  tech_detected: string[] | null
  last_synced_at: string | null
}

export interface Document {
  id: string
  project_id: string
  title: string
  doc_type: string
  file_path: string | null
  version: number
  tags: string[] | null
  summary: string | null
  created_at: string
}

export interface Memory {
  id: string
  project_id: string | null
  memory_type: string
  content: string
  source: string | null
  hermes_synced: boolean
  created_at: string
}

export interface Skill {
  id: string
  project_id: string | null
  name: string
  description: string | null
  skill_md: string | null
  source_pattern: string | null
  usage_count: number
  created_at: string
}

export interface Reflection {
  id: string
  project_id: string
  session_id: string | null
  content: Record<string, unknown> | null
  created_at: string
}

export interface SearchResult {
  id: string
  type: string
  title: string
  snippet: string
  score: number
}

export interface SearchResponse {
  query: string
  mode: string
  results: SearchResult[]
  answer?: string
}

export interface GraphData {
  nodes: { id: string; type: string; label: string; project_id?: string }[]
  edges: { id: string; source: string; target: string; relation: string }[]
}
