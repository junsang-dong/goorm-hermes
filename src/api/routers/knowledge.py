from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.knowledge_service import KnowledgeService

router = APIRouter(prefix="/api/v1/knowledge", tags=["knowledge"])


@router.get("/graph")
def get_graph(project_id: UUID | None = None, db: Session = Depends(get_db)):
    return KnowledgeService(db).get_graph(project_id)
