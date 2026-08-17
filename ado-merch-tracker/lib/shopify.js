// Ado's official shop (ado-shop.com) runs on Shopify, which exposes a public
// products.json feed for any collection. We use that instead of scraping HTML.
const SHOP_BASE = "https://ado-shop.com";
const COLLECTION_PATH =
  process.env.ADO_COLLECTION_PATH || "/collections/all-merch";

export async function fetchMerchProducts() {
  const url = `${SHOP_BASE}${COLLECTION_PATH}/products.json?limit=250`;
  const res = await fetch(url, {
    headers: {
      // A normal browser UA avoids being blocked by basic bot filters.
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "application/json",
    },
    // Always hit the origin fresh; this runs in a serverless function anyway.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Shopify fetch failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const products = data.products || [];

  // Normalize into { [handle]: {...} } for easy diffing/storage.
  const normalized = {};
  for (const p of products) {
    const variants = (p.variants || []).map((v) => ({
      id: v.id,
      title: v.title,
      available: !!v.available,
      price: v.price,
    }));
    const anyAvailable = variants.some((v) => v.available);

    normalized[p.handle] = {
      id: p.id,
      handle: p.handle,
      title: p.title,
      url: `${SHOP_BASE}/products/${p.handle}`,
      image: p.images && p.images[0] ? p.images[0].src : null,
      publishedAt: p.published_at,
      variants,
      anyAvailable,
    };
  }

  return normalized;
}

export { SHOP_BASE };
