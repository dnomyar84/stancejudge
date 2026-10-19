import { hanimModelUrl } from "./asset-url";
import {
  applyCoachPoseToMixamo,
  prepareMixamoAvatar,
  type MixamoAvatar,
} from "./apply-coach-to-mixamo";
import type { ExtendedCoachPose } from "../coach-figure/extended-pose";
import type * as THREE from "three";

export async function loadMixamoAvatar(
  THREE: typeof import("three"),
): Promise<MixamoAvatar> {
  const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
  const loader = new GLTFLoader();
  const url = hanimModelUrl();
  const gltf = await loader.loadAsync(url);
  const scene = gltf.scene;
  scene.rotation.y = Math.PI;
  return prepareMixamoAvatar(THREE, scene);
}

export function retargetCoachPose(
  THREE: typeof import("three"),
  avatar: MixamoAvatar,
  pose: ExtendedCoachPose | null,
): void {
  if (!pose) return;
  applyCoachPoseToMixamo(THREE, avatar, pose);
}
