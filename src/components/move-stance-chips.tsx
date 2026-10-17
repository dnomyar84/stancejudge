"use client";

import { Badge } from "@/components/ui/badge";
import { handLabel, legLabel } from "@/lib/wushu/stance-labels";
import type { HandProfileType, LegStanceType } from "@/lib/wushu/types";
import { cn } from "@/lib/utils";

type MoveStanceChipsProps = {
  expectedLeg: LegStanceType;
  expectedHand: HandProfileType;
  detectedLeg?: LegStanceType;
  detectedHand?: HandProfileType;
  compact?: boolean;
  className?: string;
};

function chipClass(match: boolean | "expected-only"): string {
  if (match === "expected-only") {
    return "border-cyan-500/40 bg-cyan-950/40 text-cyan-100";
  }
  if (match) {
    return "border-emerald-500/50 bg-emerald-950/50 text-emerald-100";
  }
  return "border-amber-500/45 bg-amber-950/40 text-amber-100";
}

export function MoveStanceChips({
  expectedLeg,
  expectedHand,
  detectedLeg,
  detectedHand,
  compact,
  className,
}: MoveStanceChipsProps) {
  const showDetected =
    detectedLeg !== undefined && detectedHand !== undefined;
  const legMatch = !showDetected || detectedLeg === expectedLeg;
  const handMatch = !showDetected || detectedHand === expectedHand;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      <Badge
        variant="outline"
        className={cn(
          "text-[10px] font-normal sm:text-xs",
          chipClass(showDetected ? legMatch : "expected-only"),
        )}
      >
        {compact ? "腿" : "Leg"} · {legLabel(expectedLeg)}
        {showDetected && !legMatch && (
          <span className="ml-1 opacity-80">→ {legLabel(detectedLeg)}</span>
        )}
      </Badge>
      <Badge
        variant="outline"
        className={cn(
          "text-[10px] font-normal sm:text-xs",
          chipClass(showDetected ? handMatch : "expected-only"),
        )}
      >
        {compact ? "手" : "Hand"} · {handLabel(expectedHand)}
        {showDetected && !handMatch && (
          <span className="ml-1 opacity-80">→ {handLabel(detectedHand)}</span>
        )}
      </Badge>
    </div>
  );
}
