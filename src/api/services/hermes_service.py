from __future__ import annotations

import json
import os
import re
import subprocess
import uuid
from pathlib import Path

from sqlalchemy.orm import Session

from ..config import settings
from ..models import Memory, Project


class HermesService:
    def __init__(self, db: Session):
        self.db = db
        self.hermes_home = Path(os.path.expanduser(settings.hermes_home))

    def status(self) -> dict:
        hermes_bin = self._find_hermes()
        return {
            "hermes_installed": hermes_bin is not None,
            "hermes_home": str(self.hermes_home),
            "memory_file_exists": (self.hermes_home / "memories" / "MEMORY.md").exists(),
            "user_file_exists": (self.hermes_home / "memories" / "USER.md").exists(),
        }

    def _find_hermes(self) -> str | None:
        for path in ["hermes", str(self.hermes_home / "bin" / "hermes"), "/usr/local/bin/hermes"]:
            try:
                subprocess.run([path, "--version"], capture_output=True, check=True, timeout=5)
                return path
            except Exception:
                continue
        return None

    def sync_project_to_hermes(self, project_id: uuid.UUID) -> bool:
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return False

        context_dir = Path(".hermes/context")
        context_dir.mkdir(parents=True, exist_ok=True)

        agents_md = context_dir / f"project-{project.id}-AGENTS.md"
        agents_md.write_text(
            f"# Project: {project.name}\n\n"
            f"{project.description or ''}\n\n"
            f"Tech stack: {', '.join(project.tech_stack or [])}\n"
            f"GitHub: {project.github_repo or 'N/A'}\n"
        )

        memory_dir = self.hermes_home / "memories"
        memory_dir.mkdir(parents=True, exist_ok=True)
        memory_file = memory_dir / "MEMORY.md"

        entry = f"DKOS Project [{project.name}]: {project.description or 'No description'} | stack: {', '.join(project.tech_stack or [])}"
        existing = memory_file.read_text() if memory_file.exists() else ""
        if project.name not in existing:
            memory_file.write_text(existing + ("\n" if existing else "") + entry)

        memories = self.db.query(Memory).filter(Memory.project_id == project_id, Memory.hermes_synced == False).all()
        for mem in memories:
            mem.hermes_synced = True
        self.db.commit()
        return True

    def search_sessions(self, query: str) -> list[dict]:
        hermes_bin = self._find_hermes()
        if not hermes_bin:
            return []
        try:
            result = subprocess.run(
                [hermes_bin, "sessions", "list", "--json"],
                capture_output=True,
                text=True,
                timeout=10,
            )
            if result.returncode == 0 and result.stdout:
                sessions = json.loads(result.stdout)
                return [s for s in sessions if query.lower() in json.dumps(s).lower()][:10]
        except Exception:
            pass
        return []
