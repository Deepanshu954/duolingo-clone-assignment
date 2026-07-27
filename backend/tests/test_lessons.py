"""Lesson session tests: start, submit all exercise types, XP, hearts, completion."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_start_lesson(client: AsyncClient):
    """Starting lesson 1 (unlocked skill) should succeed."""
    resp = await client.post("/api/v1/lessons/1/start", headers={"X-User-ID": "1"})
    assert resp.status_code == 200
    data = resp.json()
    assert "session_id" in data
    assert data["total_exercises"] == 8
    assert data["current_index"] == 0
    assert data["exercise"]["type"] in [
        "multiple_choice", "word_bank", "match_pairs", "fill_blank", "type_answer"
    ]


@pytest.mark.asyncio
async def test_start_locked_lesson(client: AsyncClient):
    """Starting a lesson from a locked skill should fail."""
    # Lesson 4 belongs to skill 2 which is locked for user 1
    resp = await client.post("/api/v1/lessons/4/start", headers={"X-User-ID": "1"})
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_submit_correct_multiple_choice(client: AsyncClient):
    """Correct MC answer should award XP."""
    start = await client.post("/api/v1/lessons/1/start", headers={"X-User-ID": "1"})
    session_id = start.json()["session_id"]

    # Exercise 1 in Lesson 1: 'Which one of these is "hello"?' -> "Hola"
    resp = await client.post(
        f"/api/v1/lessons/sessions/{session_id}/submit",
        json={"answer": "Hola"},
        headers={"X-User-ID": "1"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_correct"] is True
    assert data["xp_earned"] >= 10


@pytest.mark.asyncio
async def test_submit_wrong_answer_loses_heart(client: AsyncClient):
    """Wrong answer should lose a heart."""
    me = await client.get("/api/v1/user/me", headers={"X-User-ID": "1"})
    initial_hearts = me.json()["hearts"]

    start = await client.post("/api/v1/lessons/1/start", headers={"X-User-ID": "1"})
    session_id = start.json()["session_id"]

    resp = await client.post(
        f"/api/v1/lessons/sessions/{session_id}/submit",
        json={"answer": "Wrong answer"},
        headers={"X-User-ID": "1"},
    )
    data = resp.json()
    assert data["is_correct"] is False
    assert data["hearts"] <= initial_hearts


@pytest.mark.asyncio
async def test_complete_lesson_flow(client: AsyncClient):
    """Complete all exercises in a lesson and verify completion."""
    start = await client.post("/api/v1/lessons/1/start", headers={"X-User-ID": "1"})
    session_id = start.json()["session_id"]

    # Lesson 1 exercises (8 items)
    answers = [
        "Hola",          # 1. MC
        "Buenos días",   # 2. MC
        "Hello",         # 3. word_bank
        "Buenos días",   # 4. word_bank
        "Hola",          # 5. fill_blank
        {"Hola": "Hello", "Buenos días": "Good morning", "Gracias": "Thank you"},  # 6. match_pairs
        "Hola",          # 7. type_answer
        "Hello, Good morning", # 8. word_bank
    ]

    for i, answer in enumerate(answers):
        resp = await client.post(
            f"/api/v1/lessons/sessions/{session_id}/submit",
            json={"answer": answer},
            headers={"X-User-ID": "1"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["is_correct"] is True

        if i == len(answers) - 1:
            assert data["completed"] is True
            assert data["xp_earned"] > 0
        else:
            assert data["completed"] is False


@pytest.mark.asyncio
async def test_replaying_completed_lesson_does_not_overcount_skill_progress(client: AsyncClient):
    """Completing the same lesson twice should not increment crowns/progress twice."""

    async def complete_lesson_one() -> None:
        start = await client.post("/api/v1/lessons/1/start", headers={"X-User-ID": "1"})
        session_id = start.json()["session_id"]
        answers = [
            "Hola",
            "Buenos días",
            "Hello",
            "Buenos días",
            "Hola",
            {"Hola": "Hello", "Buenos días": "Good morning", "Gracias": "Thank you"},
            "Hola",
            "Hello, Good morning",
        ]
        for answer in answers:
            resp = await client.post(
                f"/api/v1/lessons/sessions/{session_id}/submit",
                json={"answer": answer},
                headers={"X-User-ID": "1"},
            )
            assert resp.status_code == 200

    await complete_lesson_one()
    path_after_first = await client.get("/api/v1/path", headers={"X-User-ID": "1"})
    first_skill = path_after_first.json()["units"][0]["skills"][0]
    assert first_skill["completed_lessons"] == 1

    await complete_lesson_one()
    path_after_second = await client.get("/api/v1/path", headers={"X-User-ID": "1"})
    first_skill_again = path_after_second.json()["units"][0]["skills"][0]
    assert first_skill_again["completed_lessons"] == 1


@pytest.mark.asyncio
async def test_get_session_status(client: AsyncClient):
    """Get session status after starting."""
    start = await client.post("/api/v1/lessons/1/start", headers={"X-User-ID": "1"})
    session_id = start.json()["session_id"]

    resp = await client.get(
        f"/api/v1/lessons/sessions/{session_id}",
        headers={"X-User-ID": "1"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["session_id"] == session_id
    assert data["completed"] is False
    assert data["exercise"] is not None


@pytest.mark.asyncio
async def test_submit_word_bank(client: AsyncClient):
    """Word bank answer validation."""
    start = await client.post("/api/v1/lessons/1/start", headers={"X-User-ID": "1"})
    session_id = start.json()["session_id"]

    # Exercise 1 (MC: Hola) and Exercise 2 (MC: Buenos días)
    await client.post(
        f"/api/v1/lessons/sessions/{session_id}/submit",
        json={"answer": "Hola"},
        headers={"X-User-ID": "1"},
    )
    await client.post(
        f"/api/v1/lessons/sessions/{session_id}/submit",
        json={"answer": "Buenos días"},
        headers={"X-User-ID": "1"},
    )

    # Exercise 3: word_bank — "Hello"
    resp = await client.post(
        f"/api/v1/lessons/sessions/{session_id}/submit",
        json={"answer": "Hello"},
        headers={"X-User-ID": "1"},
    )
    data = resp.json()
    assert data["is_correct"] is True
