"use client";

import { Trash2, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyLog } from "@/types";

interface LogTimelineProps {
  logs: DailyLog[];
  onDelete: (id: string) => void;
  deletingId: string | null;
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LogTimeline({ logs, onDelete, deletingId }: LogTimelineProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <UtensilsCrossed className="size-4 text-emerald-600" />
          Today&apos;s log
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {logs.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No food logged yet today. Tap a button below to add your first entry.
          </p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 rounded-lg border bg-card/50 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{log.food_name}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {formatTime(log.timestamp)} · {log.calories} kcal · P{" "}
                  {Number(log.protein).toFixed(0)}g · F{" "}
                  {Number(log.fats).toFixed(0)}g · C {Number(log.carbs).toFixed(0)}g
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive shrink-0"
                disabled={deletingId === log.id}
                onClick={() => onDelete(log.id)}
                aria-label="Delete entry"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
