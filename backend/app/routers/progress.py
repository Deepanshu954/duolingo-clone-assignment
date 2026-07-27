"""Progress routes: heart refill, coupon redemption, diamond purchases, and day simulation for testing."""

from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import (
    BuyGemsIn,
    CouponRedeemIn,
    CouponRedeemOut,
    HeartRefillOut,
    PracticeHeartOut,
    SimulateDayOut,
)

router = APIRouter(tags=["progress"])


@router.post("/progress/hearts/refill", response_model=HeartRefillOut)
async def refill_hearts(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Refill hearts to max. Costs gems or is free from practice."""
    if user.hearts >= settings.DEFAULT_HEARTS:
        return HeartRefillOut(
            hearts=user.hearts,
            gems=user.gems,
            message="Hearts already full!",
        )

    if user.gems < settings.HEART_REFILL_GEM_COST:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough gems. Need {settings.HEART_REFILL_GEM_COST}, have {user.gems}.",
        )

    user.gems -= settings.HEART_REFILL_GEM_COST
    user.hearts = settings.DEFAULT_HEARTS
    await db.flush()

    return HeartRefillOut(
        hearts=user.hearts,
        gems=user.gems,
        message="Hearts refilled!",
    )


@router.post("/progress/hearts/practice", response_model=PracticeHeartOut)
async def practice_for_heart(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mocked practice reward: restore one heart for free, up to the max."""
    if user.hearts < settings.DEFAULT_HEARTS:
        user.hearts += 1
        await db.flush()
        return PracticeHeartOut(
            hearts=user.hearts,
            gems=user.gems,
            message="Practice complete! You earned 1 heart.",
        )

    return PracticeHeartOut(
        hearts=user.hearts,
        gems=user.gems,
        message="Hearts already full. Practice started without a heart reward.",
    )


@router.post("/shop/redeem-coupon", response_model=CouponRedeemOut)
async def redeem_coupon(
    payload: CouponRedeemIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Redeem a promo code. 'scaler95' adds 1000 diamonds/gems!"""
    code_clean = payload.code.strip().lower()
    if code_clean == "scaler95":
        user.gems += 1000
        await db.flush()
        return CouponRedeemOut(
            success=True,
            message="Coupon 'scaler95' redeemed! +1000 Diamonds added to your balance.",
            gems_added=1000,
            new_gem_balance=user.gems,
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid promo code. Use code 'scaler95' for 1000 free diamonds!",
        )


@router.post("/shop/buy-gems", response_model=CouponRedeemOut)
async def buy_gems(
    payload: BuyGemsIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Simulate purchasing diamonds/gems."""
    if payload.gems <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gem purchase amount must be greater than 0.",
        )

    user.gems += payload.gems
    await db.flush()

    return CouponRedeemOut(
        success=True,
        message=f"Successfully purchased {payload.gems} Diamonds!",
        gems_added=payload.gems,
        new_gem_balance=user.gems,
    )


@router.post("/test/simulate-day-passed", response_model=SimulateDayOut)
async def simulate_day_passed(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Testing endpoint: simulate a day passing without earning XP (breaks streak)."""
    today = date.today()

    if user.streak_last_date is not None:
        user.streak_last_date = today - timedelta(days=2)
        user.streak_days = 0
    else:
        user.streak_days = 0

    await db.flush()

    return SimulateDayOut(
        streak_days=user.streak_days,
        streak_last_date=user.streak_last_date,
        message="Simulated day passed. Streak reset.",
    )
