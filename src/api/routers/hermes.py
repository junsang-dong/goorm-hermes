from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.hermes_service import HermesService

router = APIRouter(prefix="/api/v1/hermes", tags=["hermes"])


@router.get("/status")
def hermes_status(db: Session = Depends(get_db)):
    return HermesService(db).status()


@router.post("/sync/{project_id}")
def sync_project(project_id: UUID, db: Session = Depends(get_db)):
    ok = HermesService(db).sync_project_to_hermes(project_id)
    return {"synced": ok}


@router.get("/sessions")
def search_sessions(q: str = Query(""), db: Session = Depends(get_db)):
    return HermesService(db).search_sessions(q)
