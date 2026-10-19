"use client";

import { useEffect, useRef, useState } from "react";
import type { ExtendedCoachPose } from "@/lib/pose/coach-figure/extended-pose";
import { applyCoachFigurinePoseToMannequin } from "@/lib/pose/display-figurine/apply-coach-figurine-pose";
import type { CoachFigurinePoseV1 } from "@/lib/pose/display-figurine/coach-figurine-pose";
import { applyCoachPoseToMannequin } from "@/lib/pose/mannequin-adapter/coach-pose-to-mannequin";
import { removeStrayFullscreenCanvases } from "@/lib/pose/mannequin-adapter/cleanup-stray-canvas";
import { cn } from "@/lib/utils";

type Pose3DViewerProps = {
  pose: ExtendedCoachPose | null;
  /** When set, applied 1:1 to the figurine (display truth). */
  figurine?: CoachFigurinePoseV1 | null;
  className?: string;
  horizontalOrbit?: boolean;
};

type MannequinFigure = import("three").Object3D & {
  dispose?: () => void;
};

type RebuildFn = (
  pose: ExtendedCoachPose | null,
  figurine: CoachFigurinePoseV1 | null | undefined,
) => void;

/**
 * Visual coach uses mannequin-js (solid procedural figure).
 * glTF/Xbot retarget under `motion/retarget/hanim/` is kept for future H-Anim path —
 * set NEXT_PUBLIC_COACH_FIGURE=gltf to trial it (not default).
 */
export function Pose3DMannequinViewer({
  pose,
  figurine,
  className,
  horizontalOrbit = false,
}: Pose3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const poseRef = useRef(pose);
  const figurineRef = useRef(figurine);
  const rebuildRef = useRef<RebuildFn | null>(null);
  const sessionRef = useRef(0);
  const [viewerState, setViewerState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [viewerError, setViewerError] = useState<string | null>(null);

  poseRef.current = pose;
  figurineRef.current = figurine;

  useEffect(() => {
    if (!rebuildRef.current) return;
    try {
      rebuildRef.current(pose, figurine);
    } catch (err) {
      console.error("Pose3DViewer pose update:", err);
      setViewerError(
        err instanceof Error ? err.message : "Pose update failed",
      );
      setViewerState("error");
    }
  }, [pose, figurine]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const session = ++sessionRef.current;
    let disposed = false;
    let renderer: import("three").WebGLRenderer | null = null;
    let frameId = 0;
    let mannequin: MannequinFigure | null = null;

    removeStrayFullscreenCanvases();

    void (async () => {
      try {
        const THREE = await import("three");
        const { OrbitControls } = await import(
          "three/examples/jsm/controls/OrbitControls.js"
        );
        const { Male } = await import("mannequin-js/src/bodies/Male.js");
        const { GROUND_LEVEL } = await import("mannequin-js/src/globals.js");

        if (disposed || session !== sessionRef.current) return;

        let width = mount.clientWidth;
        let height = mount.clientHeight;
        if (width < 8 || height < 8) {
          width = 400;
          height = Math.max(mount.parentElement?.clientHeight ?? 360, 280);
        }

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a1218);

        const camera = new THREE.PerspectiveCamera(42, width / height, 0.05, 20);
        camera.position.set(0, 1.0, 2.2);

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
        mount.replaceChildren(canvas);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0.9, 0);
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

        scene.add(new THREE.HemisphereLight(0xb8e8ff, 0x223344, 1.1));
        const key = new THREE.DirectionalLight(0xffffff, 1.35);
        key.position.set(2, 4, 2);
        key.castShadow = true;
        scene.add(key);
        scene.add(new THREE.AmbientLight(0x8899aa, 0.45));

        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(6, 6),
          new THREE.MeshStandardMaterial({
            color: 0x1a3040,
            roughness: 0.9,
          }),
        );
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        const grid = new THREE.GridHelper(6, 24, 0x3a6a7a, 0x243848);
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

        const groundLift = -GROUND_LEVEL;
        mannequin = new Male(1.75) as MannequinFigure;
        scene.add(mannequin);
        let cameraFramed = false;

        const frameMannequin = () => {
          if (!mannequin || !camera || !controls) return;
          mannequin.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(mannequin);
          if (box.isEmpty()) return;
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const span = Math.max(size.x, size.y, size.z, 0.5);
          controls.target.copy(center);
          camera.position.set(
            center.x,
            center.y + span * 0.12,
            center.z + span * 1.55,
          );
          camera.near = Math.max(0.02, span / 80);
          camera.far = Math.max(40, span * 20);
          camera.updateProjectionMatrix();
          controls.update();
          cameraFramed = true;
        };

        const rebuildFigure = (
          p: ExtendedCoachPose | null,
          fig: CoachFigurinePoseV1 | null | undefined,
        ) => {
          if (!mannequin) return;
          const target = mannequin as unknown as Parameters<
            typeof applyCoachFigurinePoseToMannequin
          >[0];
          if (fig) {
            applyCoachFigurinePoseToMannequin(target, fig, { groundLift });
          } else if (p) {
            applyCoachPoseToMannequin(target, p, groundLift);
          }
          mannequin.updateMatrixWorld(true);
          if (!cameraFramed) frameMannequin();
        };

        rebuildRef.current = rebuildFigure;
        rebuildFigure(poseRef.current, figurineRef.current);

        const onResize = () => {
          if (!mount || !renderer || !camera) return;
          const w = mount.clientWidth || 400;
          const h = mount.clientHeight || 360;
          if (w < 8 || h < 8) return;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        const resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(mount);
        window.addEventListener("resize", onResize);
        onResize();

        const animate = () => {
          if (disposed || session !== sessionRef.current) return;
          controls.update();
          renderer?.render(scene, camera);
          frameId = requestAnimationFrame(animate);
        };
        animate();
        setViewerState("ready");

        return () => {
          resizeObserver.disconnect();
          window.removeEventListener("resize", onResize);
        };
      } catch (err) {
        if (disposed || session !== sessionRef.current) return;
        const message =
          err instanceof Error ? err.message : "3D viewer failed to start";
        console.error("Pose3DViewer:", err);
        setViewerError(message);
        setViewerState("error");
      }
    })();

    return () => {
      disposed = true;
      rebuildRef.current = null;
      removeStrayFullscreenCanvases();
      cancelAnimationFrame(frameId);
      if (mannequin?.parent) mannequin.parent.remove(mannequin);
      if (renderer) {
        renderer.dispose();
      }
      mount.replaceChildren();
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
        aria-label="3D coach mannequin preview"
      />
      {viewerState === "loading" && (
        <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-muted-foreground">
          Loading 3D figure…
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
