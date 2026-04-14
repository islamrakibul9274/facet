"use client";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Environment, Float, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Glitch } from "@react-three/postprocessing";
import { GlitchMode } from "postprocessing";
import { Suspense } from "react";
import * as THREE from "three";
import Crate from "./Crate";
import { useStore } from "@/store/useStore";

export const View = () => {
  const targetAcquired = useStore((state) => state.isTargetAcquired);

  return (
    <div className="fixed inset-0 h-screen w-screen z-0 bg-black">
      <Canvas
        gl={{
          antialias: true,
          toneMapping: 0,
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={35} />

        <ambientLight intensity={0.1} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#ffffff" />

        <spotLight
          position={[-5, 5, 5]}
          color="#bc13fe"
          intensity={targetAcquired ? 8 : 1}
          angle={0.5}
        />

        <Suspense fallback={null}>
          <Float speed={targetAcquired ? 3 : 1.5} rotationIntensity={0.5} floatIntensity={1}>
            <Crate />
          </Float>

          <Environment preset="night" />

          {/* Fix: change disableNormalPass → enableNormalPass={false} */}
          <EffectComposer enableNormalPass={false}>
            <Bloom
              luminanceThreshold={0.5}
              mipmapBlur
              intensity={targetAcquired ? 3.0 : 0.8}
            />

            <Glitch
              active={!!targetAcquired}
              delay={new THREE.Vector2(0.1, 0.5)}
              duration={new THREE.Vector2(0.05, 0.2)}
              strength={new THREE.Vector2(0.1, 0.3)}
              mode={GlitchMode.SPORADIC}
            />

            <Vignette eskil={false} offset={0.1} darkness={1.2} />
          </EffectComposer>

          <OrbitControls enableZoom={false} enablePan={false} makeDefault />
        </Suspense>
      </Canvas>
    </div>
  );
};