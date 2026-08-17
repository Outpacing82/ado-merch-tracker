async function getStatus() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  try {
    const res = await fetch(`${base}/api/status`, { cache: "no-store" });
    return res.json();
  } catch {
    return { lastChecked: null, lastResult: null };
  }
}

export default async function Home() {
  const { lastChecked, lastResult } = await getStatus();

  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 640,
        margin: "0 auto",
        padding: "48px 20px",
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>🎤 Ado Merch Tracker</h1>
      <p style={{ color: "#999", marginTop: 0 }}>
        Watching{" "}
        <a
          href="https://ado-shop.com/collections/all-merch"
          style={{ color: "#8ab4f8" }}
        >
          ado-shop.com/collections/all-merch
        </a>{" "}
        for new listings and restocks. Emails go out automatically when
        something changes.
      </p>

      <div
        style={{
          background: "#17171a",
          borderRadius: 12,
          padding: 20,
          marginTop: 24,
        }}
      >
        <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>Last check</h2>
        {lastChecked ? (
          <p style={{ margin: 0 }}>{new Date(lastChecked).toLocaleString()}</p>
        ) : (
          <p style={{ margin: 0, color: "#999" }}>
            No checks yet — trigger /api/check once to get started.
          </p>
        )}

        {lastResult && (
          <pre
            style={{
              marginTop: 16,
              background: "#0b0b0d",
              padding: 12,
              borderRadius: 8,
              overflowX: "auto",
              fontSize: 13,
            }}
          >
            {JSON.stringify(lastResult, null, 2)}
          </pre>
        )}
      </div>

      <p style={{ color: "#666", fontSize: 13, marginTop: 24 }}>
        This page reads from Redis, updated each time an external cron hits{" "}
        <code>/api/check?secret=...</code>.
      </p>
    </main>
  );
}
