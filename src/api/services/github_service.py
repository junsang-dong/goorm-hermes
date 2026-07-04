from __future__ import annotations

import json
import re
from urllib.parse import urlparse

import httpx

from ..config import settings


def parse_github_url(url: str) -> tuple[str, str] | None:
    if not url:
        return None
    url = url.rstrip("/")
    match = re.match(r"(?:https?://)?(?:www\.)?github\.com/([^/]+)/([^/]+?)(?:\.git)?$", url)
    if match:
        return match.group(1), match.group(2)
    return None


class GitHubService:
    def __init__(self):
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if settings.github_token:
            self.headers["Authorization"] = f"Bearer {settings.github_token}"

    async def _get(self, path: str) -> dict | list | None:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(f"{self.base_url}{path}", headers=self.headers)
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            return resp.json()

    async def fetch_repo_data(self, owner: str, repo: str) -> dict:
        repo_info = await self._get(f"/repos/{owner}/{repo}")
        readme = await self._get(f"/repos/{owner}/{repo}/readme")
        commits = await self._get(f"/repos/{owner}/{repo}/commits?per_page=10")
        releases = await self._get(f"/repos/{owner}/{repo}/releases?per_page=5")
        issues = await self._get(f"/repos/{owner}/{repo}/issues?state=open&per_page=10")
        pulls = await self._get(f"/repos/{owner}/{repo}/pulls?state=open&per_page=10")
        tree = await self._get(f"/repos/{owner}/{repo}/git/trees/{repo_info.get('default_branch', 'main')}?recursive=1") if repo_info else None

        package_json = None
        if tree and isinstance(tree, dict):
            for item in tree.get("tree", []):
                if item.get("path") == "package.json":
                    content = await self._get(f"/repos/{owner}/{repo}/contents/package.json")
                    if content and isinstance(content, dict) and content.get("encoding") == "base64":
                        import base64
                        package_json = json.loads(base64.b64decode(content["content"]).decode())
                    break

        readme_text = ""
        if readme and isinstance(readme, dict) and readme.get("encoding") == "base64":
            import base64
            readme_text = base64.b64decode(readme["content"]).decode("utf-8", errors="replace")

        return {
            "repo_info": repo_info or {},
            "readme": readme_text,
            "package_json": package_json,
            "commits": commits or [],
            "releases": releases or [],
            "issues": issues or [],
            "pulls": pulls or [],
            "tree": tree or {},
        }

    async def preview_project(self, url: str) -> dict:
        parsed = parse_github_url(url)
        if not parsed:
            raise ValueError("유효하지 않은 GitHub URL입니다.")
        owner, repo_name = parsed
        data = await self.fetch_repo_data(owner, repo_name)
        repo_info = data.get("repo_info") or {}
        readme = data.get("readme") or ""
        pkg = data.get("package_json") or {}

        name = repo_info.get("name") or repo_name.replace("-", " ").title()
        description = (repo_info.get("description") or "").strip()

        if not description and readme:
            for line in readme.splitlines():
                cleaned = line.strip().lstrip("#").strip()
                if cleaned and not cleaned.startswith("!") and not cleaned.startswith("["):
                    description = cleaned[:500]
                    break

        tech_stack: list[str] = []
        if repo_info.get("language"):
            tech_stack.append(repo_info["language"])
        topics = repo_info.get("topics") or []
        tech_stack.extend(topics[:8])
        deps = {**(pkg.get("dependencies") or {}), **(pkg.get("devDependencies") or {})}
        tech_stack.extend(list(deps.keys())[:12])
        tech_stack = list(dict.fromkeys(tech_stack))

        return {
            "name": name,
            "description": description or f"{owner}/{repo_name} GitHub repository",
            "github_repo": f"https://github.com/{owner}/{repo_name}",
            "tech_stack": tech_stack,
            "deploy_url": repo_info.get("homepage") or None,
        }
