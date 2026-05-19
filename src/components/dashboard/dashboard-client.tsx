"use client";

import { useCallback, useEffect, useState } from "react";
import { LogOut, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CalorieRing } from "@/components/dashboard/calorie-ring";
import { LogDialogs } from "@/components/dashboard/log-dialogs";
import { LogTimeline } from "@/components/dashboard/log-timeline";
import { MacrosGrid } from "@/components/dashboard/macros-grid";
import type { DashboardSummary } from "@/types";

interface DashboardClientProps {
  username: string;
}

export function DashboardClient({ username }: DashboardClientProps) {
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/logs");
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error();
      setSummary(data);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/logs/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSummary(data);
      toast.success("Entry removed");
    } catch {
      toast.error("Failed to delete entry");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  if (loading || !summary) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <RefreshCw className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 pb-8 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider">
            Calorie Tracker
          </p>
          <h1 className="text-xl font-semibold capitalize">Hi, {username}</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
          <LogOut className="size-4" />
        </Button>
      </header>

      <section className="mb-6 flex justify-center">
        <CalorieRing
          target={summary.target}
          consumed={summary.consumed}
          remaining={summary.remaining}
        />
      </section>

      <section className="mb-6">
        <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
          Macros today
        </p>
        <MacrosGrid
          protein={summary.protein}
          fats={summary.fats}
          carbs={summary.carbs}
        />
      </section>

      <section className="mb-4">
        <LogDialogs onSaved={load} />
      </section>

      <section>
        <LogTimeline
          logs={summary.logs}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      </section>
    </div>
  );
}
