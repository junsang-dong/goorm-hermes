import { useEffect, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { Layout } from '@/modules/dashboard/Layout'
import { api } from '@/shared/api'
import type { GraphData } from '@/shared/types'

export function KnowledgePage() {
  const [graph, setGraph] = useState<GraphData>({ nodes: [], edges: [] })

  useEffect(() => {
    api.get<GraphData>('/api/v1/knowledge/graph').then(setGraph).catch(() => {})
  }, [])

  const graphData = {
    nodes: graph.nodes.map((n) => ({ ...n, id: n.id, name: n.label, val: 1 })),
    links: graph.edges.map((e) => ({ source: e.source, target: e.target, label: e.relation })),
  }

  return (
    <Layout title="Knowledge Graph">
      <div className="h-[600px] overflow-hidden rounded-xl border bg-card">
        {graph.nodes.length ? (
          <ForceGraph2D
            graphData={graphData}
            nodeLabel="name"
            nodeAutoColorBy="type"
            linkDirectionalArrowLength={4}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            그래프 데이터가 없습니다. 프로젝트, 문서, 스킬을 추가하면 자동으로 구축됩니다.
          </div>
        )}
      </div>
    </Layout>
  )
}
