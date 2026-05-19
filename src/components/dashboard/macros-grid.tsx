"use client";

import { Beef, Droplets, Wheat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MacrosGridProps {
  protein: number;
  fats: number;
  carbs: number;
}

const items = [
  { key: "protein", label: "Protein", unit: "g", icon: Beef, color: "text-rose-500" },
  { key: "fats", label: "Fats", unit: "g", icon: Droplets, color: "text-amber-500" },
  { key: "carbs", label: "Carbs", unit: "g", icon: Wheat, color: "text-sky-500" },
] as const;

export function MacrosGrid({ protein, fats, carbs }: MacrosGridProps) {
  const values = { protein, fats, carbs };

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(({ key, label, unit, icon: Icon, color }) => (
        <Card key={key} size="sm" className="py-0">
          <CardContent className="flex flex-col items-center gap-1 px-2 py-3">
            <Icon className={`size-4 ${color}`} />
            <span className="text-muted-foreground text-[10px] uppercase tracking-wide">
              {label}
            </span>
            <span className="text-lg font-bold tabular-nums">
              {values[key].toFixed(1)}
              <span className="text-muted-foreground ml-0.5 text-xs font-normal">
                {unit}
              </span>
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
