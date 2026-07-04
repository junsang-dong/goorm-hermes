from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Skill
from ..schemas import SkillCreate, SkillResponse
from ..services.knowledge_service import KnowledgeService

router = APIRouter(prefix="/api/v1/skills", tags=["skills"])


@router.get("", response_model=list[SkillResponse])
def list_skills(project_id: UUID | None = None, db: Session = Depends(get_db)):
    q = db.query(Skill).order_by(Skill.usage_count.desc())
    if project_id:
        q = q.filter(Skill.project_id == project_id)
    return q.all()


@router.post("", response_model=SkillResponse, status_code=201)
def create_skill(data: SkillCreate, db: Session = Depends(get_db)):
    skill_md = data.skill_md or f"# {data.name}\n\n{data.description or ''}\n"
    skill = Skill(**{**data.model_dump(), "skill_md": skill_md})
    db.add(skill)
    db.commit()
    db.refresh(skill)
    KnowledgeService(db).sync_from_skill(skill)
    return skill


@router.get("/{skill_id}", response_model=SkillResponse)
def get_skill(skill_id: UUID, db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(404, "Skill not found")
    return skill
