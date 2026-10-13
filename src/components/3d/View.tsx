"use client";

import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Environment, Float, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Glitch } from "@react-three/postprocessing";
import { GlitchMode } from "postprocessing";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import ArtifactNode from "./ArtifactNode";
import { useStore, THEME_PALETTES } from "@/store/useStore";

// Dynamic Spotlight that follows user presence
function DynamicLighting() {
  const targetAcquired = useStore((state) => state.isTargetAcquired);
  const colorTheme = useStore((state) => state.colorTheme);
  const palette = THEME_PALETTES[colorTheme];

  const lightRef = useRef<THREE.SpotLight>(null);

  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.color.set(palette.accent);
    }
  }, [palette]);

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} color="#ffffff" />
      <spotLight
        ref={lightRef}
        position={[-6, 6, 8]}
        color={palette.accent}
        intensity={targetAcquired ? 12 : 2.5}
        angle={0.6}
        penumbra={0.8}
      />
      <pointLight
        position={[0, -6, -4]}
        intensity={targetAcquired ? 4 : 1}
        color={palette.start}
      />
    </>
  );
}

export const View = () => {
  const targetAcquired = useStore((state) => state.isTargetAcquired);
  const setMousePosition = useStore((state) => state.setMousePosition);

  // Track mouse coordinates for telemetry and fallback interaction
  const handlePointerMove = (e: React.PointerEvent) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    setMousePosition([x, y]);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className="fixed inset-0 w-full h-full z-0 bg-[#020204] overflow-hidden"
    >
      <Canvas
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 7.5]} fov={38} />

        <DynamicLighting />

        <Suspense fallback={null}>
          <Float
            speed={targetAcquired ? 3.5 : 1.8}
            rotationIntensity={0.4}
            floatIntensity={0.8}
          >
            <ArtifactNode />
          </Float>

          <Environment preset="night" />

          <EffectComposer enableNormalPass={false}>
            <Bloom
              luminanceThreshold={0.35}
              luminanceSmoothing={0.8}
              mipmapBlur
              intensity={targetAcquired ? 3.5 : 0.8}
            />

            <Glitch
              active={!!targetAcquired}
              delay={new THREE.Vector2(0.3, 1.2)}
              duration={new THREE.Vector2(0.04, 0.12)}
              strength={new THREE.Vector2(0.08, 0.2)}
              mode={GlitchMode.SPORADIC}
            />

            <Vignette eskil={false} offset={0.12} darkness={1.25} />
          </EffectComposer>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.5}
            makeDefault
          />
        </Suspense>
      </Canvas>
    </div>
  );
};