/**
 * Headless WebGL check: load Xbot, scale, render bind pose, sample pixels.
 */
import { chromium } from "playwright";
import { readFileSync } from "fs";
import { join } from "path";

const glb = readFileSync(join(process.cwd(), "public/models/xbot.glb"));
const b64 = glb.toString("base64");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const result = await page.evaluate(async (dataUrl) => {
  const THREE = await import(
    "https://unpkg.com/three@0.170.0/build/three.module.js"
  );
  const { GLTFLoader } = await import(
    "https://unpkg.com/three@0.170.0/examples/jsm/loaders/GLTFLoader.js"
  );

  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  document.body.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1218);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.set(0, 1, 3);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));
  scene.add(new THREE.DirectionalLight(0xffffff, 2));

  const floor = new THREE.GridHelper(4, 20, 0x4488aa, 0x223344);
  scene.add(floor);

  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(dataUrl);
  const root = gltf.scene;
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const h = size.y;
  const scale = h > 1e-6 ? 1.75 / h : 1;
  root.scale.setScalar(scale);
  root.rotation.y = Math.PI;
  root.updateMatrixWorld(true);
  scene.add(root);

  const box2 = new THREE.Box3().setFromObject(root);
  const center = box2.getCenter(new THREE.Vector3());
  camera.lookAt(center);
  camera.position.set(center.x, center.y + 0.2, center.z + 2.5);

  renderer.render(scene, camera);

  const gl = renderer.getContext();
  const buf = new Uint8Array(4);
  gl.readPixels(200, 200, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
  return {
    bindHeight: h,
    scale,
    boxMax: [box2.max.x, box2.max.y, box2.max.z],
    center: [center.x, center.y, center.z],
    rgba: [...buf],
  };
}, `data:model/gltf-binary;base64,${b64}`);

console.log(result);
await browser.close();
process.exit(result.rgba[0] + result.rgba[1] + result.rgba[2] > 30 ? 0 : 1);
