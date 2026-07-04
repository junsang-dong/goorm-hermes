from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Reflection
from ..schemas import ReflectionResponse
from ..services.memory_service import ReflectionService

router = APIRouter(prefix="/api/v1/reflection", tags=["reflection"])


@router.get("", response_model=list[ReflectionResponse])
def list_reflections(project_id: UUID | None = None, db: Session = Depends(get_db)):
    q = db.query(Reflection).order_by(Reflection.created_at.desc())
    if project_id:
        q = q.filter(Reflection.project_id == project_id)
    return q.all()


@router.post("/run/{project_id}", response_model=ReflectionResponse)
async def run_reflection(project_id: UUID, db: Session = Depends(get_db)):
    svc = ReflectionService(db)
    try:
        return await svc.run_reflection(project_id)
    except ValueError as e:
        raise HTTPException(404, str(e))
