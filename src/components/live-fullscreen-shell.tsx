"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

type LiveFullscreenShellProps = {
  stage: ReactNode;
  topOverlay?: ReactNode;
  title?: string;
  subtitle?: string;
  rightDock?: ReactNode;
  bottomBar?: ReactNode;
  bottomPanel?: ReactNode;
  onBack?: () => void;
  className?: string;
};

export function LiveFullscreenShell({
  stage,
  topOverlay,
  title,
  subtitle,
  rightDock,
  bottomBar,
  bottomPanel,
  onBack,
  className,
}: LiveFullscreenShellProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col overflow-hidden bg-black",
        className,
      )}
    >
      <div className="absolute inset-0">{stage}</div>

      <div className="pointer-events-none relative z-10 flex h-full min-h-0 flex-col">
        <header
          className="pointer-events-auto flex items-start gap-2 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]"
        >
          {onBack && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-11 w-11 shrink-0 rounded-full bg-black/45 text-white backdrop-blur-md hover:bg-black/60"
              onClick={onBack}
              aria-label="Back"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          <div className="min-w-0 flex-1 pt-1">
            {title && (
              <p className="truncate text-sm font-semibold text-white drop-shadow-md">
                {title}
              </p>
            )}
            {subtitle && (
              <p className="truncate text-xs text-white/80 drop-shadow-md">
                {subtitle}
              </p>
            )}
          </div>
        </header>

        {topOverlay && (
          <div className="pointer-events-auto shrink-0">{topOverlay}</div>
        )}

        <div className="relative min-h-0 flex-1">
          {rightDock && (
            <div
              className="pointer-events-auto absolute right-0 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-3 pr-[max(0.75rem,env(safe-area-inset-right))]"
            >
              {rightDock}
            </div>
          )}
        </div>

        {bottomPanel && (
          <div
            className="pointer-events-auto max-h-[38vh] shrink-0 overflow-y-auto px-3 pb-2"
          >
            {bottomPanel}
          </div>
        )}

        {bottomBar && (
          <footer
            className="pointer-events-auto shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2"
          >
            {bottomBar}
          </footer>
        )}
      </div>
    </div>
  );
}
