/**
 * 네이티브 앱용 BLE - react-native-ble-plx 사용
 * 나중에 앱 빌드 시 구현
 */
import { useState, useCallback } from 'react';
import { CMD } from '../constants/ble';

interface BLEState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  deviceName: string | null;
}

export function useBLE() {
  const [state, setState] = useState<BLEState>({
    isConnected: false,
    isConnecting: false,
    error: '네이티브 BLE는 아직 구현되지 않았습니다. 웹에서 테스트해주세요.',
    deviceName: null,
  });

  const connect = useCallback(async () => {
    // TODO: react-native-ble-plx 구현
    setState(prev => ({ ...prev, error: '네이티브 BLE 미구현' }));
  }, []);

  const disconnect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnected: false }));
  }, []);

  const sendCommand = useCallback(async (cmd: string) => {
    return false;
  }, []);

  const turnOn = useCallback(() => sendCommand(CMD.ON), [sendCommand]);
  const turnOff = useCallback(() => sendCommand(CMD.OFF), [sendCommand]);
  const toggle = useCallback(() => sendCommand(CMD.TOGGLE), [sendCommand]);

  return {
    ...state,
    connect,
    disconnect,
    turnOn,
    turnOff,
    toggle,
  };
}
