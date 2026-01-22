#!/usr/bin/env python3
"""
BLE 브루트포스 도구
모든 Write 특성에 다양한 명령을 전송하여 동작하는 명령 찾기
"""

import asyncio
from bleak import BleakClient

async def find_write_characteristics(client):
    """Write 가능한 특성 찾기"""
    write_chars = []
    for service in client.services:
        for char in service.characteristics:
            if "write" in char.properties or "write-without-response" in char.properties:
                write_chars.append((char.uuid, service.uuid))
    return write_chars

async def brute_force(address):
    """브루트포스 실행"""
    print(f"연결 중: {address}")
    
    async with BleakClient(address, timeout=15.0) as client:
        print("연결 성공!\n")
        
        # Write 특성 찾기
        write_chars = await find_write_characteristics(client)
        print(f"Write 가능한 특성 {len(write_chars)}개 발견:\n")
        for i, (uuid, svc) in enumerate(write_chars):
            print(f"  {i+1}. {uuid[:8]}... (서비스: {svc[:8]}...)")
        
        # 특성 선택
        choice = input("\n테스트할 특성 번호 (0=전체): ").strip()
        
        if choice == "0":
            targets = write_chars
        else:
            idx = int(choice) - 1
            targets = [write_chars[idx]]
        
        # 명령 범위
        print("\n명령 범위 (1바이트: 0x00~0xFF)")
        start = int(input("시작 (기본 0): ").strip() or "0")
        end = int(input("끝 (기본 255): ").strip() or "255")
        
        print("\n브루트포스 시작!")
        print("기기가 반응하면 Ctrl+C를 누르세요.\n")
        
        last_char = ""
        last_cmd = ""
        
        try:
            for char_uuid, svc_uuid in targets:
                print(f"\n[{char_uuid[:8]}...]")
                
                for i in range(start, end + 1):
                    cmd = f"{i:02x}"
                    last_char = char_uuid
                    last_cmd = cmd
                    
                    try:
                        await client.write_gatt_char(char_uuid, bytes.fromhex(cmd), response=False)
                        await asyncio.sleep(0.1)
                        print(f"\r  {cmd}", end="", flush=True)
                    except:
                        pass
                
                print()
                
        except KeyboardInterrupt:
            print(f"\n\n중단됨!")
            print(f"마지막 특성: {last_char}")
            print(f"마지막 명령: {last_cmd}")
            
            # 해당 범위 정밀 테스트
            print(f"\n정밀 테스트 (Enter=안움직임, y=움직임, q=종료)")
            start_fine = max(0, int(last_cmd, 16) - 5)
            end_fine = min(255, int(last_cmd, 16) + 5)
            
            for i in range(start_fine, end_fine + 1):
                cmd = f"{i:02x}"
                await client.write_gatt_char(last_char, bytes.fromhex(cmd), response=False)
                await asyncio.sleep(0.5)
                result = input(f"  [{cmd}] 움직임? ").strip().lower()
                if result == "y":
                    print(f"\n*** 발견: 특성={last_char[:8]}, 명령={cmd} ***")
                elif result == "q":
                    break

async def main():
    address = input("기기 주소: ").strip()
    await brute_force(address)

if __name__ == "__main__":
    asyncio.run(main())
