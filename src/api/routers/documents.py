from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Document
from ..schemas import DocumentResponse
from ..services.document_service import DocumentService

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])


@router.get("", response_model=list[DocumentResponse])
def list_documents(project_id: UUID | None = None, db: Session = Depends(get_db)):
    q = db.query(Document).order_by(Document.created_at.desc())
    if project_id:
        q = q.filter(Document.project_id == project_id)
    return q.all()


@router.post("/upload", response_model=DocumentResponse, status_code=201)
async def upload_document(
    project_id: UUID = Form(...),
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    content = await file.read()
    svc = DocumentService(db)
    return await svc.upload_document(project_id, title, file.filename or "upload", content)


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: UUID, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(404, "Document not found")
    return doc
