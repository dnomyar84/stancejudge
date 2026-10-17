import { describe, expect, it } from "vitest";
import {
  classifyVideoDeviceLabel,
  pickVideoDeviceId,
} from "@/lib/camera/devices";

describe("classifyVideoDeviceLabel", () => {
  it("detects iOS-style rear ultra wide", () => {
    const c = classifyVideoDeviceLabel("Back Ultra Wide Camera");
    expect(c.facing).toBe("environment");
    expect(c.lens).toBe("ultra");
  });

  it("detects front camera", () => {
    const c = classifyVideoDeviceLabel("FaceTime HD Camera");
    expect(c.facing).toBe("user");
    expect(c.lens).toBe("standard");
  });
});

describe("pickVideoDeviceId", () => {
  const devices = [
    {
      deviceId: "a",
      kind: "videoinput",
      label: "Back Camera",
      groupId: "g1",
      toJSON: () => ({}),
    },
    {
      deviceId: "b",
      kind: "videoinput",
      label: "Back Ultra Wide Camera",
      groupId: "g1",
      toJSON: () => ({}),
    },
    {
      deviceId: "c",
      kind: "videoinput",
      label: "Front Camera",
      groupId: "g2",
      toJSON: () => ({}),
    },
  ] as MediaDeviceInfo[];

  it("picks ultra wide for rear + wide preference", () => {
    const id = pickVideoDeviceId(devices, {
      facing: "environment",
      lens: "wide",
    });
    expect(id).toBe("b");
  });

  it("picks standard rear for rear + standard", () => {
    const id = pickVideoDeviceId(devices, {
      facing: "environment",
      lens: "standard",
    });
    expect(id).toBe("a");
  });

  it("picks front for user facing", () => {
    const id = pickVideoDeviceId(devices, {
      facing: "user",
      lens: "standard",
    });
    expect(id).toBe("c");
  });

  it("never picks front when rear is requested", () => {
    const id = pickVideoDeviceId(devices, {
      facing: "environment",
      lens: "standard",
    });
    expect(id).not.toBe("c");
  });
});
