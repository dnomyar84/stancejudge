#!/usr/bin/env node
/**
 * mannequin-js scene.js mounts a fixed fullscreen canvas on import.
 * Replace it with a no-op stub before dev (Turbopack) or production builds.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const target = join(root, "node_modules/mannequin-js/src/scene.js");
const marker = "/* stancejudge-scene-stub */";

const stub = `${marker}
import * as THREE from "three";

const sink = new THREE.Group();

export const scene = sink;
export const renderer = null;
export const camera = null;
export const light = null;
export const controls = null;
export const clock = { getElapsedTime: () => 0 };

export function createStage() {}
export function getStage() {
  return { scene: sink, renderer, camera, light, animationLoop: null };
}
export function systemAnimate() {}
`;

if (!existsSync(target)) {
  console.warn("patch-mannequin-scene: mannequin-js not installed, skipping");
  process.exit(0);
}

const current = readFileSync(target, "utf8");
if (current.startsWith(marker)) {
  process.exit(0);
}

writeFileSync(target, stub, "utf8");
console.log("patch-mannequin-scene: replaced mannequin-js/src/scene.js with stub");
