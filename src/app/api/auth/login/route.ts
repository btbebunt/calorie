import { NextResponse } from "next/server";
import {
  getProfileByUsername,
  isValidCredentials,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!isValidCredentials(username, password)) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const profile = await getProfileByUsername(username);
    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    await setSessionCookie({
      userId: profile.id,
      username: profile.username,
      dailyCalorieTarget: profile.daily_calorie_target,
    });

    return NextResponse.json({
      username: profile.username,
      dailyCalorieTarget: profile.daily_calorie_target,
    });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
