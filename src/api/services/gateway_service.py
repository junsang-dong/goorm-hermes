from __future__ import annotations

import httpx

from ..config import settings


class GatewayService:
    def __init__(self):
        self.base_url = settings.gateway_url.rstrip("/")

    async def generate(
        self,
        provider: str,
        model: str,
        prompt: str,
        system_prompt: str | None = None,
        max_tokens: int | None = None,
    ) -> dict:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                f"{self.base_url}/v1/generate",
                json={
                    "provider": provider,
                    "model": model,
                    "prompt": prompt,
                    "systemPrompt": system_prompt,
                    "maxTokens": max_tokens,
                },
            )
            resp.raise_for_status()
            return resp.json()

    async def embed(self, text: str) -> list[float]:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{self.base_url}/v1/embeddings",
                json={"text": text},
            )
            resp.raise_for_status()
            return resp.json()["embedding"]
