/**
 * Stub for mannequin-js scene.js — avoids fullscreen canvas side effects in Next.js.
 * @see node_modules/mannequin-js (GPL-3.0)
 */
import * as THREE from "three";

const sink = new THREE.Group();

export const scene = sink;
export const renderer = null as unknown as THREE.WebGLRenderer;
export const camera = null as unknown as THREE.PerspectiveCamera;
export const light = null as unknown as THREE.DirectionalLight;
export const controls = null;
export const clock = { getElapsedTime: () => 0 };

export function createStage(): void {}
export function getStage() {
  return { scene: sink, renderer, camera, light, animationLoop: null };
}
export function systemAnimate(): void {}
