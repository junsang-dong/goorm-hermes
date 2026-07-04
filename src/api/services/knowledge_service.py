from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from ..models import Document, KnowledgeEdge, KnowledgeNode, Project, Repository, Reflection, Skill


class KnowledgeService:
    def __init__(self, db: Session):
        self.db = db

    def _get_or_create_node(
        self, project_id: uuid.UUID | None, node_type: str, label: str, metadata: dict | None = None
    ) -> KnowledgeNode:
        existing = (
            self.db.query(KnowledgeNode)
            .filter(
                KnowledgeNode.project_id == project_id,
                KnowledgeNode.node_type == node_type,
                KnowledgeNode.label == label,
            )
            .first()
        )
        if existing:
            return existing
        node = KnowledgeNode(
            project_id=project_id,
            node_type=node_type,
            label=label,
            metadata_=metadata or {},
        )
        self.db.add(node)
        self.db.flush()
        return node

    def _add_edge(self, source_id: uuid.UUID, target_id: uuid.UUID, relation_type: str) -> None:
        existing = (
            self.db.query(KnowledgeEdge)
            .filter(
                KnowledgeEdge.source_id == source_id,
                KnowledgeEdge.target_id == target_id,
                KnowledgeEdge.relation_type == relation_type,
            )
            .first()
        )
        if not existing:
            self.db.add(KnowledgeEdge(source_id=source_id, target_id=target_id, relation_type=relation_type))

    def sync_from_repository(self, repo: Repository, analysis: dict) -> None:
        project_node = self._get_or_create_node(repo.project_id, "project", f"project:{repo.project_id}")
        for tech in analysis.get("tech_stack", []):
            tech_node = self._get_or_create_node(repo.project_id, "technology", tech)
            self._add_edge(project_node.id, tech_node.id, "uses")
        self.db.commit()

    def sync_from_document(self, doc: Document) -> None:
        project_node = self._get_or_create_node(doc.project_id, "project", f"project:{doc.project_id}")
        doc_node = self._get_or_create_node(
            doc.project_id, "document", doc.title, {"doc_type": doc.doc_type, "version": doc.version}
        )
        self._add_edge(project_node.id, doc_node.id, "has")
        self.db.commit()

    def sync_from_skill(self, skill: Skill) -> None:
        if not skill.project_id:
            return
        project_node = self._get_or_create_node(skill.project_id, "project", f"project:{skill.project_id}")
        skill_node = self._get_or_create_node(skill.project_id, "skill", skill.name)
        self._add_edge(project_node.id, skill_node.id, "produced")
        self.db.commit()

    def sync_from_reflection(self, reflection: Reflection) -> None:
        project_node = self._get_or_create_node(reflection.project_id, "project", f"project:{reflection.project_id}")
        label = f"reflection:{reflection.id}"
        exp_node = self._get_or_create_node(reflection.project_id, "experience", label)
        self._add_edge(project_node.id, exp_node.id, "learned")
        self.db.commit()

    def get_graph(self, project_id: uuid.UUID | None = None) -> dict:
        query = self.db.query(KnowledgeNode)
        if project_id:
            query = query.filter(KnowledgeNode.project_id == project_id)
        nodes = query.all()
        node_ids = {n.id for n in nodes}
        edges = self.db.query(KnowledgeEdge).filter(
            KnowledgeEdge.source_id.in_(node_ids), KnowledgeEdge.target_id.in_(node_ids)
        ).all() if node_ids else []
        return {
            "nodes": [
                {"id": str(n.id), "type": n.node_type, "label": n.label, "project_id": str(n.project_id) if n.project_id else None}
                for n in nodes
            ],
            "edges": [
                {"id": str(e.id), "source": str(e.source_id), "target": str(e.target_id), "relation": e.relation_type}
                for e in edges
            ],
        }
