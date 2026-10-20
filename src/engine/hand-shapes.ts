import type { JointId } from "./joint-catalog";

type Angles = { flex: number; abduct: number; twist: number };

export type HandSide = "left" | "right";
export type HandShape = "palm" | "fist" | "sword" | "hook";

const DIGITS = ["thumb", "index", "middle", "ring", "pinky"] as const;

type Curl = { flex: number; abduct?: number; twist?: number };

/** +flex curls the digit into the palm. Sword = 剑指 (index + middle straight). */
const SHAPES: Record<HandShape, Record<(typeof DIGITS)[number], { prox: Curl; tip: Curl }>> = {
  palm: {
    thumb: { prox: { flex: 22 }, tip: { flex: 16 } },
    index: { prox: { flex: 0 }, tip: { flex: 0 } },
    middle: { prox: { flex: 0 }, tip: { flex: 0 } },
    ring: { prox: { flex: 0 }, tip: { flex: 0 } },
    pinky: { prox: { flex: 0 }, tip: { flex: 0 } },
  },
  fist: {
    thumb: { prox: { flex: 42 }, tip: { flex: 68 } },
    index: { prox: { flex: 95 }, tip: { flex: 100 } },
    middle: { prox: { flex: 95 }, tip: { flex: 100 } },
    ring: { prox: { flex: 95 }, tip: { flex: 100 } },
    pinky: { prox: { flex: 95 }, tip: { flex: 100 } },
  },
  sword: {
    thumb: { prox: { flex: 58 }, tip: { flex: 22 } },
    index: { prox: { flex: 0 }, tip: { flex: 0 } },
    middle: { prox: { flex: 0 }, tip: { flex: 0 } },
    ring: { prox: { flex: 95 }, tip: { flex: 100 } },
    pinky: { prox: { flex: 95 }, tip: { flex: 100 } },
  },
  hook: {
    thumb: { prox: { flex: 70, abduct: -10 }, tip: { flex: 78 } },
    index: { prox: { flex: 28, abduct: -6 }, tip: { flex: 88 } },
    middle: { prox: { flex: 24 }, tip: { flex: 88 } },
    ring: { prox: { flex: 28, abduct: -4 }, tip: { flex: 90 } },
    pinky: { prox: { flex: 34, abduct: -8 }, tip: { flex: 92 } },
  },
};

export function fingerJoint(side: HandSide, digit: (typeof DIGITS)[number], tip: boolean): JointId {
  const prefix = side === "left" ? "l" : "r";
  return `${prefix}_${digit}${tip ? "_tip" : ""}` as JointId;
}

export function applyHandShape(
  angles: Record<JointId, Angles>,
  side: HandSide,
  shape: HandShape,
): void {
  const pose = SHAPES[shape];
  for (const digit of DIGITS) {
    const prox = angles[fingerJoint(side, digit, false)];
    const tip = angles[fingerJoint(side, digit, true)];
    prox.flex = pose[digit].prox.flex;
    prox.abduct = pose[digit].prox.abduct ?? 0;
    prox.twist = pose[digit].prox.twist ?? 0;
    tip.flex = pose[digit].tip.flex;
    tip.abduct = pose[digit].tip.abduct ?? 0;
    tip.twist = pose[digit].tip.twist ?? 0;
  }
}

const SHAPE_ALIASES: Record<string, HandShape> = {
  palm: "palm",
  zhang: "palm",
  open: "palm",
  fist: "fist",
  quan: "fist",
  punch: "fist",
  sword: "sword",
  jian: "sword",
  jianzhi: "sword",
  swordfinger: "sword",
  "sword-finger": "sword",
  hook: "hook",
  gou: "hook",
  hookhand: "hook",
  "hook-hand": "hook",
};

const SIDE_ALIASES: Record<string, HandSide> = {
  left: "left",
  l: "left",
  right: "right",
  r: "right",
};

export function parseHandShapeToken(token: string): HandShape | null {
  return SHAPE_ALIASES[token.toLowerCase()] ?? null;
}

export function parseHandSideToken(token: string): HandSide | null {
  return SIDE_ALIASES[token.toLowerCase()] ?? null;
}
