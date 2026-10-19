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

/**
 * Pose grammar v1 (degrees):
 *
 * ```
 * reset
 * joint l_upper_arm flex 165 abduct 12
 * joint l_forearm flex 25
 * ```
 *
 * Lines starting with `#` are comments. `reset` clears all joint angles.
 */
export function parsePoseGrammar(source: string): ParseResult {
  const statements: PoseProgram["statements"] = [];
  const lines = source.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const lineNo = i + 1;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

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
        error: `Expected "joint", "hand", or "reset", got "${parts[0]}"`,
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

export const EXAMPLE_NEUTRAL = `# Neutral 开步 (preset angles applied on reset)
reset
`;

export const EXAMPLE_HANDS_BY_EARS = `# Arms up beside the ears (+abduct = away from body, toward overhead)
reset
joint l_upper_arm abduct 168 flex 8
joint l_forearm flex 18
joint r_upper_arm abduct 168 flex 8
joint r_forearm flex 18
`;

export const EXAMPLE_LEFT_KNEE = `# Left knee lift
reset
joint l_thigh flex 68
joint l_shin flex 95
`;

const ARMS_FORWARD = `reset
joint l_upper_arm flex 58 abduct 16
joint l_forearm flex 30
joint r_upper_arm flex 58 abduct 16
joint r_forearm flex 30
`;

export const EXAMPLE_PALM = `# 掌 — open palm
${ARMS_FORWARD}hand left palm
hand right palm
`;

export const EXAMPLE_FIST = `# 拳 — fist
${ARMS_FORWARD}hand left fist
hand right fist
`;

export const EXAMPLE_SWORD = `# 剑指 — index and middle straight, ring and pinky curled
${ARMS_FORWARD}hand left sword
hand right sword
`;
