from __future__ import annotations

import json
import re
import uuid

from sqlalchemy.orm import Session

from ..models import (
    Document,
    DocumentEmbedding,
    KnowledgeEdge,
    KnowledgeNode,
    Memory,
    Project,
    Reflection,
    Repository,
    RepositorySnapshot,
    Skill,
)
from .gateway_service import GatewayService
from .github_service import GitHubService, parse_github_url
from .knowledge_service import KnowledgeService


class RepositoryService:
    def __init__(self, db: Session):
        self.db = db
        self.github = GitHubService()
        self.gateway = GatewayService()
        self.knowledge = KnowledgeService(db)

    async def sync_repository(self, repository_id: uuid.UUID) -> Repository:
        repo = self.db.query(Repository).filter(Repository.id == repository_id).first()
        if not repo:
            raise ValueError("Repository not found")

        data = await self.github.fetch_repo_data(repo.owner, repo.repo_name)

        for snap_type, snap_data in [
            ("readme", {"content": data["readme"]}),
            ("commits", data["commits"]),
            ("releases", data["releases"]),
            ("issues", data["issues"]),
            ("pulls", data["pulls"]),
            ("package_json", data["package_json"]),
            ("tree", data["tree"]),
        ]:
            if snap_data:
                self.db.add(
                    RepositorySnapshot(
                        repository_id=repo.id,
                        snapshot_type=snap_type,
                        raw_data=snap_data if isinstance(snap_data, dict) else {"items": snap_data},
                    )
                )

        analysis = await self._analyze_repo(data)
        repo.summary = analysis.get("summary")
        repo.tech_detected = analysis.get("tech_stack", [])
        from datetime import datetime, timezone
        repo.last_synced_at = datetime.now(timezone.utc)

        project = self.db.query(Project).filter(Project.id == repo.project_id).first()
        if project and analysis.get("tech_stack"):
            project.tech_stack = list(set((project.tech_stack or []) + analysis["tech_stack"]))

        self.db.commit()
        self.db.refresh(repo)

        self.knowledge.sync_from_repository(repo, analysis)
        return repo

    async def _analyze_repo(self, data: dict) -> dict:
        readme = data.get("readme", "")[:4000]
        pkg = json.dumps(data.get("package_json") or {}, indent=2)[:2000]
        prompt = f"""Analyze this GitHub repository and return JSON with keys:
- summary: 2-3 sentence project summary in Korean
- tech_stack: array of technology names
- main_features: array of main features
- change_history: brief timeline summary

README:
{readme}

package.json:
{pkg}"""

        try:
            result = await self.gateway.generate(
                provider="claude",
                model="claude-sonnet-4-6",
                prompt=prompt,
                system_prompt="Return only valid JSON, no markdown fences.",
            )
            text = result.get("text", "{}")
            match = re.search(r"\{[\s\S]*\}", text)
            return json.loads(match.group() if match else text)
        except Exception:
            tech = []
            if data.get("package_json"):
                deps = {**data["package_json"].get("dependencies", {}), **data["package_json"].get("devDependencies", {})}
                tech = list(deps.keys())[:10]
            return {
                "summary": readme[:300] if readme else "No README available",
                "tech_stack": tech,
                "main_features": [],
                "change_history": "",
            }

    def create_from_project(self, project: Project) -> Repository | None:
        parsed = parse_github_url(project.github_repo or "")
        if not parsed:
            return None
        owner, repo_name = parsed
        existing = (
            self.db.query(Repository)
            .filter(Repository.project_id == project.id, Repository.owner == owner, Repository.repo_name == repo_name)
            .first()
        )
        if existing:
            return existing
        repo = Repository(project_id=project.id, owner=owner, repo_name=repo_name)
        self.db.add(repo)
        self.db.commit()
        self.db.refresh(repo)
        return repo
