from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Memory
from ..schemas import MemoryCreate, MemoryResponse
from ..services.hermes_service import HermesService
from ..services.memory_service import MemoryService

router = APIRouter(prefix="/api/v1/memory", tags=["memory"])


@router.get("", response_model=list[MemoryResponse])
def list_memories(
    memory_type: str | None = None,
    project_id: UUID | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(Memory).order_by(Memory.created_at.desc())
    if memory_type:
        q = q.filter(Memory.memory_type == memory_type)
    if project_id:
        q = q.filter(Memory.project_id == project_id)
    return q.all()


@router.post("", response_model=MemoryResponse, status_code=201)
async def create_memory(data: MemoryCreate, db: Session = Depends(get_db)):
    svc = MemoryService(db)
    return await svc.create_memory(data.memory_type, data.content, data.project_id, data.source)


@router.post("/sync-hermes/{project_id}")
def sync_hermes(project_id: UUID, db: Session = Depends(get_db)):
    svc = HermesService(db)
    ok = svc.sync_project_to_hermes(project_id)
    return {"synced": ok}
