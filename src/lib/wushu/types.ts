export type LegStanceType =
  | "feet_together"
  | "gong_bu"
  | "ma_bu"
  | "xu_bu"
  | "walking"
  | "unknown";

export type HandProfileType =
  | "salute"
  | "fist_waist"
  | "punch_forward"
  | "guard_chest"
  | "jian_point"
  | "jian_guard"
  | "arms_spread"
  | "unknown";

export type WeaponKind = "unarmed" | "jian";

export type RoutineMove = {
  id: string;
  order: number;
  name: string;
  nameZh: string;
  expectedLeg: LegStanceType;
  expectedHand: HandProfileType;
  coachTip: string;
};

export type CanonicalMove = RoutineMove & {
  startSec: number;
  endSec: number;
};

export type CanonicalRoutine = {
  routineId: string;
  calibrated: boolean;
  sourceYouTubeId: string | null;
  sourceYouTubeUrl: string | null;
  sourceLabel: string | null;
  referenceDurationSec: number;
  calibratedAt: string | null;
  moves: CanonicalMove[];
};

export type RoutineDefinition = {
  id: string;
  name: string;
  nameZh: string;
  weapon: WeaponKind;
  description: string;
  moves: RoutineMove[];
};

export type FrameClassification = {
  timeSec: number;
  leg: LegStanceType;
  hand: HandProfileType;
  legScore: number;
  handScore: number;
  legConfidence: number;
  handConfidence: number;
};

export type MoveAlignmentStatus =
  | "correct"
  | "wrong_stance"
  | "wrong_sequence"
  | "missing";

export type MoveReport = {
  move: RoutineMove;
  status: MoveAlignmentStatus;
  matchedTimeSec: number | null;
  legScore: number;
  handScore: number;
  detectedLeg: LegStanceType;
  detectedHand: HandProfileType;
  notes: string;
};

export type RoutineAnalysisReport = {
  routineId: string;
  overallScore: number;
  sequenceScore: number;
  legScore: number;
  handScore: number;
  moves: MoveReport[];
  summary: string;
  missedCount: number;
  wrongOrderCount: number;
};
