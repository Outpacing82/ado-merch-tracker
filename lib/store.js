import { Redis } from "@upstash/redis";

// Reads UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN from env automatically.
// Lazily created so the build doesn't fail in environments without the env vars set yet.
let _redis;
export function redis() {
  if (!_redis) _redis = Redis.fromEnv();
  return _redis;
}

const SNAPSHOT_KEY = "ado:merch:snapshot";
const LAST_CHECK_KEY = "ado:merch:last_checked";
const LAST_RESULT_KEY = "ado:merch:last_result";

export async function getSnapshot() {
  const data = await redis().get(SNAPSHOT_KEY);
  return data || {};
}

export async function saveSnapshot(snapshot) {
  await redis().set(SNAPSHOT_KEY, snapshot);
}

export async function setLastChecked(iso) {
  await redis().set(LAST_CHECK_KEY, iso);
}

export async function getLastChecked() {
  return (await redis().get(LAST_CHECK_KEY)) || null;
}

export async function setLastResult(result) {
  await redis().set(LAST_RESULT_KEY, result);
}

export async function getLastResult() {
  return (await redis().get(LAST_RESULT_KEY)) || null;
}
