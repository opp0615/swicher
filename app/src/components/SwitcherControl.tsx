import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";

interface SwitcherControlProps {
  isConnected: boolean;
  isConnecting: boolean;
  isScanning?: boolean;
  error: string | null;
  deviceName: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onTurnOn: () => void;
  onTurnOff: () => void;
  onToggle: () => void;
}

export function SwitcherControl({
  isConnected,
  isConnecting,
  isScanning = false,
  error,
  deviceName,
  onConnect,
  onDisconnect,
  onTurnOn,
  onTurnOff,
  onToggle,
}: SwitcherControlProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Switcher Controller</Text>
      <Text style={styles.subtitle}>Smart Switch BLE Control</Text>

      {/* 연결 상태 */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            isConnected ? styles.statusConnected : styles.statusDisconnected,
          ]}
        />
        <Text style={styles.statusText}>
          {isConnecting
            ? isScanning
              ? "기기 검색 중..."
              : "연결 중..."
            : isConnected
              ? `연결됨: ${deviceName}`
              : "연결 안됨"}
        </Text>
      </View>

      {/* 에러 메시지 */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* 연결 버튼 */}
      <View style={styles.connectSection}>
        {!isConnected ? (
          <TouchableOpacity
            style={[styles.button, styles.connectButton]}
            onPress={onConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>연결하기</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.disconnectButton]}
            onPress={onDisconnect}
          >
            <Text style={styles.buttonText}>연결 해제</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 컨트롤 버튼 */}
      <View style={styles.controlSection}>
        <Text style={styles.sectionTitle}>스위치 제어</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.controlButton,
              styles.offButton,
              !isConnected && styles.buttonDisabled,
            ]}
            onPress={onTurnOff}
            disabled={!isConnected}
          >
            <Text style={styles.buttonText}>OFF</Text>
            <Text style={styles.buttonSubtext}>왼쪽</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.controlButton,
              styles.onButton,
              !isConnected && styles.buttonDisabled,
            ]}
            onPress={onTurnOn}
            disabled={!isConnected}
          >
            <Text style={styles.buttonText}>ON</Text>
            <Text style={styles.buttonSubtext}>오른쪽</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            styles.toggleButton,
            !isConnected && styles.buttonDisabled,
          ]}
          onPress={onToggle}
          disabled={!isConnected}
        >
          <Text style={styles.buttonText}>TOGGLE</Text>
          <Text style={styles.buttonSubtext}>토글</Text>
        </TouchableOpacity>
      </View>

      {/* 플랫폼 정보 */}
      <Text style={styles.platformInfo}>
        {Platform.OS === "web"
          ? "Web Bluetooth API (Chrome/Edge)"
          : `${Platform.OS} - react-native-ble-plx`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#eee",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 30,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusConnected: {
    backgroundColor: "#4ade80",
  },
  statusDisconnected: {
    backgroundColor: "#f87171",
  },
  statusText: {
    fontSize: 16,
    color: "#ccc",
  },
  errorText: {
    fontSize: 14,
    color: "#f87171",
    marginBottom: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  connectSection: {
    marginVertical: 20,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  buttonSubtext: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  connectButton: {
    backgroundColor: "#3b82f6",
  },
  disconnectButton: {
    backgroundColor: "#6b7280",
  },
  controlSection: {
    marginTop: 20,
    width: "100%",
    maxWidth: 300,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    color: "#888",
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 15,
  },
  controlButton: {
    flex: 1,
    minWidth: 100,
  },
  onButton: {
    backgroundColor: "#22c55e",
  },
  offButton: {
    backgroundColor: "#ef4444",
  },
  toggleButton: {
    backgroundColor: "#8b5cf6",
    width: "100%",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  platformInfo: {
    position: "absolute",
    bottom: 30,
    fontSize: 12,
    color: "#555",
  },
});
