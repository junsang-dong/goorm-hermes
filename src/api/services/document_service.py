from __future__ import annotations

import os
import re
import uuid
from pathlib import Path

import fitz
from sqlalchemy.orm import Session

from ..config import settings
from ..models import Document, DocumentEmbedding
from .gateway_service import GatewayService
from .knowledge_service import KnowledgeService


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i : i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks if chunks else [text] if text else []


class DocumentService:
    def __init__(self, db: Session):
        self.db = db
        self.gateway = GatewayService()
        self.knowledge = KnowledgeService(db)
        Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)

    async def upload_document(
        self, project_id: uuid.UUID, title: str, filename: str, content: bytes
    ) -> Document:
        ext = Path(filename).suffix.lower()
        doc_type = "markdown" if ext in (".md", ".markdown") else "pdf" if ext == ".pdf" else "other"

        save_path = Path(settings.upload_dir) / f"{project_id}_{filename}"
        save_path.write_bytes(content)

        if doc_type == "pdf":
            text = self._extract_pdf(content)
        else:
            text = content.decode("utf-8", errors="replace")

        existing = (
            self.db.query(Document)
            .filter(Document.project_id == project_id, Document.title == title)
            .order_by(Document.version.desc())
            .first()
        )
        version = (existing.version + 1) if existing else 1

        summary_prompt = f"Summarize this document in 2-3 Korean sentences and suggest 3-5 tags as JSON {{summary, tags}}:\n\n{text[:3000]}"
        try:
            result = await self.gateway.generate(
                provider="claude",
                model="claude-sonnet-4-6",
                prompt=summary_prompt,
                system_prompt="Return only valid JSON.",
            )
            import json
            match = re.search(r"\{[\s\S]*\}", result.get("text", "{}"))
            meta = json.loads(match.group() if match else "{}")
            summary = meta.get("summary", "")
            tags = meta.get("tags", [])
        except Exception:
            summary = text[:200]
            tags = []

        doc = Document(
            project_id=project_id,
            title=title,
            doc_type=doc_type,
            file_path=str(save_path),
            version=version,
            tags=tags,
            summary=summary,
            content=text,
        )
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)

        await self._index_document(doc)
        self.knowledge.sync_from_document(doc)
        return doc

    def _extract_pdf(self, content: bytes) -> str:
        doc = fitz.open(stream=content, filetype="pdf")
        return "\n".join(page.get_text() for page in doc)

    async def _index_document(self, doc: Document) -> None:
        if not doc.content:
            return
        chunks = chunk_text(doc.content)
        for i, chunk in enumerate(chunks):
            try:
                embedding = await self.gateway.embed(chunk)
            except Exception:
                embedding = None
            self.db.add(
                DocumentEmbedding(
                    document_id=doc.id,
                    chunk_index=i,
                    content=chunk,
                    embedding=embedding,
                )
            )
        self.db.commit()
