"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Component, ReactNode, useEffect, useRef } from "react";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import ArtifactNode from "./ArtifactNode";
import { THEME_PALETTES, useStore } from "@/store/useStore";

function PreviewUnavailable() {
  return (
    <div
      role="status"
      className="preview-unavailable"
      style={{
        display: "grid",
        placeContent: "center",
        textAlign: "center",
        height: "100%",
        padding: 32,
        color: "#a2b0a8",
      }}
    >
      <svg
        width="120"
        height="140"
        viewBox="0 0 120 140"
        fill="none"
        style={{ margin: "0 auto 24px" }}
        aria-hidden="true"
      >
        <path d="M60 7 110 36v66l-50 30-50-30V36L60 7Z" stroke="#597d6b" />
        <path
          d="m10 36 50 30 50-30M60 66v66M10 68l50 30 50-30"
          stroke="#597d6b"
        />
      </svg>
      <p style={{ color: "#e4ece6", fontSize: 16, marginBottom: 8 }}>
        The 3D preview is unavailable.
      </p>
      <p style={{ fontSize: 13, maxWidth: 260, lineHeight: 1.7 }}>
        Try a browser with WebGL support to explore the sculptures.
      </p>
    </div>
  );
}

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <PreviewUnavailable /> : this.props.children;
  }
}

function Studio() {
  const colorTheme = useStore((state) => state.colorTheme);
  const palette = THEME_PALETTES[colorTheme];
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 5]} intensity={2.4} color="#edf5ef" />
      <pointLight
        position={[-4, -2, 3]}
        intensity={9}
        color={palette.start}
        distance={12}
      />
      <Environment resolution={256} frames={1} environmentIntensity={1}>
        <color attach="background" args={["#18211d"]} />
        <Lightformer
          form="rect"
          intensity={4}
          color="#f0f5ec"
          position={[-3, 4, 2]}
          rotation={[Math.PI / 3, 0, -Math.PI / 5]}
          scale={[7, 3, 1]}
        />
        <Lightformer
          form="rect"
          intensity={3}
          color="#d5e8df"
          position={[0, 1, 5]}
          scale={[1.2, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2.6}
          color="#ecf3e9"
          position={[-5, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[3, 7, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2}
          color="#8fc6ab"
          position={[5, 1, -2]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[2, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.5}
          color="#aabdb0"
          position={[0, -4, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[6, 2, 1]}
        />
      </Environment>
    </>
  );
}

function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, size, gl } = useThree();
  const resetKey = useStore((state) => state.resetKey);
  useEffect(() => {
    // Fit the full silhouette even when the stage becomes tall and narrow.
    const aspect = size.width / Math.max(size.height, 1);
    const distance = Math.max(7.8, 6.4 / aspect);
    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);
    controls.current?.target.set(0, 0, 0);
    controls.current?.update();
    controls.current?.saveState();
  }, [camera, size.width, size.height]);
  useEffect(() => {
    controls.current?.reset();
  }, [resetKey]);
  useEffect(() => {
    gl.domElement.style.setProperty("touch-action", "pan-y");
  }, [gl]);
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableZoom={false}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.6}
      minPolarAngle={Math.PI * 0.18}
      maxPolarAngle={Math.PI * 0.82}
    />
  );
}

export const View = () => (
  <div
    className="sculpture-canvas"
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      cursor: "grab",
      touchAction: "pan-y",
    }}
    onPointerMove={(event) => {
      if (event.pointerType !== "mouse") return;
      const rect = event.currentTarget.getBoundingClientRect();
      useStore
        .getState()
        .setMousePosition([
          (event.clientX - rect.left) / rect.width,
          (event.clientY - rect.top) / rect.height,
        ]);
    }}
    onPointerLeave={() => useStore.getState().setMousePosition([0.5, 0.5])}
    aria-label="Interactive sculpture. Drag to rotate the view."
  >
    <SceneBoundary>
      <Canvas
        camera={{ position: [0, 0, 8.4], fov: 37, near: 0.1, far: 40 }}
        dpr={[1, 1.6]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
        }}
        fallback={<PreviewUnavailable />}
        onCreated={({ gl }) => {
          gl.setClearColor(0x080b0b, 0);
        }}
      >
        <Studio />
        <ArtifactNode />
        <CameraRig />
      </Canvas>
    </SceneBoundary>
  </div>
);
