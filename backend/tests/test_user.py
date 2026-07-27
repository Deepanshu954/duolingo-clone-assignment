"""User and profile endpoint tests."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient):
    resp = await client.get("/api/v1/user/me", headers={"X-User-ID": "1"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == 1
    assert data["username"] == "learner"
    assert data["hearts"] <= 5
    assert "xp" in data
    assert "gems" in data


@pytest.mark.asyncio
async def test_get_profile(client: AsyncClient):
    resp = await client.get("/api/v1/profile", headers={"X-User-ID": "1"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == 1
    assert data["current_course"] == "Spanish"
    assert "total_lessons_completed" in data
    assert "streak_days" in data
