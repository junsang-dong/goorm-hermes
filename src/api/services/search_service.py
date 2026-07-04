from __future__ import annotations

import uuid

from sqlalchemy import or_, text
from sqlalchemy.orm import Session

from ..database import _is_sqlite
from ..models import Document, DocumentEmbedding, Memory, Project, Skill
from .gateway_service import GatewayService


class SearchService:
    def __init__(self, db: Session):
        self.db = db
        self.gateway = GatewayService()

    def keyword_search(self, query: str, limit: int = 20) -> list[dict]:
        results = []
        q = f"%{query}%"

        for p in self.db.query(Project).filter(
            or_(Project.name.ilike(q), Project.description.ilike(q))
        ).limit(limit).all():
            results.append({
                "id": str(p.id), "type": "project", "title": p.name,
                "snippet": (p.description or "")[:200], "score": 1.0,
            })

        for d in self.db.query(Document).filter(
            or_(Document.title.ilike(q), Document.summary.ilike(q), Document.content.ilike(q))
        ).limit(limit).all():
            results.append({
                "id": str(d.id), "type": "document", "title": d.title,
                "snippet": (d.summary or "")[:200], "score": 0.9,
            })

        for m in self.db.query(Memory).filter(Memory.content.ilike(q)).limit(limit).all():
            results.append({
                "id": str(m.id), "type": "memory", "title": m.memory_type,
                "snippet": m.content[:200], "score": 0.8,
            })

        for s in self.db.query(Skill).filter(
            or_(Skill.name.ilike(q), Skill.description.ilike(q))
        ).limit(limit).all():
            results.append({
                "id": str(s.id), "type": "skill", "title": s.name,
                "snippet": (s.description or "")[:200], "score": 0.7,
            })

        return sorted(results, key=lambda x: x["score"], reverse=True)[:limit]

    async def semantic_search(self, query: str, limit: int = 10) -> list[dict]:
        if _is_sqlite:
            return []
        try:
            embedding = await self.gateway.embed(query)
        except Exception:
            return []

        results = []
        doc_embs = self.db.execute(
            text(
                "SELECT de.document_id, de.content, d.title, "
                "1 - (de.embedding <=> :emb) as score "
                "FROM document_embeddings de "
                "JOIN documents d ON d.id = de.document_id "
                "WHERE de.embedding IS NOT NULL "
                "ORDER BY de.embedding <=> :emb LIMIT :lim"
            ),
            {"emb": str(embedding), "lim": limit},
        ).fetchall()

        for row in doc_embs:
            results.append({
                "id": str(row[0]), "type": "document", "title": row[2],
                "snippet": row[1][:200], "score": float(row[3]),
            })

        mem_embs = self.db.execute(
            text(
                "SELECT id, content, memory_type, "
                "1 - (embedding <=> :emb) as score "
                "FROM memories WHERE embedding IS NOT NULL "
                "ORDER BY embedding <=> :emb LIMIT :lim"
            ),
            {"emb": str(embedding), "lim": limit},
        ).fetchall()

        for row in mem_embs:
            results.append({
                "id": str(row[0]), "type": "memory", "title": row[2],
                "snippet": row[1][:200], "score": float(row[3]),
            })

        return sorted(results, key=lambda x: x["score"], reverse=True)[:limit]

    async def hybrid_search(self, query: str, limit: int = 20) -> list[dict]:
        keyword = self.keyword_search(query, limit)
        semantic = await self.semantic_search(query, limit)

        scores: dict[str, dict] = {}
        for rank, item in enumerate(keyword):
            key = f"{item['type']}:{item['id']}"
            scores[key] = {**item, "score": scores.get(key, {}).get("score", 0) + 1 / (rank + 1)}
        for rank, item in enumerate(semantic):
            key = f"{item['type']}:{item['id']}"
            if key in scores:
                scores[key]["score"] += 1 / (rank + 1)
            else:
                scores[key] = {**item, "score": 1 / (rank + 1)}

        return sorted(scores.values(), key=lambda x: x["score"], reverse=True)[:limit]

    async def rag_search(self, query: str, limit: int = 5) -> tuple[list[dict], str]:
        results = await self.hybrid_search(query, limit)
        context = "\n\n".join(f"[{r['type']}] {r['title']}: {r['snippet']}" for r in results)
        try:
            answer_result = await self.gateway.generate(
                provider="claude",
                model="claude-sonnet-4-6",
                prompt=f"Question: {query}\n\nContext:\n{context}\n\nAnswer in Korean based on the context.",
            )
            answer = answer_result.get("text", "")
        except Exception:
            answer = "답변을 생성할 수 없습니다."
        return results, answer
