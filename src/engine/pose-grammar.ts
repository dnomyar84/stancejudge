import { parseHandShapeToken, parseHandSideToken, type HandShape, type HandSide } from "./hand-shapes";
import { isJointId, type AxisName, type JointId } from "./joint-catalog";

export type PoseResetStmt = { kind: "reset" };

export type JointPoseStmt = {
  kind: "joint";
  joint: JointId;
  flex?: number;
  abduct?: number;
  twist?: number;
};

export type HandShapeStmt = {
  kind: "hand";
  side: HandSide;
  shape: HandShape;
};

export type PoseProgram = {
  statements: Array<PoseResetStmt | JointPoseStmt | HandShapeStmt>;
};

const AXIS_ALIASES: Record<string, AxisName> = {
  flex: "flex",
  bend: "flex",
  raise: "flex",
  abduct: "abduct",
  straddle: "abduct",
  spread: "abduct",
  twist: "twist",
  turn: "twist",
};

export type ParseResult =
  | { ok: true; program: PoseProgram }
  | { ok: false; error: string; line?: number };

function parseNumber(token: string): number | null {
  const n = Number(token);
  return Number.isFinite(n) ? n : null;
}

type PoseStmt = PoseResetStmt | JointPoseStmt | HandShapeStmt;

function jointAt(joint: JointId, flex?: number, abduct?: number, twist?: number): JointPoseStmt {
  const stmt: JointPoseStmt = { kind: "joint", joint };
  if (flex !== undefined) stmt.flex = flex;
  if (abduct !== undefined) stmt.abduct = abduct;
  if (twist !== undefined) stmt.twist = twist;
  return stmt;
}

function armsForward(): JointPoseStmt[] {
  return [
    jointAt("l_upper_arm", 58, 16),
    jointAt("l_forearm", 30),
    jointAt("r_upper_arm", 58, 16),
    jointAt("r_forearm", 30),
  ];
}

function handsByEars(): JointPoseStmt[] {
  return [
    jointAt("l_upper_arm", 8, 168),
    jointAt("l_forearm", 18),
    jointAt("r_upper_arm", 8, 168),
    jointAt("r_forearm", 18),
  ];
}

function kneeLift(side: "l" | "r"): JointPoseStmt[] {
  return [jointAt(`${side}_thigh`, 68), jointAt(`${side}_shin`, 95)];
}

/** 弓步冲拳. `front` is the bent lead leg. The other arm chambers at the hip. */
function gongBuPunch(front: "left" | "right", punch: "left" | "right"): PoseStmt[] {
  const lead = front === "left" ? "l" : "r";
  const rear = front === "left" ? "r" : "l";
  const punchSide = punch === "left" ? "l" : "r";
  const chamber = punch === "left" ? "r" : "l";
  return [
    jointAt("hips", 15),
    jointAt("spine", -12),
    jointAt("chest", -6),
    jointAt(`${rear}_thigh`, -20, 12, 16),
    jointAt(`${rear}_shin`, 0),
    jointAt(`${rear}_foot`, 36, 0, 6),
    jointAt(`${lead}_thigh`, 64, 6, 0),
    jointAt(`${lead}_shin`, 74),
    jointAt(`${lead}_foot`, 18),
    jointAt(`${punchSide}_upper_arm`, 80, -4, -80),
    jointAt(`${punchSide}_forearm`, 10, 0, -85),
    jointAt(`${chamber}_upper_arm`, -10, 0, 0),
    jointAt(`${chamber}_forearm`, 95),
    { kind: "hand", side: punch, shape: "fist" },
    { kind: "hand", side: punch === "left" ? "right" : "left", shape: "fist" },
  ];
}

function normalizePhrase(line: string): string {
  return line
    .toLowerCase()
    .replace(/[.,!?;:]/g, " ")
    .replace(/\b(the|a|an|please|to)\b/g, " ")
    .replace(/\bpalms\b/g, "palm")
    .replace(/\bfists\b/g, "fist")
    .replace(/\bsword fingers\b/g, "sword")
    .replace(/\bsword finger\b/g, "sword")
    .replace(/\bopen palm\b/g, "palm")
    .replace(/\s+/g, " ")
    .trim();
}

const SHAPE_WORD = "(palm|zhang|fist|quan|sword|jianzhi)";

function shapeFromWord(word: string): HandShape | null {
  return parseHandShapeToken(word);
}

function sidesOf(word: string): HandSide[] | null {
  if (word === "both") return ["left", "right"];
  const side = parseHandSideToken(word);
  return side ? [side] : null;
}

/**
 * Plain phrases compile to the same joint / hand statements.
 * Returns null when the line is not a phrase (try the joint syntax).
 */
