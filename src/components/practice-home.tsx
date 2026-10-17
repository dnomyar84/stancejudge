"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Camera, FileVideo, Sparkles } from "lucide-react";

export type PracticeMode =
  | "home"
  | "routine-video"
  | "live-stance"
  | "live-routine"
  | "syllabus";

type PracticeHomeProps = {
  onSelect: (mode: Exclude<PracticeMode, "home">) => void;
};

export function PracticeHome({ onSelect }: PracticeHomeProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:py-12">
      <header className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-cyan-400/90">
          Stance Judge
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Wushu practice
        </h1>
        <p className="mt-3 text-muted-foreground">
          DDR-style feedback in the browser — iPad front camera ready. All processing stays on your device.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          className="cursor-pointer border-cyan-500/30 transition hover:border-cyan-400/60 hover:bg-cyan-950/20"
          onClick={() => onSelect("live-routine")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-6 w-6 text-cyan-400" />
              Live routine
            </CardTitle>
            <CardDescription>
              Perform with the pose rail. 起势 starts the run; 收势 ends it. Grades and combo as you move.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" className="min-h-12 w-full" size="lg">
              Play
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer border-border/80 transition hover:border-cyan-500/40"
          onClick={() => onSelect("routine-video")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileVideo className="h-6 w-6 text-cyan-400" />
              Routine video
            </CardTitle>
            <CardDescription>
              Upload or stream a recording. Pose rail scores your full form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="secondary" className="min-h-12 w-full" size="lg">
              Open
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer border-border/80 sm:col-span-2"
          onClick={() => onSelect("live-stance")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Camera className="h-6 w-6 text-cyan-400" />
              Stance check
            </CardTitle>
            <CardDescription>
              Athletic or boxing guard — quick live stance score without a full routine.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="outline" className="min-h-12 w-full sm:w-auto">
              Stance mode
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card
        className="cursor-pointer border-border/80 transition hover:border-cyan-500/40"
        onClick={() => onSelect("syllabus")}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-cyan-400" />
            Syllabus
          </CardTitle>
          <CardDescription>
            Official move list with leg and hand tags — 三段长拳 & 四段剑.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="ghost" className="w-full sm:w-auto">
            View 22 moves
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Coaches:{" "}
        <Link href="/admin/" className="text-cyan-400 underline">
          Admin / settings
        </Link>
      </p>
    </div>
  );
}
