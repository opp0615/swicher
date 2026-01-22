"""
Switcher BLE Configuration
"""

# 기기 정보
DEVICE_NAME = "SWITCHER_M"
DEVICE_ADDRESS = "5569D6C3-205E-AADF-96EC-DB634970F8C3"

# BLE Characteristics
CHAR_CONTROL = "000015ba-0000-1000-8000-00805f9b34fb"  # 제어 명령 (발견!)
CHAR_READ = "000025ca-0000-1000-8000-00805f9b34fb"  # 상태 읽기

# 명령 (발견됨!)
CMD_RIGHT = "00"  # 오른쪽 = OFF
CMD_LEFT = "01"  # 왼쪽 = ON
CMD_TOGGLE = "04"  # 토글

# 별칭
CMD_OFF = CMD_RIGHT  # 00
CMD_ON = CMD_LEFT  # 01

# 연결 설정
CONNECTION_TIMEOUT = 15.0
