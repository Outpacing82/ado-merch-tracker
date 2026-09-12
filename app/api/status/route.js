import { NextResponse } from "next/server";
import { getLastChecked, getLastResult } from "../../../lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const [lastChecked, lastResult] = await Promise.all([
    getLastChecked(),
    getLastResult(),
  ]);
  return NextResponse.json({ lastChecked, lastResult });
}
