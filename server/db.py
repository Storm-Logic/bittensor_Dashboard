from motor.motor_asyncio import AsyncIOMotorClient

from config import settings


client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    assert client is not None, "Mongo client not initialized"
    return client


async def connect_db() -> None:
    global client
    client = AsyncIOMotorClient(settings.mongodb_uri)
    await client.admin.command("ping")
    db = client[settings.mongodb_db]
    collections = await db.list_collection_names()
    if "sub_uid" not in collections:
        await db.create_collection("sub_uid")
    print("success")


async def close_client() -> None:
    global client
    if client is not None:
        client.close()
        client = None


def get_subnet_uid():
    c = get_client()
    db = c[settings.mongodb_db]
    return db["sub_uid"]
