"use client";

import { Button } from "@/components/ui/button";
import { facingLabel } from "@/lib/camera/prefs";
import type { CameraLensProfile, CameraPrefs } from "@/lib/camera/types";
import { SwitchCamera } from "lucide-react";

type CameraSettingsBarProps = {
  prefs: CameraPrefs;
  onFlipFacing: () => void;
  onLensChange: (lens: CameraLensProfile) => void;
  disabled?: boolean;
  className?: string;
};

export function CameraSettingsBar({
  prefs,
  onFlipFacing,
  onLensChange,
  disabled,
  className,
}: CameraSettingsBarProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}
      role="group"
      aria-label="Camera settings"
    >
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled}
        className="gap-2"
        onClick={() => onFlipFacing()}
      >
        <SwitchCamera className="h-4 w-4" />
        {facingLabel(prefs.facing)}
      </Button>
      <div className="flex rounded-lg border border-border/80 p-0.5">
        {(
          [
            { id: "standard" as const, label: "Standard" },
            { id: "wide" as const, label: "Wide angle" },
          ] as const
        ).map(({ id, label }) => (
          <Button
            key={id}
            type="button"
            size="sm"
            variant={prefs.lens === id ? "default" : "ghost"}
            disabled={disabled}
            className="h-8 min-w-[5.75rem] px-3 text-xs"
            onClick={() => onLensChange(id)}
          >
            {label}
          </Button>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {prefs.facing === "environment" && prefs.lens === "wide"
          ? "Wide uses the ultra-wide rear lens when available; preview fills the frame."
          : prefs.facing === "user"
            ? "Front camera is mirrored like a selfie."
            : "Rear camera is not mirrored."}
      </span>
    </div>
  );
}
