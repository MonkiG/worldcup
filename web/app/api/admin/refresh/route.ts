import { NextResponse } from "next/server";
import { rebuildSnapshot, refreshWorldCupData } from "@/lib/scraper/run";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

function isAuthorized(request: Request) {
  const secret = process.env.WORLD_CUP_REFRESH_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

async function handleRefresh(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") === "snapshot" ? "snapshot" : "refresh";
  const startedAt = new Date().toISOString();
  const source = mode === "snapshot" ? await rebuildSnapshot() : await refreshWorldCupData();

  return NextResponse.json({
    mode,
    ok: true,
    startedAt,
    finishedAt: new Date().toISOString(),
    generatedAt: source["generated-at"],
    fixtures: source.fixtures.matches.length,
    groups: source.live.groups.length,
    results: source.live.results.length,
  });
}

export async function GET(request: Request) {
  return handleRefresh(request);
}

export async function POST(request: Request) {
  return handleRefresh(request);
}
