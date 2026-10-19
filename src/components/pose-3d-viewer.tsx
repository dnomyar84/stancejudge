"use client";

import { useEffect, useRef } from "react";
import type { ExtendedCoachPose } from "@/lib/pose/coach-figure/extended-pose";
import {
  coachMeshFromExtendedPose,
  type CoachMeshSpec,
} from "@/lib/pose/coach-figure/mesh-from-skeleton";

type Pose3DViewerProps = {
  pose: ExtendedCoachPose | null;
  className?: string;
};

type RebuildFn = (mesh: CoachMeshSpec) => void;

export function Pose3DViewer({ pose, className }: Pose3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const poseRef = useRef(pose);
  const rebuildRef = useRef<RebuildFn | null>(null);

  poseRef.current = pose;

  useEffect(() => {
    if (pose && rebuildRef.current) {
      rebuildRef.current(coachMeshFromExtendedPose(pose));
    }
  }, [pose]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let renderer: import("three").WebGLRenderer | null = null;
    let frameId = 0;

    void (async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import(
        "three/examples/jsm/controls/OrbitControls.js"
      );

      if (disposed) return;

      const width = mount.clientWidth || 400;
      const height = mount.clientHeight || 360;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a1218);

      const camera = new THREE.PerspectiveCamera(42, width / height, 0.05, 20);
      camera.position.set(0.9, 0.55, 1.35);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      mount.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0.35, 0);
      controls.enableDamping = true;
      controls.update();

      scene.add(new THREE.HemisphereLight(0xb8e8ff, 0x223344, 1.1));
      const key = new THREE.DirectionalLight(0xffffff, 1.2);
      key.position.set(2, 3, 2);
      scene.add(key);

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 3),
        new THREE.MeshStandardMaterial({ color: 0x14202a, roughness: 0.9 }),
      );
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      const grid = new THREE.GridHelper(3, 16, 0x2a4a5a, 0x1a2a34);
      grid.position.y = 0.001;
      scene.add(grid);

      scene.add(
        new THREE.ArrowHelper(
          new THREE.Vector3(0, 0, 1),
          new THREE.Vector3(0, 0.01, 0),
          0.35,
          0x22d3ee,
        ),
      );

      const figureGroup = new THREE.Group();
      scene.add(figureGroup);

      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x5eead4,
        roughness: 0.55,
        metalness: 0.08,
      });
      const torsoMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.5,
        metalness: 0.1,
      });
      const headMat = new THREE.MeshStandardMaterial({
        color: 0xfde68a,
        roughness: 0.4,
      });
      const handMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        roughness: 0.45,
      });
      const footMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.65,
      });

      function clearFigure() {
        while (figureGroup.children.length) {
          const child = figureGroup.children[0];
          figureGroup.remove(child);
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            const m = child.material;
            if (Array.isArray(m)) m.forEach((mat) => mat.dispose());
            else m.dispose();
          }
        }
      }

      function addTube(
        from: { x: number; y: number; z: number },
        to: { x: number; y: number; z: number },
        radius: number,
        mat: import("three").MeshStandardMaterial,
      ) {
        const a = new THREE.Vector3(from.x, from.y, from.z);
        const b = new THREE.Vector3(to.x, to.y, to.z);
        const dir = new THREE.Vector3().subVectors(b, a);
        const len = dir.length();
        if (len < 1e-4) return;
        const cyl = new THREE.Mesh(
          new THREE.CylinderGeometry(radius, radius, len, 10),
          mat,
        );
        cyl.position.copy(a).add(b).multiplyScalar(0.5);
        cyl.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.normalize(),
        );
        figureGroup.add(cyl);
      }

      function rebuildFigure(mesh: CoachMeshSpec) {
        clearFigure();

        for (const bone of mesh.bones) {
          addTube(bone.from, bone.to, bone.radius, bodyMat);
        }

        addTube(mesh.neckFrom, mesh.neckTo, mesh.neckRadius, bodyMat);

        const head = new THREE.Mesh(
          new THREE.SphereGeometry(mesh.headRadius, 20, 16),
          headMat,
        );
        head.position.set(
          mesh.headCenter.x,
          mesh.headCenter.y,
          mesh.headCenter.z,
        );
        figureGroup.add(head);

        const [c0, c1, c2, c3] = mesh.torsoCorners;
        const torsoGeo = new THREE.BufferGeometry();
        torsoGeo.setAttribute(
          "position",
          new THREE.BufferAttribute(
            new Float32Array([
              c0.x, c0.y, c0.z,
              c1.x, c1.y, c1.z,
              c2.x, c2.y, c2.z,
              c0.x, c0.y, c0.z,
              c2.x, c2.y, c2.z,
              c3.x, c3.y, c3.z,
            ]),
            3,
          ),
        );
        torsoGeo.computeVertexNormals();
        figureGroup.add(new THREE.Mesh(torsoGeo, torsoMat));

        for (const hand of [mesh.leftHand, mesh.rightHand]) {
          addTube(hand.wrist, hand.knuckle, hand.radius, handMat);
          const palm = new THREE.Mesh(
            new THREE.SphereGeometry(hand.radius * 1.1, 10, 8),
            handMat,
          );
          palm.position.set(hand.palm.x, hand.palm.y, hand.palm.z);
          figureGroup.add(palm);
        }

        for (const foot of [mesh.leftFoot, mesh.rightFoot]) {
          const soleGeo = new THREE.BufferGeometry();
          const h = foot.heel;
          const t = foot.toe;
          const a = foot.ankle;
          const lat = (t.x - h.x) * 0.15;
          soleGeo.setAttribute(
            "position",
            new THREE.BufferAttribute(
              new Float32Array([
                h.x, h.y + 0.01, h.z,
                t.x, t.y + 0.01, t.z,
                a.x + lat, a.y + 0.015, a.z,
                h.x, h.y + 0.01, h.z,
                a.x - lat, a.y + 0.015, a.z,
                t.x, t.y + 0.01, t.z,
              ]),
              3,
            ),
          );
          soleGeo.computeVertexNormals();
          figureGroup.add(new THREE.Mesh(soleGeo, footMat));
        }
      }

      rebuildRef.current = rebuildFigure;
      const initial = poseRef.current;
      if (initial) rebuildFigure(coachMeshFromExtendedPose(initial));

      const onResize = () => {
        if (!mount || !renderer) return;
        const w = mount.clientWidth || 400;
        const h = mount.clientHeight || 360;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      const animate = () => {
        if (disposed) return;
        controls.update();
        renderer?.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      };
      animate();

      return () => window.removeEventListener("resize", onResize);
    })();

    return () => {
      disposed = true;
      rebuildRef.current = null;
      cancelAnimationFrame(frameId);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement.parentElement === mount) {
          mount.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={className}
      role="img"
      aria-label="3D coach pose preview"
    />
  );
}
