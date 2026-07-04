"""Phase 3 stub: watch docs/spec.md for version changes."""

from pathlib import Path


def watch_spec(spec_path: str = "docs/spec.md") -> dict:
    path = Path(spec_path)
    if not path.exists():
        return {"exists": False, "versions": []}
    return {"exists": True, "content_hash": hash(path.read_text()), "path": str(path)}
