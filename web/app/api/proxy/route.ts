import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://121.167.126.66:8080";
const API_KEY = process.env.API_KEY || "";

export async function GET(req: NextRequest) {
  return proxy(req);
}

export async function POST(req: NextRequest) {
  return proxy(req);
}

async function proxy(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "path required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: req.method,
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "API unreachable" }, { status: 502 });
  }
}
