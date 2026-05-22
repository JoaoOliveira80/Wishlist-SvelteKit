import { json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

const RAWG_BASE_URL = "https://api.rawg.io/api";
const SAFE_PATH_PATTERN = /^\/[a-zA-Z0-9/-]+$/;

/**
 * Proxies RAWG requests to keep API key on the server.
 * @param {import('./$types').RequestEvent} event
 */
export async function GET({ url, fetch }) {
  const rawgApiKey = env.RAWG_API_KEY;

  if (!rawgApiKey) {
    return json(
      { error: "RAWG_API_KEY is not configured on server" },
      { status: 500 },
    );
  }

  const path = url.searchParams.get("path") ?? "";

  if (!SAFE_PATH_PATTERN.test(path) || path.includes("..")) {
    return json({ error: "Invalid RAWG path" }, { status: 400 });
  }

  const targetUrl = new URL(`${RAWG_BASE_URL}${path}`);

  for (const [key, value] of url.searchParams.entries()) {
    if (key !== "path") {
      targetUrl.searchParams.append(key, value);
    }
  }

  targetUrl.searchParams.append("key", rawgApiKey);

  const response = await fetch(targetUrl.toString());
  const payload = await response.text();

  return new Response(payload, {
    status: response.status,
    headers: {
      "content-type":
        response.headers.get("content-type") ?? "application/json",
      "cache-control": "public, max-age=60",
    },
  });
}
