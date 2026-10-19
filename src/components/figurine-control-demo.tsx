"use client";

import "@/lib/motion/disciplines-init";
import { useMemo, useState } from "react";
import { Pose3DMannequinViewer } from "@/components/pose-3d-viewer-mannequin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  figurineWithControlToggles,
  neutralOpenStanceFigurine,
  type FigurineControlToggles,
} from "@/lib/pose/display-figurine/neutral-open-stance";
import { ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EMPTY_TOGGLES: FigurineControlToggles = {
  leftHandRaised: false,
  rightHandRaised: false,
  leftKneeRaised: false,
  rightKneeRaised: false,
};

type FigurineControlDemoProps = {
  onBack?: () => void;
};

export function FigurineControlDemo({ onBack }: FigurineControlDemoProps) {
  const base = useMemo(() => neutralOpenStanceFigurine(), []);
  const [toggles, setToggles] = useState<FigurineControlToggles>(EMPTY_TOGGLES);

  const figurine = useMemo(
    () => figurineWithControlToggles(base, toggles),
    [base, toggles],
  );

  const flip = (key: keyof FigurineControlToggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const reset = () => setToggles(EMPTY_TOGGLES);

  return (
    <div className="min-h-full bg-gradient-to-b from-background via-background to-cyan-950/25">
      <div className="mx-auto flex max-w-lg flex-col gap-5 px-4 py-6 md:py-8">
        <header className="flex flex-wrap items-center gap-3">
          {onBack ? (
            <Button type="button" variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          )}
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-cyan-400/90">
              Control test
            </p>
            <h1 className="text-xl font-semibold md:text-2xl">Figurine only</h1>
          </div>
        </header>

        <p className="text-sm text-muted-foreground">
          Neutral 开步站立. Buttons apply compiled 定势 arm/leg DOFs from 五步拳
          (冲拳 / 提膝), with feet re-grounded after each pose.
        </p>

        <Card className="overflow-hidden border-cyan-500/25">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Preview</CardTitle>
            <CardDescription>Drag horizontally to orbit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0">
            <Pose3DMannequinViewer
              pose={null}
              figurine={figurine}
              horizontalOrbit
              className="h-[min(50vh,400px)] w-full rounded-lg border border-border/60"
            />

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={toggles.leftHandRaised ? "default" : "outline"}
                className="min-h-11"
                onClick={() => flip("leftHandRaised")}
              >
                {toggles.leftHandRaised ? "Lower" : "Raise"} left hand
              </Button>
              <Button
                type="button"
                variant={toggles.rightHandRaised ? "default" : "outline"}
                className="min-h-11"
                onClick={() => flip("rightHandRaised")}
              >
                {toggles.rightHandRaised ? "Lower" : "Raise"} right hand
              </Button>
              <Button
                type="button"
                variant={toggles.leftKneeRaised ? "default" : "outline"}
                className="min-h-11"
                onClick={() => flip("leftKneeRaised")}
              >
                {toggles.leftKneeRaised ? "Lower" : "Raise"} left knee
              </Button>
              <Button
                type="button"
                variant={toggles.rightKneeRaised ? "default" : "outline"}
                className="min-h-11"
                onClick={() => flip("rightKneeRaised")}
              >
                {toggles.rightKneeRaised ? "Lower" : "Raise"} right knee
              </Button>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full min-h-11"
              onClick={reset}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset stance
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
