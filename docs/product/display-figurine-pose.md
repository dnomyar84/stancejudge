# Display figurine pose (how storage maps to the mesh)

## Analogy

| Mermaid | Visual coach |
| --- | --- |
| `.mmd` source | `CoachFigurinePoseV1` on each keyframe |
| Parser + layout | `applyCoachFigurinePoseToMannequin` |
| SVG output | mannequin-js mesh pose |

Ambiguity appears when you store “diagram intent” in one language and render through a second guessy compiler. We split **semantic** vs **display** layers.

## Two layers on every keyframe

```ts
type RigKeyframe = {
  pose: ExtendedCoachPose;      // joints in coach space — scoring, cues, 2D projection
  figurine?: CoachFigurinePoseV1; // mannequin angles — what you see in 3D
};
```

- **`pose`** — 13 joint positions (`lat`, `fwd`, `up`) plus hand/feet end effectors.
- **`figurine`** — explicit degrees on the default driver `mannequin-male-1.75`.

If `figurine` is present, the 3D viewer **only** applies those numbers.

## Schema sketch

```json
{
  "schema": "coach-figurine-pose/v1",
  "driver": "mannequin-male-1.75",
  "root": { "x": 0, "y": 0, "z": 0 },
  "body": { "tilt": 0, "turn": -90, "bend": 0 },
  "torso": { "tilt": 0, "turn": 0, "bend": 3 },
  "head": { "tilt": 0, "turn": 0, "nod": 0 },
  "leftLeg": { "straddle": 12, "turn": 0, "raise": 5 },
  "leftKnee": { "bend": 8 },
  ...
}
```

Code: `src/lib/pose/display-figurine/`.

## Authoring workflow (target)

1. Block out semantics with `pose` (stance helpers, vocabulary).
2. Open Pose 3D Lab, tune the figurine visually.
3. Capture / paste `figurine` onto the keyframe (freeze display).
4. CI: figurine JSON is the golden file for “does the coach look right?”

While migrating, `rigKeyframe({ pose })` auto-fills `figurine` via legacy compile — treat that as **draft**, not signed-off.

## Playback

`sampleMoveChoreography` returns `{ pose, figurine }`. Transitions lerp **figurine** DOFs, not skeleton XYZ, when both sides have stored figurines.

## Related

- [ADR-004](../decisions/adr-004-display-figurine-pose.md)
- [ADR-003](../decisions/adr-003-3d-canonical-pose-model.md) — semantic 3D
- [motion-coach-platform.md](./motion-coach-platform.md)
