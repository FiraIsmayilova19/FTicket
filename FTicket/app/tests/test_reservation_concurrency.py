import pytest, asyncio
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_concurrent_reserve():

    async with AsyncClient(app=app, base_url="http://test") as ac:

        token1 = "token_for_user1"
        token2 = "token_for_user2"

        async def reserve(token):
            return await ac.post("/api/events/1/reserve", json={"seats":[10]}, headers={"Authorization": f"Bearer {token}"})

        t1 = asyncio.create_task(reserve(token1))
        t2 = asyncio.create_task(reserve(token2))
        r1, r2 = await asyncio.gather(t1, t2)
        statuses = {r1.status_code, r2.status_code}
        assert 200 in statuses
        assert 409 in statuses or 400 in statuses
