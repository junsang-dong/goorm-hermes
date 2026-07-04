from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Project
from ..schemas import GitHubPreviewRequest, GitHubProjectPreview, ProjectCreate, ProjectResponse, ProjectUpdate
from ..services.github_service import GitHubService
from ..services.repository_service import RepositoryService

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])


@router.get("", response_model=list[ProjectResponse])
def list_projects(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Project).order_by(Project.updated_at.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(data: ProjectCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    project = Project(**data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)

    if project.github_repo:
        repo_svc = RepositoryService(db)
        repo = repo_svc.create_from_project(project)
        if repo:
            background_tasks.add_task(_sync_repo, str(repo.id))

    return project


@router.post("/preview-github", response_model=GitHubProjectPreview)
async def preview_from_github(data: GitHubPreviewRequest):
    svc = GitHubService()
    try:
        return await svc.preview_project(data.github_url)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(502, f"GitHub 정보를 가져오지 못했습니다: {e}")


async def _sync_repo(repo_id: str):
    from uuid import UUID
    from ..database import SessionLocal

    db = SessionLocal()
    try:
        svc = RepositoryService(db)
        await svc.sync_repository(UUID(repo_id))
    finally:
        db.close()


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: UUID, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(404, "Project not found")
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: UUID, data: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(404, "Project not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(project, key, value)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: UUID, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(404, "Project not found")
    db.delete(project)
    db.commit()
