import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";
import { useBLE } from "./src/hooks/useBLE";
import { SwitcherControl } from "./src/components/SwitcherControl";

export default function App() {
  const {
    isConnected,
    isConnecting,
    isScanning,
    error,
    deviceName,
    connect,
    disconnect,
    turnOn,
    turnOff,
    toggle,
  } = useBLE();

  return (
    <SafeAreaView style={styles.container}>
      <SwitcherControl
        isConnected={isConnected}
        isConnecting={isConnecting}
        isScanning={isScanning}
        error={error}
        deviceName={deviceName}
        onConnect={connect}
        onDisconnect={disconnect}
        onTurnOn={turnOn}
        onTurnOff={turnOff}
        onToggle={toggle}
      />
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
});
