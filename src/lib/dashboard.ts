import { supabase } from "@/lib/supabase";
import type { DailyLog, DashboardSummary } from "@/types";

function dayBounds(
  localDate: string,
  tzOffsetMinutes = 0
): { start: string; end: string } {
  const [year, month, day] = localDate.split("-").map(Number);
  const startMs =
    Date.UTC(year, month - 1, day, 0, 0, 0, 0) + tzOffsetMinutes * 60 * 1000;
  const endMs =
    Date.UTC(year, month - 1, day, 23, 59, 59, 999) + tzOffsetMinutes * 60 * 1000;
  return {
    start: new Date(startMs).toISOString(),
    end: new Date(endMs).toISOString(),
  };
}

export async function getTodayDashboard(
  userId: string,
  target: number,
  localDate?: string,
  tzOffsetMinutes = 0
): Promise<DashboardSummary> {
  const date =
    localDate ?? new Date().toLocaleDateString("en-CA", { timeZone: "UTC" });
  const { start, end } = dayBounds(date, tzOffsetMinutes);

  const { data: logs, error } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("timestamp", start)
    .lte("timestamp", end)
    .order("timestamp", { ascending: false });

  if (error) throw error;

  const items = (logs ?? []) as DailyLog[];
  const consumed = items.reduce((sum, log) => sum + log.calories, 0);
  const protein = items.reduce((sum, log) => sum + Number(log.protein), 0);
  const fats = items.reduce((sum, log) => sum + Number(log.fats), 0);
  const carbs = items.reduce((sum, log) => sum + Number(log.carbs), 0);

  return {
    target,
    consumed,
    remaining: Math.max(target - consumed, 0),
    protein,
    fats,
    carbs,
    logs: items,
  };
}

export async function insertLog(
  userId: string,
  entry: {
    food_name: string;
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
  }
) {
  const { data, error } = await supabase
    .from("daily_logs")
    .insert({ user_id: userId, ...entry })
    .select()
    .single();

  if (error) throw error;
  return data as DailyLog;
}

export async function deleteLog(userId: string, logId: string) {
  const { error } = await supabase
    .from("daily_logs")
    .delete()
    .eq("id", logId)
    .eq("user_id", userId);

  if (error) throw error;
}
