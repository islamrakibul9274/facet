"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useStore, THEME_PALETTES, ArtifactType } from "@/store/useStore";

// Ambient stardust around the sculpture that energizes on face detection
function AmbientDust({ count = 350, isAwake = false }: { count?: number; isAwake?: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const colorTheme = useStore((state) => state.colorTheme);
  const palette = THEME_PALETTES[colorTheme];

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.8 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    // Double orbit speed when awake
    const speed = isAwake ? 0.08 : 0.02;
    pointsRef.current.rotation.y = t * speed;
    pointsRef.current.rotation.x = Math.sin(t * speed * 0.5) * 0.15;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={isAwake ? 0.045 : 0.025}
        color={palette.start}
        transparent
        opacity={isAwake ? 0.75 : 0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Procedural internal light vein shaders
const veinVertexShader = `
  varying vec2 vUv;
  varying vec3 vPos;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    vPos = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const veinFragmentShader = `
  varying vec2 vUv;
  varying vec3 vPos;
  varying vec3 vNormal;
  
  uniform float time;
  uniform float intensity;
  uniform vec3 colorStart;
  uniform vec3 colorEnd;
  uniform vec3 colorAccent;

  void main() {
    // Multi-frequency wave flow
    float w1 = sin(vPos.x * 3.0 - time * 5.0) * cos(vPos.y * 3.2 + time * 4.0);
    float w2 = sin((vPos.y * 2.5 + vPos.z * 2.5) * 2.0 + time * 4.5);
    float fluid = (w1 + w2) * 0.5;

    // Razor-sharp edge contours
    float edgeX = min(vUv.x, 1.0 - vUv.x);
    float edgeY = min(vUv.y, 1.0 - vUv.y);
    float edgeDist = min(edgeX, edgeY);
    float edgeLine = smoothstep(0.03, 0.008, edgeDist);

    vec3 viewDir = normalize(-vPos);
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.2);

    vec3 baseColor = mix(colorStart, colorEnd, vUv.y * 0.7 + 0.15);
    vec3 activeColor = mix(baseColor, colorAccent, clamp(fluid * 0.6 + 0.4, 0.0, 1.0));

    if (intensity > 0.05) {
      // VIBRANT HDR IGNITION ON DETECTION
      vec3 finalRgb = activeColor * (2.8 + fluid * 1.5) * intensity;
      finalRgb += colorStart * edgeLine * 4.0 * intensity;
      finalRgb += colorAccent * fresnel * 2.5 * intensity;

      float alpha = clamp((fluid * 0.5 + edgeLine * 0.8 + fresnel * 0.6) * intensity, 0.0, 0.95);
      gl_FragColor = vec4(finalRgb, alpha);
    } else {
      // Minimal cool glass edge reflection when idle
      float idleAlpha = edgeLine * 0.3 + fresnel * 0.18;
      if (idleAlpha < 0.02) discard;
      gl_FragColor = vec4(vec3(0.7, 0.8, 0.95), idleAlpha * 0.65);
    }
  }
`;

function GeometrySelector({ type }: { type: ArtifactType }) {
  switch (type) {
    case "pillar":
      return <boxGeometry args={[1.5, 3.2, 1.5]} />;
    case "torus":
      return <torusKnotGeometry args={[1.35, 0.4, 180, 32, 2, 3]} />;
    case "crystal":
      return <icosahedronGeometry args={[1.85, 0]} />;
    case "cube":
    default:
      return <boxGeometry args={[2.3, 2.3, 2.3]} />;
  }
}

export default function ArtifactNode() {
  const groupRef = useRef<THREE.Group>(null);
  const coreMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const shaderMatRef = useRef<THREE.ShaderMaterial>(null);
  const { mouse } = useThree();

  const isTargetAcquired = useStore((state) => state.isTargetAcquired);
  const isCameraOn = useStore((state) => state.isCameraOn);
  const activeArtifact = useStore((state) => state.activeArtifact);
  const colorTheme = useStore((state) => state.colorTheme);

  const palette = THEME_PALETTES[colorTheme];

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      intensity: { value: 0 },
      colorStart: { value: new THREE.Color(palette.start) },
      colorEnd: { value: new THREE.Color(palette.end) },
      colorAccent: { value: new THREE.Color(palette.accent) },
    }),
    []
  );

  useEffect(() => {
    if (shaderMatRef.current) {
      shaderMatRef.current.uniforms.colorStart.value.set(palette.start);
      shaderMatRef.current.uniforms.colorEnd.value.set(palette.end);
      shaderMatRef.current.uniforms.colorAccent.value.set(palette.accent);
    }
    if (coreMatRef.current) {
      coreMatRef.current.emissive.set(palette.emissive);
    }
  }, [palette]);

  useFrame((state) => {
    if (!groupRef.current || !shaderMatRef.current) return;
    const t = state.clock.getElapsedTime();
    shaderMatRef.current.uniforms.time.value = t;

    const isTracking = isCameraOn && isTargetAcquired;

    // Smooth intensity interpolation
    const targetIntensity = isTracking ? 1.0 : 0.0;
    const currentIntensity = shaderMatRef.current.uniforms.intensity.value;
    shaderMatRef.current.uniforms.intensity.value = THREE.MathUtils.lerp(
      currentIntensity,
      targetIntensity,
      0.1
    );

    // Update core emissive intensity
    if (coreMatRef.current) {
      coreMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        coreMatRef.current.emissiveIntensity,
        isTracking ? 0.9 : 0.08,
        0.1
      );
    }

    if (isTracking) {
      const targetPos = useStore.getState().targetPosition;
      
      // 1. ROTATIONAL GAZE TRACKING (Follows face angle)
      const rotX = (targetPos[1] - 0.5) * 2.4;
      const rotY = -(targetPos[0] - 0.5) * 2.6;

      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        rotX,
        0.12
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        rotY,
        0.12
      );

      // 2. SPATIAL TRANSLATION (Sculpture leans toward the user's face position)
      const posX = -(targetPos[0] - 0.5) * 1.2;
      const posY = -(targetPos[1] - 0.5) * 0.9;

      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        posX,
        0.1
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        posY,
        0.1
      );

      // 3. ORGANIC HEARTBEAT PULSE (Breathing effect when locked)
      const pulse = 1.0 + Math.sin(t * 5.0) * 0.04;
      groupRef.current.scale.set(pulse, pulse, pulse);
    } else {
      // Natural mouse parallax fallback
      const mouseRotX = -mouse.y * 0.5;
      const mouseRotY = mouse.x * 0.65;

      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        mouseRotX,
        0.05
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouseRotY,
        0.05
      );

      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 0, 0.06);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.06);
      groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.06);
    }

    // Continuous celestial drift
    groupRef.current.rotation.z += isTracking ? 0.003 : 0.0012;
  });

  return (
    <>
      <AmbientDust isAwake={isCameraOn && isTargetAcquired} />

      <group ref={groupRef}>
        {/* Layer 1: Core Physical Volcanic Obsidian with Active Glow */}
        <mesh>
          <GeometrySelector type={activeArtifact} />
          <meshPhysicalMaterial
            ref={coreMatRef}
            color="#040406"
            metalness={0.94}
            roughness={0.08}
            emissive={palette.emissive}
            emissiveIntensity={0.08}
            clearcoat={1.0}
            clearcoatRoughness={0.03}
          />
        </mesh>

        {/* Layer 2: Internal Light Veins (Ignites with HDR emission on detection) */}
        <mesh scale={1.004}>
          <GeometrySelector type={activeArtifact} />
          <shaderMaterial
            ref={shaderMatRef}
            transparent
            depthWrite={false}
            toneMapped={false}
            uniforms={uniforms}
            vertexShader={veinVertexShader}
            fragmentShader={veinFragmentShader}
          />
        </mesh>

        {/* Layer 3: Physical Refractive Glass Envelope */}
        <mesh scale={1.012}>
          <GeometrySelector type={activeArtifact} />
          <meshPhysicalMaterial
            transmission={0.95}
            thickness={0.3}
            roughness={0.02}
            ior={1.6}
            reflectivity={0.4}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
            transparent
            opacity={0.92}
            metalness={0.04}
            attenuationColor={palette.start}
            attenuationDistance={2.2}
          />
        </mesh>
      </group>
    </>
  );
}
