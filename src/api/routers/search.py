from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import SearchResponse, SearchResult
from ..services.search_service import SearchService

router = APIRouter(prefix="/api/v1/search", tags=["search"])


@router.get("", response_model=SearchResponse)
async def search(
    q: str = Query(..., min_length=1),
    mode: str = Query("hybrid", pattern="^(keyword|semantic|hybrid|rag)$"),
    db: Session = Depends(get_db),
):
    svc = SearchService(db)
    answer = None

    if mode == "keyword":
        results = svc.keyword_search(q)
    elif mode == "semantic":
        results = await svc.semantic_search(q)
    elif mode == "rag":
        results, answer = await svc.rag_search(q)
    else:
        results = await svc.hybrid_search(q)

    return SearchResponse(
        query=q,
        mode=mode,
        results=[SearchResult(**r) for r in results],
        answer=answer,
    )
