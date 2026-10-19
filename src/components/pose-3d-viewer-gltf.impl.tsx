"use client";

import { useEffect, useRef, useState } from "react";
import type { ExtendedCoachPose } from "@/lib/pose/coach-figure/extended-pose";
import {
  createCoachSceneOverlay,
  updateCoachSceneOverlay,
} from "@/lib/motion/coach-figure/scene-overlay";
import { frameAvatarInView } from "@/lib/motion/retarget/hanim/apply-coach-to-mixamo";
import {
  loadMixamoAvatar,
  retargetCoachPose,
} from "@/lib/motion/retarget/hanim/load-mixamo-avatar";
import type { MixamoAvatar } from "@/lib/motion/retarget/hanim/apply-coach-to-mixamo";
import { cn } from "@/lib/utils";

type Pose3DViewerProps = {
  pose: ExtendedCoachPose | null;
  className?: string;
  horizontalOrbit?: boolean;
};

type RebuildFn = (pose: ExtendedCoachPose | null) => void;

export function Pose3DGltfViewer({
  pose,
  className,
  horizontalOrbit = false,
}: Pose3DViewerProps) {
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

    const session = ++sessionRef.current;
    let disposed = false;
    let renderer: import("three").WebGLRenderer | null = null;
    let frameId = 0;
    let avatar: MixamoAvatar | null = null;
    let coachOverlay: import("@/lib/motion/coach-figure/scene-overlay").CoachSceneOverlay | null =
      null;
    let cameraFramed = false;
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

        camera = new THREE.PerspectiveCamera(42, width / height, 0.05, 50);
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
        mount.replaceChildren(canvas);

        controls = new OrbitControls(camera, renderer.domElement);
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

        scene.add(new THREE.HemisphereLight(0xb8e8ff, 0x223344, 1.35));
        const key = new THREE.DirectionalLight(0xffffff, 1.85);
        key.position.set(2, 4, 2);
        key.castShadow = true;
        scene.add(key);
        const fill = new THREE.DirectionalLight(0x88ccff, 0.55);
        fill.position.set(-2, 2, -1);
        scene.add(fill);
        scene.add(new THREE.AmbientLight(0x99aabb, 0.65));

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

        coachOverlay = createCoachSceneOverlay(THREE);
        scene.add(coachOverlay.root);

        const animate = () => {
          if (disposed || session !== sessionRef.current) return;
          controls?.update();
          renderer?.render(scene, camera!);
          frameId = requestAnimationFrame(animate);
        };
        animate();
        setViewerState("ready");

        avatar = await loadMixamoAvatar(THREE);
        if (disposed || session !== sessionRef.current) return;

        avatar.root.traverse((obj) => {
          const o = obj as import("three").Mesh;
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
          }
        });
        scene.add(avatar.root);

        const frameScene = () => {
          if (!THREE || !avatar || !camera || !controls || !coachOverlay) return;
          const box = new THREE.Box3();
          box.expandByObject(avatar.root);
          box.expandByObject(coachOverlay!.root);
          if (box.isEmpty()) {
            frameAvatarInView(THREE, avatar.root, camera, controls);
            return;
          }
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const span = Math.max(size.x, size.y, size.z, 0.5);
          controls.target.copy(center);
          camera.position.set(
            center.x,
            center.y + span * 0.15,
            center.z + span * 1.45,
          );
          camera.near = Math.max(0.02, span / 80);
          camera.far = Math.max(50, span * 25);
          camera.updateProjectionMatrix();
          controls.update();
        };

        const rebuildFigure = (p: ExtendedCoachPose | null) => {
          if (!THREE || !avatar || !camera || !controls || !coachOverlay) return;
          updateCoachSceneOverlay(THREE, coachOverlay, p);
          retargetCoachPose(THREE, avatar, p);
          if (!cameraFramed) {
            frameScene();
            cameraFramed = true;
          }
        };

        rebuildRef.current = rebuildFigure;
        if (poseRef.current) rebuildFigure(poseRef.current);
        else if (!cameraFramed) {
          frameScene();
          cameraFramed = true;
        }

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

        return () => {
          resizeObserver.disconnect();
          window.removeEventListener("resize", onResize);
        };
      } catch (err) {
        if (disposed || session !== sessionRef.current) return;
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
      coachOverlay?.dispose();
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss?.();
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
