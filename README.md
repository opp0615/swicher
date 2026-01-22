# Switcher BLE Controller

BLE 스마트 스위처를 제어하는 Python 도구입니다.

제조사 서버 중단으로 공식 앱을 사용할 수 없게 되어, BLE 프로토콜을 브루트포스로 역공학하여 만들었습니다.

## 설치

```bash
pip install bleak
```

## 사용법

### 스위처 제어

```bash
python3 switcher.py on      # 켜기 (왼쪽)
python3 switcher.py off     # 끄기 (오른쪽)
python3 switcher.py toggle  # 토글
```

### 새로운 기기 분석

#### 1. BLE 기기 스캔
```bash
python3 scan.py
```
- 주변 BLE 기기 검색
- 특정 기기의 서비스/특성 탐색

#### 2. 브루트포스로 명령 찾기
```bash
python3 brute_force.py
```
- 모든 Write 특성에 0x00~0xFF 명령 전송
- 기기가 반응하면 Ctrl+C로 중단
- 해당 범위 정밀 테스트

## 파일 구조

```
├── switcher.py      # 스위처 제어 (메인)
├── config.py        # 설정 (MAC 주소, 명령)
├── scan.py          # BLE 스캔/탐색 도구
├── brute_force.py   # 브루트포스 도구
├── requirements.txt
└── README.md
```

## SWITCHER_M 분석 결과

### 기기 정보
- **기기명**: SWITCHER_M
- **칩셋**: Nordic nRF5DFU
- **통신**: BLE 1.1 (동시 연결 불가)
- **용도**: 전등 스위치 위에 부착하여 물리적으로 누르는 장치

### 발견된 프로토콜
- **Characteristic**: `000015ba-0000-1000-8000-00805f9b34fb`
- **명령**:
  | 명령 | 동작 |
  |------|------|
  | `00` | 오른쪽 (OFF) |
  | `01` | 왼쪽 (ON) |
  | `02` | 오른쪽 (OFF) |
  | `03` | 왼쪽 (ON) |
  | `04` | 토글 |
  | `05` | 토글 |

## 다른 기기에 적용

1. `scan.py`로 기기 주소 확인
2. `brute_force.py`로 동작하는 명령 찾기
3. `config.py` 수정:
```python
DEVICE_ADDRESS = "your-device-address"
CHAR_CONTROL = "your-characteristic-uuid"
CMD_ON = "xx"
CMD_OFF = "xx"
```

## 요구사항

- Python 3.9+
- macOS / Linux / Windows
- Bluetooth 지원
- bleak >= 0.21.0

## 라이선스

MIT License
