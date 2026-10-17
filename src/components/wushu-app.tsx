"use client";

import Link from "next/link";
import { RoutineJudge } from "@/components/routine-judge";
import { StanceJudge } from "@/components/stance-judge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function WushuApp() {
  return (
    <div className="min-h-full bg-gradient-to-b from-background via-background to-cyan-950/20">
      <div className="mx-auto max-w-6xl px-4 pt-6 md:px-6">
        <p className="mb-4 text-center text-xs text-muted-foreground">
          Coaches: set reference YouTube in{" "}
          <code>reference-videos.json</code>, then{" "}
          <Link href="/calibrate/" className="text-cyan-400 underline">
            calibrate
          </Link>{" "}
          and redeploy to GitHub Pages.
        </p>
        <Tabs defaultValue="routine" className="gap-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="routine">Routine video</TabsTrigger>
            <TabsTrigger value="live">Live practice</TabsTrigger>
          </TabsList>
          <TabsContent value="routine">
            <RoutineJudge />
          </TabsContent>
          <TabsContent value="live">
            <StanceJudge />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
