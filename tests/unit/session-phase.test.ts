import { describe, expect, it } from "vitest";
import { placeholderCanonical } from "@/lib/wushu/canonical";
import {
  initialLiveSession,
  tickLiveSession,
} from "@/lib/wushu/session-phase";
import { sanDuanChangQuan } from "@/lib/wushu/routines/san-duan-chang-quan";
import type { PoseKeypoint } from "@/lib/pose/types";
function fakeKeypoints(): PoseKeypoint[] {
  return Array.from({ length: 33 }, () => ({ x: 320, y: 240, score: 0.9 }));
}

describe("live session FSM", () => {
  it("starts in ready phase", () => {
    expect(initialLiveSession().phase).toBe("ready");
  });

  it("eventually leaves ready when ticked with pose data", () => {
    const canonical = placeholderCanonical(sanDuanChangQuan, {
      youtubeId: null,
      youtubeUrl: null,
    });
    let state = initialLiveSession();
    const kp = fakeKeypoints();
    for (let i = 0; i < 20; i++) {
      state = tickLiveSession(state, canonical, kp, "unarmed");
    }
    expect(["ready", "performing", "complete"]).toContain(state.phase);
  });
});
