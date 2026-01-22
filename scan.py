#!/usr/bin/env python3
"""
BLE 기기 스캔 및 서비스/특성 탐색
"""

import asyncio
from bleak import BleakScanner, BleakClient

async def scan_devices(timeout=10):
    """주변 BLE 기기 스캔"""
    print(f"BLE 기기 스캔 중 ({timeout}초)...\n")
    devices = await BleakScanner.discover(timeout=timeout)
    
    for d in devices:
        name = d.name or "(이름없음)"
        print(f"  {name}: {d.address}")
    
    print(f"\n총 {len(devices)}개 발견")
    return devices

async def explore_device(address):
    """기기의 서비스/특성 탐색"""
    print(f"\n연결 중: {address}")
    
    async with BleakClient(address, timeout=15.0) as client:
        print("연결 성공!\n")
        print("=" * 60)
        
        for service in client.services:
            print(f"\n서비스: {service.uuid}")
            
            for char in service.characteristics:
                props = ", ".join(char.properties)
                print(f"  특성: {char.uuid}")
                print(f"        속성: {props}")
                
                if "read" in char.properties:
                    try:
                        value = await client.read_gatt_char(char.uuid)
                        print(f"        값: {value.hex()}")
                    except:
                        pass

async def main():
    print("1. 기기 스캔")
    print("2. 특정 기기 탐색")
    
    choice = input("\n선택: ").strip()
    
    if choice == "1":
        await scan_devices()
    elif choice == "2":
        address = input("기기 주소: ").strip()
        await explore_device(address)

if __name__ == "__main__":
    asyncio.run(main())
