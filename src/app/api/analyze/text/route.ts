import { NextResponse } from "next/server";
import { analyzeFoodText } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = String(body.text ?? "").trim();
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }
    const nutrition = await analyzeFoodText(text);
    return NextResponse.json(nutrition);
  } catch (error) {
    console.error("Text analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze food text" },
      { status: 500 }
    );
  }
}
