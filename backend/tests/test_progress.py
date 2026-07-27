"""Progress, hearts, shop coupons, and diamond purchase tests."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_heart_refill(client: AsyncClient):
    """Refill hearts should cost gems and restore hearts to max."""
    resp = await client.post("/api/v1/progress/hearts/refill", headers={"X-User-ID": "1"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["hearts"] == 5
    assert "message" in data


@pytest.mark.asyncio
async def test_redeem_coupon_scaler95(client: AsyncClient):
    """Redeeming code 'scaler95' adds 1000 diamonds/gems."""
    resp = await client.post(
        "/api/v1/shop/redeem-coupon",
        json={"code": "scaler95"},
        headers={"X-User-ID": "1"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["gems_added"] == 1000
    assert data["new_gem_balance"] >= 1000


@pytest.mark.asyncio
async def test_redeem_invalid_coupon(client: AsyncClient):
    """Redeeming an invalid coupon code returns 400 Bad Request."""
    resp = await client.post(
        "/api/v1/shop/redeem-coupon",
        json={"code": "invalid_code_123"},
        headers={"X-User-ID": "1"},
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_buy_gems(client: AsyncClient):
    """Purchasing diamonds adds gems to the user account."""
    resp = await client.post(
        "/api/v1/shop/buy-gems",
        json={"gems": 500},
        headers={"X-User-ID": "1"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["gems_added"] == 500


@pytest.mark.asyncio
async def test_simulate_day_passed(client: AsyncClient):
    """Simulating a day passed should reset streak."""
    resp = await client.post("/api/v1/test/simulate-day-passed", headers={"X-User-ID": "1"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["streak_days"] == 0
    assert "message" in data


@pytest.mark.asyncio
async def test_learning_path(client: AsyncClient):
    """Path should return course structure with progress."""
    resp = await client.get("/api/v1/path", headers={"X-User-ID": "1"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["course"] == "Spanish"
    assert data["flag_emoji"] == "🇪🇸"
    assert len(data["units"]) >= 5

    # First skill should be unlocked
    first_skill = data["units"][0]["skills"][0]
    assert first_skill["is_locked"] is False
