#!/usr/bin/env node
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  applyBindPose,
  applyCoachPoseToMixamo,
  prepareMixamoAvatar,
} from "../src/lib/motion/retarget/hanim/apply-coach-to-mixamo.ts";

const loader = new GLTFLoader();
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const gltf = await loader.loadAsync(
  pathToFileURL(join(process.cwd(), "public/models/xbot.glb")).href,
);
const avatar = prepareMixamoAvatar(THREE, gltf.scene);

function boxInfo() {
  avatar.root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(avatar.root);
  const size = box.getSize(new THREE.Vector3());
  return { min: box.min.toArray(), max: box.max.toArray(), size: size.toArray() };
}

applyBindPose(THREE, avatar);
console.log("bind", boxInfo());
console.log("sceneScale", avatar.sceneScale);
