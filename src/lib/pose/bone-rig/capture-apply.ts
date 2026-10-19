import type { MixamoAvatar } from "@/lib/motion/retarget/hanim/apply-coach-to-mixamo";
import type * as THREE from "three";
import type { BoneEulerDeg, CoachBonePoseV1 } from "./schema";
import {
  COACH_BONE_DRIVER_MIXAMO_XBOT,
  COACH_BONE_POSE_SCHEMA,
} from "./schema";

const DEG = 180 / Math.PI;

function captureEuler(bone: THREE.Bone): BoneEulerDeg {
  return {
    x: bone.rotation.x * DEG,
    y: bone.rotation.y * DEG,
    z: bone.rotation.z * DEG,
    order: "XYZ",
  };
}

/** Snapshot every bone on the skinned rig — replay is deterministic. */
export function captureCoachBonePose(avatar: MixamoAvatar): CoachBonePoseV1 {
  avatar.root.updateMatrixWorld(true);
  const rotations: Record<string, BoneEulerDeg> = {};
  for (const bone of avatar.mesh.skeleton.bones) {
    rotations[bone.name] = captureEuler(bone);
  }
  return {
    schema: COACH_BONE_POSE_SCHEMA,
    driver: COACH_BONE_DRIVER_MIXAMO_XBOT,
    root: {
      x: avatar.root.position.x,
      y: avatar.root.position.y,
      z: avatar.root.position.z,
    },
    rotations,
  };
}

export function applyCoachBonePose(
  avatar: MixamoAvatar,
  pose: CoachBonePoseV1,
): void {
  avatar.root.position.set(pose.root.x, pose.root.y, pose.root.z);
  for (const bone of avatar.mesh.skeleton.bones) {
    const r = pose.rotations[bone.name];
    if (!r) continue;
    bone.rotation.order = r.order;
    bone.rotation.set(r.x / DEG, r.y / DEG, r.z / DEG);
  }
  avatar.mesh.skeleton.update();
  avatar.root.updateMatrixWorld(true);
}
