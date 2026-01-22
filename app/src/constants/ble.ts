// Switcher BLE 설정
export const DEVICE_NAME = 'SWITCHER_M';
export const SERVICE_UUID = '0000150b-0000-1000-8000-00805f9b34fb';
export const CHAR_CONTROL_UUID = '000015ba-0000-1000-8000-00805f9b34fb';

// 명령어
export const CMD = {
  OFF: '00',    // 오른쪽
  ON: '01',     // 왼쪽
  TOGGLE: '04', // 토글
} as const;
