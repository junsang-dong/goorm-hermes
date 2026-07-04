from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Repository, RepositorySnapshot
from ..schemas import RepositoryResponse, SnapshotResponse
from ..services.repository_service import RepositoryService

router = APIRouter(prefix="/api/v1/repositories", tags=["repositories"])


@router.get("", response_model=list[RepositoryResponse])
def list_repositories(project_id: UUID | None = None, db: Session = Depends(get_db)):
    q = db.query(Repository)
    if project_id:
        q = q.filter(Repository.project_id == project_id)
    return q.all()


@router.post("/{repository_id}/sync", response_model=RepositoryResponse)
async def sync_repository(repository_id: UUID, db: Session = Depends(get_db)):
    svc = RepositoryService(db)
    try:
        return await svc.sync_repository(repository_id)
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.get("/{repository_id}/snapshots", response_model=list[SnapshotResponse])
def list_snapshots(repository_id: UUID, db: Session = Depends(get_db)):
    return (
        db.query(RepositorySnapshot)
        .filter(RepositorySnapshot.repository_id == repository_id)
        .order_by(RepositorySnapshot.analyzed_at.desc())
        .all()
    )
