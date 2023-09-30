from contextlib import asynccontextmanager
from typing import Any

from fastapi import Body, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import bittensor as bt
import requests

from db import close_client, connect_db, get_subnet_uid


subtensor = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_client()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def to_float(value):
    try:
        return float(value)
    except Exception:
        try:
            return float(value.tao)
        except Exception:
            return float(value.rao) / 1_000_000_000


def get_subtensor():
    global subtensor
    if subtensor is None:
        subtensor = bt.Subtensor(network="finney")
    return subtensor


@app.get("/")
def root():
    return {"message": "backend running"}


def serialize_row(row: dict[str, Any]) -> dict[str, Any]:
    row.pop("_id", None)
    return row


@app.get("/add")
async def get_added_rows():
    rows = get_subnet_uid()
    return [serialize_row(row) for row in await rows.find({}).to_list(length=100)]


@app.post("/add")
async def add(payload: dict = Body(...)):
    rows = get_subnet_uid()
    data = payload.get("data", payload)
    if not isinstance(data, dict):
        raise HTTPException(status_code=400, detail="Request body must be an object")
    await rows.insert_one(data)
    return [serialize_row(row) for row in await rows.find({}).to_list(length=100)]


@app.get("/subnet/{netuid}")
async def subnet(netuid: int):
    try:
        chain = get_subtensor()
        meta = chain.metagraph(netuid)
        subnet_info = chain.all_subnets()[netuid]
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Unable to load subnet {netuid}: {exc}",
        ) from exc

    url = "https://api.coingecko.com/api/v3/simple/price?ids=bittensor&vs_currencies=usd"
    try:
        data = requests.get(url, timeout=10).json()
        tao_price = data["bittensor"]["usd"]
    except Exception:
        tao_price = None

    neurons = []
    num_val = 0
    incentive_burn = 0

    for i in range(len(meta.uids)):
        if meta.coldkeys[i] == subnet_info.owner_coldkey:
            incentive_burn += float(meta.I[i])

        neurons.append({
            "uid": int(meta.uids[i]),
            "hotkey": meta.hotkeys[i],
            "stake": float(meta.S[i]),
            "consensus": float(meta.C[i]),
            "incentive": float(meta.I[i]),
            "emission": float(meta.E[i]),
            "validator_trust": float(meta.Tv[i]),
            "validator": bool(meta.validator_permit[i]),
        })

        if meta.validator_permit[i]:
            num_val += 1

    return {
        "netuid": netuid,
        "tao_price": tao_price,
        "total_neurons": len(neurons),
        "tao_in": to_float(subnet_info.tao_in),
        "alpha_in": to_float(subnet_info.alpha_in),
        "price": to_float(subnet_info.price),
        "emission": to_float(subnet_info.tao_in_emission) * 100 / 0.5,
        "Incentive_burn": incentive_burn,
        "neurons": neurons,
        "num_val": num_val,
    }
