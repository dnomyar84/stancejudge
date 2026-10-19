"use client";

import { useEffect, useRef, useState } from "react";
import type { ExtendedCoachPose } from "@/lib/pose/coach-figure/extended-pose";
import {
  loadMixamoAvatar,
  retargetCoachPose,
} from "@/lib/pose/hanim/load-mixamo-avatar";
import type { MixamoAvatar } from "@/lib/pose/hanim/apply-coach-to-mixamo";
import { cn } from "@/lib/utils";

type Pose3DViewerProps = {
  pose: ExtendedCoachPose | null;
  className?: string;
  horizontalOrbit?: boolean;
};

type RebuildFn = (pose: ExtendedCoachPose | null) => void;

export function Pose3DViewer({
  pose,
  className,
  horizontalOrbit = false,
}: Pose3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const poseRef = useRef(pose);
  const rebuildRef = useRef<RebuildFn | null>(null);
  const [viewerState, setViewerState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [viewerError, setViewerError] = useState<string | null>(null);

  poseRef.current = pose;

  useEffect(() => {
    if (!rebuildRef.current) return;
    try {
      rebuildRef.current(pose);
    } catch (err) {
      console.error("Pose3DViewer pose update:", err);
      setViewerError(
        err instanceof Error ? err.message : "Pose update failed",
      );
      setViewerState("error");
    }
  }, [pose]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let renderer: import("three").WebGLRenderer | null = null;
    let frameId = 0;
    let avatar: MixamoAvatar | null = null;
    let THREE: typeof import("three") | null = null;

    void (async () => {
      try {
        THREE = await import("three");
        const { OrbitControls } = await import(
          "three/examples/jsm/controls/OrbitControls.js"
        );

        if (disposed) return;

        const width = mount.clientWidth || 400;
        const height = mount.clientHeight || 360;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a1218);

        const camera = new THREE.PerspectiveCamera(42, width / height, 0.05, 50);
        camera.position.set(0, 1.05, 2.35);

        const canvasOpts = { alpha: false, powerPreference: "default" as const };
        try {
          renderer = new THREE.WebGLRenderer({ ...canvasOpts, antialias: true });
        } catch {
          renderer = new THREE.WebGLRenderer({ ...canvasOpts, antialias: false });
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        const canvas = renderer.domElement;
        canvas.style.position = "absolute";
        canvas.style.inset = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        mount.appendChild(canvas);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0.95, 0);
        controls.enableDamping = true;
        controls.enablePan = false;
        if (horizontalOrbit) {
          const elev = Math.PI / 2 - 0.38;
          controls.minPolarAngle = elev;
          controls.maxPolarAngle = elev + 0.06;
          controls.rotateSpeed = 0.85;
          renderer.domElement.style.touchAction = "pan-y";
        }
        controls.update();

        scene.add(new THREE.HemisphereLight(0xb8e8ff, 0x223344, 1.15));
        const key = new THREE.DirectionalLight(0xffffff, 1.4);
        key.position.set(2, 4, 2);
        key.castShadow = true;
        scene.add(key);
        scene.add(new THREE.AmbientLight(0x8899aa, 0.5));

        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(6, 6),
          new THREE.MeshStandardMaterial({
            color: 0x14202a,
            roughness: 0.9,
          }),
        );
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        const grid = new THREE.GridHelper(6, 24, 0x2a4a5a, 0x1a2a34);
        grid.position.y = 0.001;
        scene.add(grid);

        scene.add(
          new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(0, 0.01, 0),
            0.45,
            0x22d3ee,
          ),
        );

        avatar = await loadMixamoAvatar(THREE);
        avatar.root.traverse((obj) => {
          const o = obj as import("three").Mesh;
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
          }
        });
        scene.add(avatar.root);

        const rebuildFigure = (p: ExtendedCoachPose | null) => {
          if (!THREE || !avatar) return;
          retargetCoachPose(THREE, avatar, p);
        };

        rebuildRef.current = rebuildFigure;
        if (poseRef.current) rebuildFigure(poseRef.current);

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
        setViewerState("ready");

        return () => window.removeEventListener("resize", onResize);
      } catch (err) {
        if (disposed) return;
        const message =
          err instanceof Error ? err.message : "3D avatar failed to load";
        console.error("Pose3DViewer:", err);
        setViewerError(message);
        setViewerState("error");
      }
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
  }, [horizontalOrbit]);

  return (
    <div
      className={cn(
        "relative min-h-[280px] w-full overflow-hidden",
        className,
      )}
    >
      <div
        ref={mountRef}
        className="absolute inset-0"
        role="img"
        aria-label="3D humanoid coach preview"
      />
      {viewerState === "loading" && (
        <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-muted-foreground">
          Loading humanoid coach…
        </p>
      )}
      {viewerState === "error" && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/90 px-4 text-center"
          role="alert"
        >
          <p className="text-sm font-medium text-destructive">
            3D preview could not load
          </p>
          <p className="text-xs text-muted-foreground">
            {viewerError ?? "Try another browser or enable WebGL."}
          </p>
        </div>
      )}
    </div>
  );
}
