import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTodayDashboard, insertLog } from "@/lib/dashboard";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? undefined;
  const offset = Number(searchParams.get("offset") ?? 0);

  try {
    const summary = await getTodayDashboard(
      session.userId,
      session.dailyCalorieTarget,
      date ?? undefined,
      offset
    );
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({ error: "Failed to load logs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const log = await insertLog(session.userId, {
      food_name: String(body.food_name),
      calories: Number(body.calories),
      protein: Number(body.protein),
      fats: Number(body.fats),
      carbs: Number(body.carbs),
    });
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") ?? undefined;
    const offset = Number(searchParams.get("offset") ?? 0);
    const summary = await getTodayDashboard(
      session.userId,
      session.dailyCalorieTarget,
      date ?? undefined,
      offset
    );
    return NextResponse.json({ log, summary });
  } catch {
    return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
  }
}
