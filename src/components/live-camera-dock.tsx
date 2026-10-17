"use client";

import { Button } from "@/components/ui/button";
import { facingLabel } from "@/lib/camera/prefs";
import type { CameraLensProfile, CameraPrefs } from "@/lib/camera/types";
import { cn } from "@/lib/utils";
import { SwitchCamera } from "lucide-react";

type LiveCameraDockProps = {
  prefs: CameraPrefs;
  disabled?: boolean;
  onFlipFacing: () => void;
  onLensChange: (lens: CameraLensProfile) => void;
};

const dockBtn =
  "h-12 w-12 rounded-full border border-white/20 bg-black/50 text-white shadow-lg backdrop-blur-md hover:bg-black/65";

export function LiveCameraDock({
  prefs,
  disabled,
  onFlipFacing,
  onLensChange,
}: LiveCameraDockProps) {
  return (
    <>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        disabled={disabled}
        className={dockBtn}
        onClick={onFlipFacing}
        title={`Switch to ${prefs.facing === "user" ? "rear" : "front"} camera`}
      >
        <SwitchCamera className="h-5 w-5" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        disabled={disabled}
        className={cn(
          dockBtn,
          prefs.lens === "wide" && "ring-2 ring-cyan-400/80",
        )}
        onClick={() =>
          onLensChange(prefs.lens === "wide" ? "standard" : "wide")
        }
        title={prefs.lens === "wide" ? "Standard lens" : "Wide angle"}
      >
        <span className="text-xs font-bold tabular-nums">
          {prefs.lens === "wide" ? "0.5×" : "1×"}
        </span>
      </Button>
      <span className="sr-only">{facingLabel(prefs.facing)} camera</span>
    </>
  );
}
