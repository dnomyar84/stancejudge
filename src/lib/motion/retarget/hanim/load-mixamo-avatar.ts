import { hanimModelUrl } from "./asset-url";
import {
  applyBindPose,
  applyCoachPoseToMixamo,
  prepareMixamoAvatar,
  type MixamoAvatar,
} from "./apply-coach-to-mixamo";
import type { ExtendedCoachPose } from "@/lib/pose/coach-figure/extended-pose";
import type * as THREE from "three";

export async function loadMixamoAvatar(
  THREE: typeof import("three"),
): Promise<MixamoAvatar> {
  const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
  const loader = new GLTFLoader();
  const url = hanimModelUrl();
  let gltf;
  try {
    gltf = await loader.loadAsync(url);
  } catch (err) {
    const hint =
      err instanceof Error ? err.message : "GLTF load failed";
    throw new Error(`${hint} (model: ${url})`);
  }
  const scene = gltf.scene;
  return prepareMixamoAvatar(THREE, scene);
}

export function retargetCoachPose(
  THREE: typeof import("three"),
  avatar: MixamoAvatar,
  pose: ExtendedCoachPose | null,
): void {
  if (!pose) return;
  try {
    applyCoachPoseToMixamo(THREE, avatar, pose);
  } catch (err) {
    console.error("retargetCoachPose:", err);
    applyBindPose(THREE, avatar);
  }
}
