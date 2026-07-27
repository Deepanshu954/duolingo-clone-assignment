"""Leaderboard endpoint tests."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_leaderboard_returns_sorted(client: AsyncClient):
    resp = await client.get("/api/v1/leaderboard", headers={"X-User-ID": "1"})
    assert resp.status_code == 200
    data = resp.json()
    assert "entries" in data
    assert "current_user_rank" in data
    assert len(data["entries"]) >= 1

    # Verify sorted by XP descending
    xps = [e["xp"] for e in data["entries"]]
    assert xps == sorted(xps, reverse=True)


@pytest.mark.asyncio
async def test_leaderboard_includes_current_user(client: AsyncClient):
    resp = await client.get("/api/v1/leaderboard", headers={"X-User-ID": "1"})
    data = resp.json()
    user_ids = [e["id"] for e in data["entries"]]
    assert 1 in user_ids
