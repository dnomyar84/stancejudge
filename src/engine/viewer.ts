import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { WoodenDummy } from "./wooden-dummy";
import { groundDummy } from "./wooden-dummy";

export type DummyViewer = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  mount: (el: HTMLElement) => void;
  setDummy: (dummy: WoodenDummy) => void;
  resize: () => void;
  dispose: () => void;
};

export function createDummyViewer(): DummyViewer {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1218);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 40);
  camera.position.set(0.35, 1.15, 2.8);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.95, 0);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 1.2;
  controls.maxDistance = 5;

  scene.add(new THREE.HemisphereLight(0xb8e8ff, 0x223344, 1.05));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(2.5, 4, 2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);
  scene.add(new THREE.AmbientLight(0x8899aa, 0.35));

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.MeshStandardMaterial({ color: 0x1a3040, roughness: 0.92 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(8, 32, 0x3a6a7a, 0x243848);
  grid.position.y = 0.002;
  scene.add(grid);

  let mountEl: HTMLElement | null = null;
  let dummyRef: WoodenDummy | null = null;
  let boneLines: THREE.SkeletonHelper | null = null;
  let frameId = 0;

  const animate = () => {
    frameId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  const resize = () => {
    if (!mountEl) return;
    const w = mountEl.clientWidth;
    const h = mountEl.clientHeight;
    if (w < 1 || h < 1) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };

  return {
    scene,
    camera,
    renderer,
    controls,
    mount(el) {
      mountEl = el;
      el.appendChild(renderer.domElement);
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      resize();
      animate();
      const ro = new ResizeObserver(() => resize());
      ro.observe(el);
    },
    setDummy(dummy) {
      if (boneLines) {
        scene.remove(boneLines);
        boneLines.dispose();
      }
      if (dummyRef) scene.remove(dummyRef.root);
      dummyRef = dummy;
      groundDummy(dummy);
      scene.add(dummy.root);
      boneLines = new THREE.SkeletonHelper(dummy.root);
      boneLines.frustumCulled = false;
      scene.add(boneLines);
      const center = new THREE.Vector3();
      dummy.bones.hips.getWorldPosition(center);
      controls.target.copy(center);
      controls.update();
    },
    resize,
    dispose() {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (mountEl?.contains(renderer.domElement)) {
        mountEl.removeChild(renderer.domElement);
      }
    },
  };
}
