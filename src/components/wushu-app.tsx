"use client";

import { RoutineJudge } from "@/components/routine-judge";
import { StanceJudge } from "@/components/stance-judge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function WushuApp() {
  return (
    <div className="min-h-full bg-gradient-to-b from-background via-background to-cyan-950/20">
      <div className="mx-auto max-w-6xl px-4 pt-6 md:px-6">
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
