import { NextResponse } from "next/server";
import { fetchMerchProducts } from "../../../lib/shopify";
import { sendMerchAlert } from "../../../lib/email";
import {
  getSnapshot,
  saveSnapshot,
  setLastChecked,
  setLastResult,
} from "../../../lib/store";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request) {
  // Protect the endpoint so randoms on the internet can't trigger emails/spend quota.
  const secret = request.nextUrl.searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const [current, previous] = await Promise.all([
      fetchMerchProducts(),
      getSnapshot(),
    ]);

    const isFirstRun = Object.keys(previous).length === 0;

    const newItems = [];
    const restockedItems = [];

    for (const handle of Object.keys(current)) {
      const now = current[handle];
      const before = previous[handle];

      if (!before) {
        if (!isFirstRun) newItems.push(now);
        continue;
      }

      if (!before.anyAvailable && now.anyAvailable) {
        restockedItems.push(now);
      }
    }

    await saveSnapshot(current);
    await setLastChecked(new Date().toISOString());

    let emailed = false;
    if (!isFirstRun && (newItems.length || restockedItems.length)) {
      await sendMerchAlert({ newItems, restockedItems });
      emailed = true;
    }

    const result = {
      checkedAt: new Date().toISOString(),
      productCount: Object.keys(current).length,
      isFirstRun,
      newItems: newItems.map((i) => i.title),
      restockedItems: restockedItems.map((i) => i.title),
      emailed,
    };
    await setLastResult(result);

    return NextResponse.json(result);
  } catch (err) {
    const errorResult = {
      checkedAt: new Date().toISOString(),
      error: String(err && err.message ? err.message : err),
    };
    await setLastResult(errorResult);
    return NextResponse.json(errorResult, { status: 500 });
  }
}
