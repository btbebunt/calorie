export interface UserSession {
  userId: string;
  username: string;
  dailyCalorieTarget: number;
}

export interface DailyLog {
  id: string;
  user_id: string;
  food_name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  timestamp: string;
}

export interface NutritionAnalysis {
  food_name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}

export interface DashboardSummary {
  target: number;
  consumed: number;
  remaining: number;
  protein: number;
  fats: number;
  carbs: number;
  logs: DailyLog[];
}
