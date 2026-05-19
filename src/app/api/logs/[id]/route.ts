import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteLog, getTodayDashboard } from "@/lib/dashboard";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteLog(session.userId, id);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") ?? undefined;
    const offset = Number(searchParams.get("offset") ?? 0);
    const summary = await getTodayDashboard(
      session.userId,
      session.dailyCalorieTarget,
      date ?? undefined,
      offset
    );
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({ error: "Failed to delete log" }, { status: 500 });
  }
}
