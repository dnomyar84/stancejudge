"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type LiveRecordButtonProps = {
  active: boolean;
  loading?: boolean;
  onClick: () => void;
  label?: string;
};

export function LiveRecordButton({
  active,
  loading,
  onClick,
  label = "Start",
}: LiveRecordButtonProps) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="flex flex-col items-center gap-2"
      aria-label={active ? "Stop" : label}
    >
      <span
        className={cn(
          "flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full border-[4px] border-white/90 bg-transparent p-1 shadow-lg transition-transform active:scale-95",
          active && "border-red-400",
        )}
      >
        <span
          className={cn(
            "flex h-full w-full items-center justify-center rounded-full bg-red-500 transition-all",
            active && "m-2 h-8 w-8 rounded-md bg-red-500",
            loading && "bg-red-500/60",
          )}
        >
          {loading && (
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          )}
        </span>
      </span>
      <span className="text-xs font-medium text-white/90 drop-shadow-md">
        {loading ? "Loading…" : active ? "Finish" : label}
      </span>
    </button>
  );
}
