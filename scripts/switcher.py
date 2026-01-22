#!/usr/bin/env python3
"""
Switcher BLE Controller
"""

import asyncio
import sys
from bleak import BleakClient

DEVICE_ADDRESS = "5569D6C3-205E-AADF-96EC-DB634970F8C3"
CHAR_CONTROL = "000015ba-0000-1000-8000-00805f9b34fb"

CMD_RIGHT = "00"
CMD_LEFT = "01"
CMD_TOGGLE = "04"

async def send_command(cmd_hex, description):
    print("연결 중...")
    try:
        async with BleakClient(DEVICE_ADDRESS, timeout=15.0) as client:
            print("연결 성공")
            await client.write_gatt_char(CHAR_CONTROL, bytes.fromhex(cmd_hex), response=False)
            await asyncio.sleep(1)  # 명령 처리 대기
            print("%s 완료" % description)
    except Exception as e:
        print("오류: %s" % e)

async def main():
    if len(sys.argv) < 2:
        print("사용법: python3 switcher.py [on|off|toggle]")
        return
    
    cmd = sys.argv[1].lower()
    
    if cmd == "on" or cmd == "left":
        await send_command(CMD_LEFT, "ON")
    elif cmd == "off" or cmd == "right":
        await send_command(CMD_RIGHT, "OFF")
    elif cmd == "toggle":
        await send_command(CMD_TOGGLE, "토글")
    else:
        print("사용: on, off, toggle")

if __name__ == "__main__":
    asyncio.run(main())
