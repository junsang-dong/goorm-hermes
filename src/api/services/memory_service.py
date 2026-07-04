from __future__ import annotations

import json
import re
import uuid

from sqlalchemy.orm import Session

from ..models import Memory, Reflection, Skill
from .gateway_service import GatewayService
from .knowledge_service import KnowledgeService


class MemoryService:
    def __init__(self, db: Session):
        self.db = db
        self.gateway = GatewayService()

    async def create_memory(
        self, memory_type: str, content: str, project_id: uuid.UUID | None = None, source: str | None = None
    ) -> Memory:
        embedding = None
        try:
            embedding = await self.gateway.embed(content)
        except Exception:
            pass
        mem = Memory(
            project_id=project_id,
            memory_type=memory_type,
            content=content,
            source=source,
            embedding=embedding,
        )
        self.db.add(mem)
        self.db.commit()
        self.db.refresh(mem)
        return mem


class ReflectionService:
    def __init__(self, db: Session):
        self.db = db
        self.gateway = GatewayService()
        self.knowledge = KnowledgeService(db)

    async def run_reflection(self, project_id: uuid.UUID) -> Reflection:
        from ..models import Document, Project, Repository, RepositorySnapshot

        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ValueError("Project not found")

        docs = self.db.query(Document).filter(Document.project_id == project_id).limit(5).all()
        repos = self.db.query(Repository).filter(Repository.project_id == project_id).all()
        snapshots = []
        for repo in repos:
            snaps = (
                self.db.query(RepositorySnapshot)
                .filter(RepositorySnapshot.repository_id == repo.id)
                .order_by(RepositorySnapshot.analyzed_at.desc())
                .limit(3)
                .all()
            )
            snapshots.extend(snaps)

        context = f"Project: {project.name}\n{project.description}\n"
        context += f"Documents: {[d.title for d in docs]}\n"
        context += f"Tech: {project.tech_stack}\n"

        prompt = f"""Reflect on this development project and return JSON:
{{
  "what_went_well": ["..."],
  "what_was_hard": ["..."],
  "improvements": ["..."],
  "extracted_skills": ["Skill Name"]
}}

Context:
{context}"""

        result = await self.gateway.generate(
            provider="claude",
            model="claude-sonnet-4-6",
            prompt=prompt,
            system_prompt="Return only valid JSON in Korean.",
        )
        match = re.search(r"\{[\s\S]*\}", result.get("text", "{}"))
        content = json.loads(match.group() if match else "{}")

        reflection = Reflection(project_id=project_id, content=content)
        self.db.add(reflection)
        self.db.commit()
        self.db.refresh(reflection)

        memory_svc = MemoryService(self.db)
        summary = f"Reflection on {project.name}: well={content.get('what_went_well', [])}, hard={content.get('what_was_hard', [])}"
        await memory_svc.create_memory("long_term", summary, project_id, source="reflection")

        for skill_name in content.get("extracted_skills", []):
            skill_md = f"# {skill_name}\n\nExtracted from reflection on {project.name}.\n"
            skill = Skill(
                project_id=project_id,
                name=skill_name,
                description=f"Auto-extracted from reflection",
                skill_md=skill_md,
                source_pattern="reflection",
            )
            self.db.add(skill)
            self.db.commit()
            self.knowledge.sync_from_skill(skill)

        self.knowledge.sync_from_reflection(reflection)
        return reflection
