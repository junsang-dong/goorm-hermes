from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "active"
    tech_stack: List[str] = Field(default_factory=list)
    github_repo: Optional[str] = None
    deploy_url: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    github_repo: Optional[str] = None
    deploy_url: Optional[str] = None


class ProjectResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    status: str
    tech_stack: Optional[List[str]]
    github_repo: Optional[str]
    deploy_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RepositoryResponse(BaseModel):
    id: UUID
    project_id: UUID
    owner: str
    repo_name: str
    default_branch: str
    summary: Optional[str]
    tech_detected: Optional[List[str]]
    last_synced_at: Optional[datetime]

    model_config = {"from_attributes": True}


class SnapshotResponse(BaseModel):
    id: UUID
    repository_id: UUID
    snapshot_type: str
    raw_data: Optional[dict]
    analyzed_at: datetime

    model_config = {"from_attributes": True}


class DocumentResponse(BaseModel):
    id: UUID
    project_id: UUID
    title: str
    doc_type: str
    file_path: Optional[str]
    version: int
    tags: Optional[List[str]]
    summary: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class MemoryCreate(BaseModel):
    project_id: Optional[UUID] = None
    memory_type: str
    content: str
    source: Optional[str] = None


class MemoryResponse(BaseModel):
    id: UUID
    project_id: Optional[UUID]
    memory_type: str
    content: str
    source: Optional[str]
    hermes_synced: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class SkillCreate(BaseModel):
    project_id: Optional[UUID] = None
    name: str
    description: Optional[str] = None
    skill_md: Optional[str] = None
    source_pattern: Optional[str] = None


class SkillResponse(BaseModel):
    id: UUID
    project_id: Optional[UUID]
    name: str
    description: Optional[str]
    skill_md: Optional[str]
    source_pattern: Optional[str]
    usage_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class KnowledgeNodeResponse(BaseModel):
    id: UUID
    project_id: Optional[UUID]
    node_type: str
    label: str
    metadata: Optional[Dict] = Field(alias="metadata_")

    model_config = {"from_attributes": True, "populate_by_name": True}


class KnowledgeEdgeResponse(BaseModel):
    id: UUID
    source_id: UUID
    target_id: UUID
    relation_type: str

    model_config = {"from_attributes": True}


class ReflectionResponse(BaseModel):
    id: UUID
    project_id: UUID
    session_id: Optional[str]
    content: Optional[dict]
    created_at: datetime

    model_config = {"from_attributes": True}


class SearchResult(BaseModel):
    id: str
    type: str
    title: str
    snippet: str
    score: float
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SearchResponse(BaseModel):
    query: str
    mode: str
    results: List[SearchResult]
    answer: Optional[str] = None
