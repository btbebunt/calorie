import { NextResponse } from "next/server";
import { analyzeFoodImage } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length === 0) {
      return NextResponse.json({ error: "Empty image file" }, { status: 400 });
    }

    const base64 = buffer.toString("base64");
    let mimeType = (file.type || "").toLowerCase();
    if (!mimeType || mimeType === "application/octet-stream") {
      mimeType = "image/jpeg";
    }
    // Gemini vision expects decodable raster types
    if (mimeType === "image/heic" || mimeType === "image/heif") {
      return NextResponse.json(
        {
          error:
            "HEIC photos must be converted before upload. Please retry; the app will convert automatically.",
        },
        { status: 400 }
      );
    }

    const nutrition = await analyzeFoodImage(base64, mimeType);
    return NextResponse.json(nutrition);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown image analysis error";
    console.error("Image analysis error:", message, error);
    return NextResponse.json(
      {
        error: "Failed to analyze food image",
        detail: message,
      },
      { status: 500 }
    );
  }
}
