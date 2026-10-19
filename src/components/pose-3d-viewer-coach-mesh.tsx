"use client";

import { useEffect, useRef, useState } from "react";
import type { ExtendedCoachPose } from "@/lib/pose/coach-figure/extended-pose";
import {
  buildCoachMeshFigure,
  disposeCoachMeshGroup,
} from "@/lib/pose/coach-figure/render-coach-mesh-three";
import { cn } from "@/lib/utils";

type Pose3DCoachMeshViewerProps = {
  pose: ExtendedCoachPose | null;
  className?: string;
  horizontalOrbit?: boolean;
};

type RebuildFn = (pose: ExtendedCoachPose | null) => void;

/**
 * Solid coach figure from authored skeleton (tubes + torso + head).
 * Always visible; matches `ExtendedCoachPose` without IK loss.
 */
export function Pose3DCoachMeshViewer({
  pose,
  className,
  horizontalOrbit = false,
}: Pose3DCoachMeshViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const poseRef = useRef(pose);
  const rebuildRef = useRef<RebuildFn | null>(null);
  const sessionRef = useRef(0);
  const [viewerState, setViewerState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [viewerError, setViewerError] = useState<string | null>(null);

  poseRef.current = pose;

  useEffect(() => {
    rebuildRef.current?.(pose);
  }, [pose]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const session = ++sessionRef.current;
    let disposed = false;
    let renderer: import("three").WebGLRenderer | null = null;
    let frameId = 0;
    let figureGroup: import("three").Group | null = null;
    let THREE: typeof import("three") | null = null;
    let controls: import("three/examples/jsm/controls/OrbitControls.js").OrbitControls | null =
      null;
    let camera: import("three").PerspectiveCamera | null = null;

    void (async () => {
      try {
        THREE = await import("three");
        const { OrbitControls } = await import(
          "three/examples/jsm/controls/OrbitControls.js"
        );

        if (disposed || session !== sessionRef.current) return;

        let width = mount.clientWidth;
        let height = mount.clientHeight;
        if (width < 8 || height < 8) {
          width = 400;
          height = Math.max(mount.parentElement?.clientHeight ?? 360, 280);
        }

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a1218);

        camera = new THREE.PerspectiveCamera(42, width / height, 0.05, 30);
        camera.position.set(0, 1.05, 2.35);

        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: false,
          preserveDrawingBuffer: true,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        const canvas = renderer.domElement;
        canvas.style.position = "absolute";
        canvas.style.inset = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        mount.replaceChildren(canvas);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0.92, 0);
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
          new THREE.MeshStandardMaterial({ color: 0x1a3040, roughness: 0.9 }),
        );
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        const grid = new THREE.GridHelper(6, 24, 0x3a6a7a, 0x243848);
        grid.position.y = 0.001;
        scene.add(grid);

        const rebuildFigure = (p: ExtendedCoachPose | null) => {
          if (!THREE || !scene) return;
          if (figureGroup) {
            scene.remove(figureGroup);
            disposeCoachMeshGroup(figureGroup);
            figureGroup = null;
          }
          if (!p) return;
          figureGroup = buildCoachMeshFigure(p, THREE);
          scene.add(figureGroup);
          if (camera && controls) {
            const box = new THREE.Box3().setFromObject(figureGroup);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const span = Math.max(size.x, size.y, size.z, 0.5);
            controls.target.copy(center);
            camera.position.set(
              center.x,
              center.y + span * 0.12,
              center.z + span * 1.55,
            );
            controls.update();
          }
        };

        rebuildRef.current = rebuildFigure;
        rebuildFigure(poseRef.current);

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
          controls?.update();
          renderer?.render(scene, camera!);
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
        console.error("Pose3DCoachMeshViewer:", err);
        setViewerError(message);
        setViewerState("error");
      }
    })();

    return () => {
      disposed = true;
      rebuildRef.current = null;
      cancelAnimationFrame(frameId);
      if (figureGroup && THREE) disposeCoachMeshGroup(figureGroup);
      if (renderer) renderer.dispose();
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
        aria-label="3D coach figure preview"
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
