"use client";

import { useEffect, useRef, useState } from "react";
import type { ExtendedCoachPose } from "@/lib/pose/coach-figure/extended-pose";
import { setCachedBindBonePose } from "@/lib/pose/bone-rig/bind-pose-cache";
import {
  applyCoachBonePose,
  captureCoachBonePose,
} from "@/lib/pose/bone-rig/capture-apply";
import { compileCoachBonePoseFromSemantic } from "@/lib/pose/bone-rig/compile-semantic";
import type { CoachBonePoseV1 } from "@/lib/pose/bone-rig/schema";
import {
  tweenCoachBonePose,
  updateBoneTweens,
  type BonePoseTweenHandle,
} from "@/lib/pose/bone-rig/tween-bone-pose";
import {
  applyBindPose,
  frameAvatarInView,
  type MixamoAvatar,
} from "@/lib/motion/retarget/hanim/apply-coach-to-mixamo";
import { loadMixamoAvatar } from "@/lib/motion/retarget/hanim/load-mixamo-avatar";
import { cn } from "@/lib/utils";

export type Pose3DBoneViewerProps = {
  pose: ExtendedCoachPose | null;
  /** Native bone snapshot — applied 1:1 when set. */
  bone?: CoachBonePoseV1 | null;
  className?: string;
  horizontalOrbit?: boolean;
  /** Tween duration when pose target changes (ms). 0 = instant. */
  tweenMs?: number;
};

type RebuildFn = (
  pose: ExtendedCoachPose | null,
  bone: CoachBonePoseV1 | null | undefined,
) => void;

/**
 * Visual coach: Three.js SkinnedMesh + native Bone rotations, Tween.js for blends.
 */
export function Pose3DBoneViewer({
  pose,
  bone,
  className,
  horizontalOrbit = false,
  tweenMs = 90,
}: Pose3DBoneViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const poseRef = useRef(pose);
  const boneRef = useRef(bone);
  const rebuildRef = useRef<RebuildFn | null>(null);
  const sessionRef = useRef(0);
  const [viewerState, setViewerState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [viewerError, setViewerError] = useState<string | null>(null);

  poseRef.current = pose;
  boneRef.current = bone;

  useEffect(() => {
    if (!rebuildRef.current) return;
    try {
      rebuildRef.current(pose, bone);
    } catch (err) {
      console.error("Pose3DBoneViewer pose update:", err);
      setViewerError(
        err instanceof Error ? err.message : "Pose update failed",
      );
      setViewerState("error");
    }
  }, [pose, bone]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const session = ++sessionRef.current;
    let disposed = false;
    let renderer: import("three").WebGLRenderer | null = null;
    let frameId = 0;
    let avatar: MixamoAvatar | null = null;
    let activeTween: BonePoseTweenHandle | null = null;
    let THREE: typeof import("three") | null = null;
    let controls: import("three/examples/jsm/controls/OrbitControls.js").OrbitControls | null =
      null;
    let camera: import("three").PerspectiveCamera | null = null;
    let cameraFramed = false;

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

        const canvasOpts = { alpha: false, powerPreference: "high-performance" as const };
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

        scene.add(new THREE.HemisphereLight(0xb8e8ff, 0x223344, 1.05));
        const key = new THREE.DirectionalLight(0xffffff, 1.25);
        key.position.set(2, 4, 2);
        key.castShadow = true;
        scene.add(key);
        scene.add(new THREE.AmbientLight(0x8899aa, 0.4));

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

        scene.add(
          new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(0, 0.01, 0),
            0.45,
            0x22d3ee,
          ),
        );

        avatar = await loadMixamoAvatar(THREE);
        if (disposed || session !== sessionRef.current) return;

        applyBindPose(THREE, avatar);
        setCachedBindBonePose(captureCoachBonePose(avatar));
        scene.add(avatar.root);

        const resolveTarget = (
          p: ExtendedCoachPose | null,
          b: CoachBonePoseV1 | null | undefined,
        ): CoachBonePoseV1 | null => {
          if (!avatar || !THREE) return null;
          if (b) return b;
          if (!p) return null;
          return compileCoachBonePoseFromSemantic(THREE, avatar, p);
        };

        const rebuildFigure = (
          p: ExtendedCoachPose | null,
          b: CoachBonePoseV1 | null | undefined,
        ) => {
          if (!avatar || !THREE) return;
          const target = resolveTarget(p, b);
          if (!target) return;

          activeTween?.stop();
          activeTween = null;

          if (tweenMs <= 0) {
            applyCoachBonePose(avatar, target);
          } else {
            activeTween = tweenCoachBonePose(avatar, target, tweenMs);
          }

          if (!cameraFramed && camera && controls) {
            frameAvatarInView(THREE, avatar.root, camera, controls);
            cameraFramed = true;
          }
        };

        rebuildRef.current = rebuildFigure;
        rebuildFigure(poseRef.current, boneRef.current);

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

        const animate = (time: number) => {
          if (disposed || session !== sessionRef.current) return;
          updateBoneTweens(time);
          controls?.update();
          renderer?.render(scene, camera!);
          frameId = requestAnimationFrame(animate);
        };
        frameId = requestAnimationFrame(animate);
        setViewerState("ready");

        return () => {
          resizeObserver.disconnect();
          window.removeEventListener("resize", onResize);
        };
      } catch (err) {
        if (disposed || session !== sessionRef.current) return;
        const message =
          err instanceof Error ? err.message : "3D viewer failed to start";
        console.error("Pose3DBoneViewer:", err);
        setViewerError(message);
        setViewerState("error");
      }
    })();

    return () => {
      disposed = true;
      rebuildRef.current = null;
      activeTween?.stop();
      cancelAnimationFrame(frameId);
      if (avatar?.root.parent) avatar.root.parent.remove(avatar.root);
      if (renderer) renderer.dispose();
      mount.replaceChildren();
    };
  }, [horizontalOrbit, tweenMs]);

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
        aria-label="3D coach bone rig preview"
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