function compilePhrase(line: string): { statements: PoseStmt[] } | { error: string } | null {
  let text = normalizePhrase(line);
  if (/^open (left|right|both)\b/.test(text)) text = text.replace(/^open /, "");

  if (/^(stand|neutral|open stance|stand open|reset)$/.test(text)) {
    return { statements: [{ kind: "reset" }] };
  }
  if (/^(hands by ears|arms up|arms overhead|raise both arms|raise arms)$/.test(text)) {
    return { statements: handsByEars() };
  }
  if (/^(arms forward|bring arms forward)$/.test(text)) {
    return { statements: armsForward() };
  }

  let match = text.match(/^(raise|lift) (left|right|both) knees?$/);
  if (match) {
    const sides = match[2] === "both" ? (["l", "r"] as const) : match[2] === "left" ? (["l"] as const) : (["r"] as const);
    return { statements: sides.flatMap((side) => kneeLift(side)) };
  }

  match = text.match(/^(bend|flex) (left|right) elbow(?: (-?\d+(?:\.\d+)?))?$/);
  if (match) {
    const prefix = match[2] === "left" ? "l" : "r";
    const deg = match[3] ? Number(match[3]) : 40;
    return { statements: [jointAt(`${prefix}_forearm`, deg)] };
  }

  match = text.match(
    /^(left|right) (?:gong ?bu|bow stance|bow)(?: (left|right))?(?: arm)? punch$/,
  );
  if (match) {
    const front = match[1] as "left" | "right";
    const punch = (match[2] as "left" | "right" | undefined) ?? (front === "right" ? "left" : "right");
    return { statements: gongBuPunch(front, punch) };
  }

  match = text.match(/^(raise|lift) (left|right) arm(?: (-?\d+(?:\.\d+)?))?$/);
  if (match) {
    const prefix = match[2] === "left" ? "l" : "r";
    const deg = match[3] ? Number(match[3]) : 70;
    return { statements: [jointAt(`${prefix}_upper_arm`, deg, 16)] };
  }

  match = text.match(new RegExp(`^(left|right|both)(?: hand| hands)? ${SHAPE_WORD}$`));
  if (!match) match = text.match(new RegExp(`^${SHAPE_WORD}(?: (left|right|both))?$`));
  if (match) {
    const leadingShape = parseHandShapeToken(match[1]);
    const shapeWord = leadingShape ? match[1] : match[2];
    const sideWord = leadingShape ? (match[2] ?? "both") : match[1];
    const shape = shapeFromWord(shapeWord);
    const sides = sidesOf(sideWord);
    if (!shape || !sides) return { error: `Unknown hand phrase "${line.trim()}"` };
    return {
      statements: sides.map((side) => ({ kind: "hand", side, shape })),
    };
  }

  if (/^(stand|neutral|raise|lift|bend|flex|arms|hands|bring|left|right|both|palm|fist|sword|make|open)\b/.test(text)) {
    return {
      error:
        'Try "stand", "raise left knee", "right gong bu left punch", "hands by the ears", "both palms", or "sword fingers"',
    };
  }
  return null;
}

/**
 * Pose lines. Phrases ("raise left knee", "both palms") or joint degrees.
 * Lines starting with `#` are comments. `stand` / `reset` clears angles.
 */
export function parsePoseGrammar(source: string): ParseResult {
  const statements: PoseProgram["statements"] = [];
  const lines = source.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const lineNo = i + 1;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const phrase = compilePhrase(trimmed);
    if (phrase && "error" in phrase) {
      return { ok: false, error: phrase.error, line: lineNo };
    }
    if (phrase) {
      statements.push(...phrase.statements);
      continue;
    }

    const parts = trimmed.split(/\s+/);
    const head = parts[0].toLowerCase();

    if (head === "reset") {
      if (parts.length > 1) {
        return { ok: false, error: `reset takes no arguments`, line: lineNo };
      }
      statements.push({ kind: "reset" });
      continue;
    }

    if (head === "hand") {
      const side = parts[1] ? parseHandSideToken(parts[1]) : null;
      const shape = parts[2] ? parseHandShapeToken(parts[2]) : null;
      if (!side || !shape || parts.length !== 3) {
        return {
          ok: false,
          error: 'Use "hand left|right palm|fist|sword" (aliases: zhang, quan, jianzhi)',
          line: lineNo,
        };
      }
      statements.push({ kind: "hand", side, shape });
      continue;
    }

    if (head !== "joint") {
      return {
        ok: false,
        error: `Unrecognized line "${trimmed}". Try "raise left knee" or "both palms", or a joint line.`,
        line: lineNo,
      };
    }

    if (parts.length < 2) {
      return { ok: false, error: "joint requires a name", line: lineNo };
    }

    const jointName = parts[1].toLowerCase();
    if (!isJointId(jointName)) {
      return { ok: false, error: `Unknown joint "${parts[1]}"`, line: lineNo };
    }

    const stmt: JointPoseStmt = { kind: "joint", joint: jointName };
    let p = 2;
    while (p < parts.length) {
      const axisKey = parts[p].toLowerCase();
      const axis = AXIS_ALIASES[axisKey];
      if (!axis) {
        return {
          ok: false,
          error: `Unknown axis "${parts[p]}" (use flex/bend/raise, abduct/straddle, twist/turn)`,
          line: lineNo,
        };
      }
      p++;
      if (p >= parts.length) {
        return { ok: false, error: `Missing degrees after ${axisKey}`, line: lineNo };
      }
      const deg = parseNumber(parts[p]);
      if (deg === null) {
        return {
          ok: false,
          error: `Expected number (degrees), got "${parts[p]}"`,
          line: lineNo,
        };
      }
      stmt[axis] = deg;
      p++;
    }

    if (stmt.flex === undefined && stmt.abduct === undefined && stmt.twist === undefined) {
      return { ok: false, error: "joint line needs at least one axis angle", line: lineNo };
    }

    statements.push(stmt);
  }

  return { ok: true, program: { statements } };
}

export const EXAMPLE_NEUTRAL = `# Neutral 开步
stand
`;

export const EXAMPLE_HANDS_BY_EARS = `# Arms up beside the ears
stand
hands by the ears
`;

export const EXAMPLE_LEFT_KNEE = `# Left knee lift
stand
raise left knee
`;

export const EXAMPLE_PALM = `# 掌 — open palm
stand
arms forward
both palms
`;

export const EXAMPLE_FIST = `# 拳 — fist
stand
arms forward
both fists
`;

export const EXAMPLE_SWORD = `# 剑指 — index and middle straight
stand
arms forward
sword fingers
`;

export const EXAMPLE_GONGBU = `# 右弓步左冲拳
stand
right gong bu left punch
`;
