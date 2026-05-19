"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getLocalDayQuery } from "@/lib/date-client";
import { prepareImageForAnalysis } from "@/lib/prepare-image";
import type { NutritionAnalysis } from "@/types";

interface LogDialogsProps {
  onSaved: () => void;
}

export function LogDialogs({ onSaved }: LogDialogsProps) {
  const [textOpen, setTextOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<File | null>(null);

  function reset() {
    setText("");
    setPreview(null);
    setAnalysis(null);
    imageFileRef.current = null;
  }

  async function analyzeText() {
    if (!text.trim()) {
      toast.error("Describe what you ate");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/analyze/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalysis(data);
    } catch {
      toast.error("Could not analyze food. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function analyzeImage(file: File) {
    setLoading(true);
    try {
      const prepared = await prepareImageForAnalysis(file);
      const formData = new FormData();
      formData.append("image", prepared);
      const res = await fetch("/api/analyze/image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.error || "Analysis failed");
      }
      setAnalysis(data);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not analyze image. Try again.";
      console.error("Image analyze client error:", err);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    imageFileRef.current = file;
    setPreview(URL.createObjectURL(file));
    setAnalysis(null);
    void analyzeImage(file);
  }

  async function saveLog() {
    if (!analysis) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/logs?${getLocalDayQuery()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysis),
      });
      if (!res.ok) throw new Error();
      toast.success(`Logged ${analysis.food_name}`);
      setTextOpen(false);
      setImageOpen(false);
      reset();
      onSaved();
    } catch {
      toast.error("Failed to save log");
    } finally {
      setSaving(false);
    }
  }

  function AnalysisPreview() {
    if (!analysis) return null;
    return (
      <div className="rounded-lg border bg-muted/40 p-3 text-sm">
        <p className="font-medium">{analysis.food_name}</p>
        <p className="text-muted-foreground mt-1">
          {analysis.calories} kcal · P {analysis.protein}g · F {analysis.fats}g · C{" "}
          {analysis.carbs}g
        </p>
      </div>
    );
  }

  return (
  <>
      <div className="grid grid-cols-2 gap-2">
        <Button
          className="h-12 gap-2"
          variant="default"
          onClick={() => {
            reset();
            setImageOpen(true);
          }}
        >
          <Camera className="size-4" />
          Camera / Image
        </Button>
        <Button
          className="h-12 gap-2"
          variant="secondary"
          onClick={() => {
            reset();
            setTextOpen(true);
          }}
        >
          <MessageSquareText className="size-4" />
          Text input
        </Button>
      </div>

      <Dialog
        open={textOpen}
        onOpenChange={(open) => {
          setTextOpen(open);
          if (!open) reset();
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Log via text</DialogTitle>
            <DialogDescription>
              Describe what you ate and AI will estimate nutrition.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g. 2 eggs, toast with butter, black coffee"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
          />
          <AnalysisPreview />
          <DialogFooter className="gap-2 sm:gap-0">
            {!analysis ? (
              <Button onClick={analyzeText} disabled={loading} className="w-full">
                {loading && <Loader2 className="size-4 animate-spin" />}
                Analyze
              </Button>
            ) : (
              <Button onClick={saveLog} disabled={saving} className="w-full">
                {saving && <Loader2 className="size-4 animate-spin" />}
                Save to log
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={imageOpen}
        onOpenChange={(open) => {
          setImageOpen(open);
          if (!open) reset();
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Log via photo</DialogTitle>
            <DialogDescription>
              Take or upload a photo of your meal for AI analysis.
            </DialogDescription>
          </DialogHeader>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Food preview"
              className="max-h-48 w-full rounded-lg object-cover"
            />
          ) : (
            <Button
              variant="outline"
              className="h-24 w-full"
              onClick={() => fileRef.current?.click()}
            >
              <Camera className="mr-2 size-5" />
              Choose or capture photo
            </Button>
          )}
          {preview && loading && (
            <p className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Analyzing…
            </p>
          )}
          <AnalysisPreview />
          <DialogFooter className="gap-2 sm:gap-0">
            {analysis && (
              <Button onClick={saveLog} disabled={saving} className="w-full">
                {saving && <Loader2 className="size-4 animate-spin" />}
                Save to log
              </Button>
            )}
            {preview && !analysis && !loading && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileRef.current?.click()}
              >
                Retake photo
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
