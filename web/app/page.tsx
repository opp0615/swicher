"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://121.167.126.66:8080";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

async function api(path: string, method: "GET" | "POST" = "POST") {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  return res.json();
}

export default function Home() {
  const [bleConnected, setBleConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const parseBool = (v: unknown): boolean => {
    if (typeof v === "boolean") return v;
    if (typeof v === "object" && v !== null && "_value" in v)
      return Boolean((v as { _value: unknown })._value);
    return Boolean(v);
  };

  const checkHealth = useCallback(async () => {
    try {
      const data = await api("/health", "GET");
      setBleConnected(parseBool(data.ble_connected));
    } catch {
      setBleConnected(null);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const sendCommand = async (path: string, label: string) => {
    setLoading(label);
    setLastResult(null);
    try {
      const data = await api(path);
      if (data.ble_connected !== undefined) {
        setBleConnected(data.ble_connected);
      }
      setLastResult(`${label} - ${data.status}`);
      checkHealth();
    } catch {
      setLastResult(`${label} - 실패`);
    } finally {
      setLoading(null);
    }
  };

  const statusColor =
    bleConnected === true
      ? "bg-green-500"
      : bleConnected === false
        ? "bg-red-500"
        : "bg-gray-500";

  const statusText =
    bleConnected === true
      ? "BLE 연결됨"
      : bleConnected === false
        ? "BLE 끊김"
        : "서버 연결 안됨";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 bg-gray-950 text-white">
      <h1 className="text-3xl font-bold">Switcher</h1>

      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${statusColor}`} />
        <span className="text-sm text-gray-400">{statusText}</span>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => sendCommand("/switch/on", "ON")}
          disabled={loading !== null}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:text-gray-500 text-white font-bold py-4 rounded-xl text-xl transition"
        >
          {loading === "ON" ? "..." : "ON"}
        </button>

        <button
          onClick={() => sendCommand("/switch/off", "OFF")}
          disabled={loading !== null}
          className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-900 disabled:text-gray-500 text-white font-bold py-4 rounded-xl text-xl transition"
        >
          {loading === "OFF" ? "..." : "OFF"}
        </button>

        <button
          onClick={() => sendCommand("/switch/toggle", "토글")}
          disabled={loading !== null}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:text-gray-500 text-white font-bold py-4 rounded-xl text-xl transition"
        >
          {loading === "토글" ? "..." : "토글"}
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => sendCommand("/ble/connect", "연결")}
          disabled={loading !== null}
          className="text-sm text-green-400 hover:text-green-300 disabled:text-gray-600"
        >
          BLE 연결
        </button>
        <button
          onClick={() => sendCommand("/ble/disconnect", "해제")}
          disabled={loading !== null}
          className="text-sm text-red-400 hover:text-red-300 disabled:text-gray-600"
        >
          BLE 해제
        </button>
      </div>

      {lastResult && <p className="text-sm text-gray-500">{lastResult}</p>}
    </div>
  );
}
