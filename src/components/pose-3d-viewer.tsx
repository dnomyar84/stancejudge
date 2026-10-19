"use client";

import { useEffect, useRef } from "react";
import type { CoachSkeleton } from "@/lib/pose/coach-figure/skeleton";
import { coachMeshFromSkeleton } from "@/lib/pose/coach-figure/mesh-from-skeleton";

type Pose3DViewerProps = {
  skeleton: CoachSkeleton | null;
  className?: string;
};

export function Pose3DViewer({ skeleton, className }: Pose3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);

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

      const hemi = new THREE.HemisphereLight(0xb8e8ff, 0x223344, 1.1);
      scene.add(hemi);
      const key = new THREE.DirectionalLight(0xffffff, 1.2);
      key.position.set(2, 3, 2);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0x66aacc, 0.35);
      fill.position.set(-2, 1, -1);
      scene.add(fill);

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 3),
        new THREE.MeshStandardMaterial({
          color: 0x14202a,
          roughness: 0.9,
          metalness: 0.05,
        }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = 0;
      scene.add(floor);

      const grid = new THREE.GridHelper(3, 16, 0x2a4a5a, 0x1a2a34);
      grid.position.y = 0.001;
      scene.add(grid);

      const forward = new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0.01, 0),
        0.35,
        0x22d3ee,
      );
      scene.add(forward);

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
        metalness: 0.05,
      });

      function rebuildFigure(sk: CoachSkeleton) {
        while (figureGroup.children.length) {
          const child = figureGroup.children[0];
          figureGroup.remove(child);
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        }

        const mesh = coachMeshFromSkeleton(sk);

        for (const bone of mesh.bones) {
          const a = new THREE.Vector3(bone.from.x, bone.from.y, bone.from.z);
          const b = new THREE.Vector3(bone.to.x, bone.to.y, bone.to.z);
          const dir = new THREE.Vector3().subVectors(b, a);
          const len = dir.length();
          if (len < 1e-4) continue;
          const cyl = new THREE.Mesh(
            new THREE.CylinderGeometry(bone.radius, bone.radius, len, 10),
            bodyMat,
          );
          cyl.position.copy(a).add(b).multiplyScalar(0.5);
          cyl.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            dir.normalize(),
          );
          figureGroup.add(cyl);
        }

        const neckA = new THREE.Vector3(
          mesh.neckFrom.x,
          mesh.neckFrom.y,
          mesh.neckFrom.z,
        );
        const neckB = new THREE.Vector3(
          mesh.neckTo.x,
          mesh.neckTo.y,
          mesh.neckTo.z,
        );
        const neckDir = new THREE.Vector3().subVectors(neckB, neckA);
        const neckLen = neckDir.length();
        const neck = new THREE.Mesh(
          new THREE.CylinderGeometry(
            mesh.neckRadius,
            mesh.neckRadius,
            neckLen,
            10,
          ),
          bodyMat,
        );
        neck.position.copy(neckA).add(neckB).multiplyScalar(0.5);
        neck.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          neckDir.normalize(),
        );
        figureGroup.add(neck);

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
        const verts = new Float32Array([
          c0.x, c0.y, c0.z,
          c1.x, c1.y, c1.z,
          c2.x, c2.y, c2.z,
          c0.x, c0.y, c0.z,
          c2.x, c2.y, c2.z,
          c3.x, c3.y, c3.z,
        ]);
        torsoGeo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
        torsoGeo.computeVertexNormals();
        const torso = new THREE.Mesh(torsoGeo, torsoMat);
        figureGroup.add(torso);
      }

      if (skeleton) rebuildFigure(skeleton);

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

      return () => {
        window.removeEventListener("resize", onResize);
      };
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement.parentElement === mount) {
          mount.removeChild(renderer.domElement);
        }
      }
    };
  }, [skeleton]);

  return (
    <div
      ref={mountRef}
      className={className}
      role="img"
      aria-label="3D coach pose preview"
    />
  );
}
