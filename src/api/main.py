from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .routers import (
    documents,
    hermes,
    knowledge,
    memory,
    projects,
    reflection,
    repositories,
    search,
    skills,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="DKOS API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(repositories.router)
app.include_router(documents.router)
app.include_router(memory.router)
app.include_router(skills.router)
app.include_router(knowledge.router)
app.include_router(search.router)
app.include_router(reflection.router)
app.include_router(hermes.router)


@app.get("/health")
def health():
    return {"status": "ok"}
