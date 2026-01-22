/**
 * Web Bluetooth API를 사용한 BLE 연결 (Chrome/Edge)
 */
import { useState, useCallback } from 'react';
import { DEVICE_NAME, SERVICE_UUID, CHAR_CONTROL_UUID, CMD } from '../constants/ble';

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
    error: null,
    deviceName: null,
  });

  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);

  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      // Web Bluetooth API 지원 확인
      if (!navigator.bluetooth) {
        throw new Error('이 브라우저는 Web Bluetooth를 지원하지 않습니다. Chrome을 사용해주세요.');
      }

      // 기기 선택 다이얼로그
      const selectedDevice = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: DEVICE_NAME }],
        optionalServices: [SERVICE_UUID],
      });

      setDevice(selectedDevice);

      // GATT 서버 연결
      const server = await selectedDevice.gatt?.connect();
      if (!server) throw new Error('GATT 서버 연결 실패');

      // 서비스 및 특성 가져오기
      const service = await server.getPrimaryService(SERVICE_UUID);
      const char = await service.getCharacteristic(CHAR_CONTROL_UUID);

      setCharacteristic(char);

      setState({
        isConnected: true,
        isConnecting: false,
        error: null,
        deviceName: selectedDevice.name || 'Unknown',
      });

      // 연결 해제 이벤트 처리
      selectedDevice.addEventListener('gattserverdisconnected', () => {
        setState(prev => ({ ...prev, isConnected: false, deviceName: null }));
        setCharacteristic(null);
      });

    } catch (err: any) {
      setState({
        isConnected: false,
        isConnecting: false,
        error: err.message || '연결 실패',
        deviceName: null,
      });
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (device?.gatt?.connected) {
      device.gatt.disconnect();
    }
    setDevice(null);
    setCharacteristic(null);
    setState({
      isConnected: false,
      isConnecting: false,
      error: null,
      deviceName: null,
    });
  }, [device]);

  const sendCommand = useCallback(async (cmd: string) => {
    if (!characteristic) {
      setState(prev => ({ ...prev, error: '연결되지 않았습니다' }));
      return false;
    }

    try {
      const data = new Uint8Array([parseInt(cmd, 16)]);
      await characteristic.writeValueWithoutResponse(data);
      return true;
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message || '명령 전송 실패' }));
      return false;
    }
  }, [characteristic]);

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
