import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NutritionAnalysis } from "@/types";

const SYSTEM_PROMPT = `You are a nutrition expert. Analyze the food described or shown and estimate nutritional values.
Respond ONLY with valid JSON matching this exact schema (no markdown, no extra text):
{
  "food_name": "Calculated or summarized food name",
  "calories": 0,
  "protein": 0.0,
  "fats": 0.0,
  "carbs": 0.0
}
Use realistic estimates for the portion described. Round calories to integer; macros to one decimal.`;

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });
}

function parseNutritionJson(text: string): NutritionAnalysis {
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
  const parsed = JSON.parse(cleaned) as NutritionAnalysis;
  return {
    food_name: String(parsed.food_name || "Unknown food"),
    calories: Math.round(Number(parsed.calories) || 0),
    protein: Number(parsed.protein) || 0,
    fats: Number(parsed.fats) || 0,
    carbs: Number(parsed.carbs) || 0,
  };
}

export async function analyzeFoodText(description: string): Promise<NutritionAnalysis> {
  const model = getModel();
  const result = await model.generateContent([
    { text: SYSTEM_PROMPT },
    { text: `Analyze this food intake:\n${description}` },
  ]);
  const text = result.response.text();
  return parseNutritionJson(text);
}

export async function analyzeFoodImage(
  base64Data: string,
  mimeType: string
): Promise<NutritionAnalysis> {
  const model = getModel();
  const result = await model.generateContent([
    { text: SYSTEM_PROMPT },
    {
      inlineData: {
        data: base64Data,
        mimeType,
      },
    },
    { text: "Analyze the food in this image and estimate nutrition for the visible portion." },
  ]);
  const text = result.response.text();
  return parseNutritionJson(text);
}
