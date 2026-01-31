#!/usr/bin/env python3
"""
Switcher BLE API Server
라즈베리파이에서 실행하여 HTTP API로 BLE 스위치를 제어합니다.

사용법:
    python3 server.py
    python3 server.py --host 0.0.0.0 --port 8080

API:
    POST /switch/on
    POST /switch/off
    POST /switch/toggle
    GET  /health
    POST /ble/connect
    POST /ble/disconnect
"""

import argparse
import asyncio
import logging
import os
import secrets
from contextlib import asynccontextmanager

import uvicorn
from bleak import BleakClient
from config import (
    CHAR_CONTROL,
    CMD_OFF,
    CMD_ON,
    CMD_TOGGLE,
    CONNECTION_TIMEOUT,
    DEVICE_ADDRESS,
)
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger(__name__)

API_KEY = os.environ.get("SWITCHER_API_KEY") or secrets.token_urlsafe(32)

_client: BleakClient | None = None
_lock = asyncio.Lock()


async def verify_api_key(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer ") or auth[7:] != API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")


async def ensure_connected() -> BleakClient:
    global _client
    if _client and _client.is_connected:
        return _client
    logger.info("BLE 연결 중...")
    _client = BleakClient(DEVICE_ADDRESS, timeout=CONNECTION_TIMEOUT)
    await _client.connect()
    logger.info("BLE 연결 완료")
    return _client


async def send_command(cmd_hex: str) -> dict:
    async with _lock:
        try:
            client = await ensure_connected()
            await client.write_gatt_char(
                CHAR_CONTROL, bytes.fromhex(cmd_hex), response=False
            )
            return {"status": "ok"}
        except Exception as e:
            global _client
            _client = None
            raise HTTPException(status_code=503, detail=str(e))


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.warning("API Key: %s", API_KEY)
    # 시작 시 BLE 연결
    try:
        await ensure_connected()
    except Exception as e:
        logger.warning("초기 BLE 연결 실패: %s (요청 시 재시도)", e)
    yield
    # 종료 시 연결 해제
    if _client and _client.is_connected:
        await _client.disconnect()


app = FastAPI(
    title="Switcher BLE API", lifespan=lifespan, dependencies=[Depends(verify_api_key)]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    connected = bool(_client is not None and _client.is_connected)
    return {"status": "ok", "ble_connected": connected}


@app.post("/switch/on")
async def switch_on():
    return await send_command(CMD_ON)


@app.post("/switch/off")
async def switch_off():
    return await send_command(CMD_OFF)


@app.post("/switch/toggle")
async def switch_toggle():
    return await send_command(CMD_TOGGLE)


@app.post("/ble/connect")
async def ble_connect():
    async with _lock:
        try:
            await ensure_connected()
            return {"status": "ok", "ble_connected": True}
        except Exception as e:
            raise HTTPException(status_code=503, detail=str(e))


@app.post("/ble/disconnect")
async def ble_disconnect():
    global _client
    async with _lock:
        if _client and _client.is_connected:
            await _client.disconnect()
        _client = None
        return {"status": "ok", "ble_connected": False}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8080)
    args = parser.parse_args()
    uvicorn.run(app, host=args.host, port=args.port)
