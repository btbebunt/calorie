import { NextResponse } from "next/server";
import { getAppTodayDateString } from "@/lib/app-timezone";
import { getSession } from "@/lib/auth";
import { deleteLog, getTodayDashboard } from "@/lib/dashboard";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteLog(session.userId, id);
    const summary = await getTodayDashboard(
      session.userId,
      session.dailyCalorieTarget,
      getAppTodayDateString()
    );
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({ error: "Failed to delete log" }, { status: 500 });
  }
}
