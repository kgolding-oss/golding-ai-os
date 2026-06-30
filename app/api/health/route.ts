import { NextResponse } from "next/server";
import { getPlatformHealth, logger } from "../../../lib/observability";
export const dynamic = "force-dynamic";
export async function GET() { try { const health = await getPlatformHealth(); const status = health.status === "unhealthy" ? 503 : 200; return NextResponse.json(health, { status }); } catch (error) { logger.error("health.route.failed", "Health route failed safely.", error, undefined, { subsystem: "health" }); return NextResponse.json({ status: "unhealthy", subsystems: [], warnings: [], errors: ["Health report failed."], timestamp: new Date().toISOString() }, { status: 503 }); } }
