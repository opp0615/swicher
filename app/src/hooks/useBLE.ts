/**
 * 네이티브 앱용 BLE - react-native-ble-plx 사용
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { Platform, PermissionsAndroid } from "react-native";
import {
  BleManager,
  Device,
  Characteristic,
  State,
} from "react-native-ble-plx";
import {
  DEVICE_NAME,
  SERVICE_UUID,
  CHAR_CONTROL_UUID,
  CMD,
} from "../constants/ble";
import { encode as btoa } from "base-64";

interface BLEState {
  isConnected: boolean;
  isConnecting: boolean;
  isScanning: boolean;
  error: string | null;
  deviceName: string | null;
}

// BLE Manager 싱글톤
let bleManager: BleManager | null = null;

function getBleManager(): BleManager {
  if (!bleManager) {
    bleManager = new BleManager();
  }
  return bleManager;
}

export function useBLE() {
  const [state, setState] = useState<BLEState>({
    isConnected: false,
    isConnecting: false,
    isScanning: false,
    error: null,
    deviceName: null,
  });

  const deviceRef = useRef<Device | null>(null);
  const characteristicRef = useRef<Characteristic | null>(null);

  // Android 권한 요청
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === "android") {
      const apiLevel = Platform.Version;

      if (apiLevel >= 31) {
        // Android 12+
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        const allGranted = Object.values(results).every(
          (result) => result === PermissionsAndroid.RESULTS.GRANTED,
        );

        if (!allGranted) {
          setState((prev) => ({
            ...prev,
            error: "블루투스 권한이 필요합니다",
          }));
          return false;
        }
      } else {
        // Android 11 이하
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setState((prev) => ({
            ...prev,
            error: "위치 권한이 필요합니다",
          }));
          return false;
        }
      }
    }
    return true;
  }, []);

  // BLE 상태 확인
  const checkBleState = useCallback(async (): Promise<boolean> => {
    const manager = getBleManager();
    const bleState = await manager.state();

    if (bleState !== State.PoweredOn) {
      setState((prev) => ({
        ...prev,
        error: "블루투스를 켜주세요",
      }));
      return false;
    }
    return true;
  }, []);

  // 기기 스캔 및 연결
  const connect = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        isConnecting: true,
        isScanning: true,
        error: null,
      }));

      // 권한 확인
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          isScanning: false,
        }));
        return;
      }

      // BLE 상태 확인
      const bleReady = await checkBleState();
      if (!bleReady) {
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          isScanning: false,
        }));
        return;
      }

      const manager = getBleManager();

      // 기기 스캔
      const foundDevice = await new Promise<Device | null>(
        (resolve, reject) => {
          const timeout = setTimeout(() => {
            manager.stopDeviceScan();
            resolve(null);
          }, 10000); // 10초 타임아웃

          manager.startDeviceScan(
            [SERVICE_UUID],
            { allowDuplicates: false },
            (error, device) => {
              if (error) {
                clearTimeout(timeout);
                manager.stopDeviceScan();
                reject(error);
                return;
              }

              if (device?.name?.includes(DEVICE_NAME)) {
                clearTimeout(timeout);
                manager.stopDeviceScan();
                resolve(device);
              }
            },
          );
        },
      );

      setState((prev) => ({ ...prev, isScanning: false }));

      if (!foundDevice) {
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: `${DEVICE_NAME} 기기를 찾을 수 없습니다`,
        }));
        return;
      }

      // 기기 연결
      const connectedDevice = await foundDevice.connect();
      await connectedDevice.discoverAllServicesAndCharacteristics();

      // 특성 가져오기
      const characteristic = await connectedDevice
        .readCharacteristicForService(SERVICE_UUID, CHAR_CONTROL_UUID)
        .catch(() => null);

      // 특성을 읽을 수 없어도 쓰기는 가능할 수 있음
      const chars =
        await connectedDevice.characteristicsForService(SERVICE_UUID);
      const controlChar = chars?.find(
        (c) => c.uuid.toLowerCase() === CHAR_CONTROL_UUID.toLowerCase(),
      );

      if (!controlChar) {
        throw new Error("제어 특성을 찾을 수 없습니다");
      }

      deviceRef.current = connectedDevice;
      characteristicRef.current = controlChar;

      // 연결 해제 모니터링
      connectedDevice.onDisconnected(() => {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          deviceName: null,
        }));
        deviceRef.current = null;
        characteristicRef.current = null;
      });

      setState({
        isConnected: true,
        isConnecting: false,
        isScanning: false,
        error: null,
        deviceName: connectedDevice.name || "Unknown",
      });
    } catch (err: any) {
      setState({
        isConnected: false,
        isConnecting: false,
        isScanning: false,
        error: err.message || "연결 실패",
        deviceName: null,
      });
    }
  }, [requestPermissions, checkBleState]);

  // 연결 해제
  const disconnect = useCallback(async () => {
    try {
      if (deviceRef.current) {
        await deviceRef.current.cancelConnection();
      }
    } catch (err) {
      // 이미 연결이 끊어진 경우 무시
    }
    deviceRef.current = null;
    characteristicRef.current = null;
    setState({
      isConnected: false,
      isConnecting: false,
      isScanning: false,
      error: null,
      deviceName: null,
    });
  }, []);

  // 명령 전송
  const sendCommand = useCallback(async (cmd: string): Promise<boolean> => {
    if (!characteristicRef.current || !deviceRef.current) {
      setState((prev) => ({ ...prev, error: "연결되지 않았습니다" }));
      return false;
    }

    try {
      // 16진수 문자열을 바이트로 변환 후 Base64 인코딩
      const byteValue = parseInt(cmd, 16);
      const base64Value = btoa(String.fromCharCode(byteValue));

      await characteristicRef.current.writeWithoutResponse(base64Value);
      return true;
    } catch (err: any) {
      setState((prev) => ({ ...prev, error: err.message || "명령 전송 실패" }));
      return false;
    }
  }, []);

  const turnOn = useCallback(() => sendCommand(CMD.ON), [sendCommand]);
  const turnOff = useCallback(() => sendCommand(CMD.OFF), [sendCommand]);
  const toggle = useCallback(() => sendCommand(CMD.TOGGLE), [sendCommand]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (deviceRef.current) {
        deviceRef.current.cancelConnection().catch(() => {});
      }
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    turnOn,
    turnOff,
    toggle,
  };
}
