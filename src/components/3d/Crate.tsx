"use client";
import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export default function Crate() {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const isTargetAcquired = useStore((state) => state.isTargetAcquired);
  const isCameraOn = useStore((state) => state.isCameraOn);

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    isActive: { value: 0 },
    intensity: { value: 0 },
    // Enhanced color palette
    colorStart: { value: new THREE.Color("#00f2ff") }, 
    colorEnd: { value: new THREE.Color("#0066ff") },
    colorAccent: { value: new THREE.Color("#8a2be2") }, // Purple accent
  }), []);

  useFrame((state) => {
    if (!groupRef.current || !materialRef.current) return;
    const t = state.clock.getElapsedTime();
    
    const isTrackingActive = isCameraOn && isTargetAcquired;
    materialRef.current.uniforms.time.value = t;
    
    // Smooth intensity ramping for dramatic effect
    const targetIntensity = isTrackingActive ? 1.0 : 0.0;
    const currentIntensity = materialRef.current.uniforms.intensity.value;
    const newIntensity = THREE.MathUtils.lerp(currentIntensity, targetIntensity, 0.08);
    materialRef.current.uniforms.intensity.value = newIntensity;
    materialRef.current.uniforms.isActive.value = isTrackingActive ? 1.0 : 0.0;

    if (isTrackingActive) {
      const targetPos = useStore.getState().targetPosition;
      // More responsive rotation
      const rotX = (targetPos[1] - 0.5) * 1.8;
      const rotY = (targetPos[0] - 0.5) * 1.8;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotX, 0.15);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotY, 0.15);
      // Add subtle scale pulse when active
      const scale = 1 + Math.sin(t * 15) * 0.003;
      groupRef.current.scale.set(scale, scale, scale);
    } else {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.08);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.08);
      groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.05);
    }
    // Idle floating rotation
    groupRef.current.rotation.z += 0.002;
  });

  return (
    <group ref={groupRef}>
      
      {/* 1. THE CORE: Deep Obsidian with subtle glow */}
      <mesh>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <meshPhysicalMaterial 
          color="#050508" 
          metalness={0.95}
          roughness={0.05}
          emissive="#001133"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* 2. THE DATA SHELL: Enhanced Liquid Plasma */}
      <mesh scale={1.002}>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <shaderMaterial 
          ref={materialRef}
          transparent 
          depthWrite={false} 
          toneMapped={false} 
          uniforms={uniforms}
          vertexShader={`
            varying vec2 vUv;
            varying vec3 vPos;
            varying vec3 vNormal;
            void main() {
              vUv = uv;
              vPos = position;
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            varying vec3 vPos;
            varying vec3 vNormal;
            uniform float time;
            uniform float isActive;
            uniform float intensity;
            uniform vec3 colorStart;
            uniform vec3 colorEnd;
            uniform vec3 colorAccent;

            void main() {
              // === ENHANCED EDGE DETECTION ===
              float edgeX = min(vUv.x, 1.0 - vUv.x);
              float edgeY = min(vUv.y, 1.0 - vUv.y);
              float edgeDist = min(edgeX, edgeY);
              
              // Multiple edge layers for depth
              float borderCore = smoothstep(0.025, 0.008, edgeDist);
              float borderGlow = smoothstep(0.05, 0.02, edgeDist);
              float borderSpark = 1.0 - smoothstep(0.002, 0.01, edgeDist);
              
              // === ADVANCED LIQUID WAVE SYSTEM ===
              // Multi-frequency waves for organic feel
              float wave1 = sin(vPos.x * 3.0 - time * 6.0) * cos(vPos.y * 2.5 + time * 4.0);
              float wave2 = sin((vPos.y * 2.0 + vPos.z * 1.5) * 2.0 + time * 5.0);
              float wave3 = sin((vPos.x + vPos.z) * 4.0 - time * 8.0) * 0.5;
              float liquidWave = (wave1 + wave2 + wave3) / 1.5;
              
              // Energy pulse traveling across faces
              float energyPulse = sin(vPos.x * 5.0 - time * 12.0) * cos(vPos.y * 5.0 - time * 10.0);
              float energyIntensity = smoothstep(0.3, 0.9, abs(energyPulse));
              
              // === DYNAMIC COLOR SYSTEM ===
              vec3 gradientBlue = mix(colorStart, colorEnd, vUv.y + sin(time * 0.5) * 0.1);
              vec3 accentColor = mix(gradientBlue, colorAccent, sin(time * 1.2) * 0.3);
              
              // HDR intensity based on active state
              float activeIntensity = intensity * (1.5 + sin(time * 8.0) * 0.3);
              float idleIntensity = 0.3;
              
              vec3 finalColor;
              float finalAlpha;
              
              if (intensity > 0.05) {
                // === ACTIVE STATE: Explosive energy ===
                
                // Core liquid color with wave modulation
                vec3 liquidColor = accentColor * (1.2 + liquidWave * 0.6);
                
                // Edge colors: cyan to purple shift
                vec3 edgeColor = mix(colorStart, colorAccent, sin(time * 2.0) * 0.5 + 0.5);
                vec3 neonEdge = edgeColor * (3.0 + energyIntensity * 4.0);
                
                // Face glow intensity
                float faceGlow = (liquidWave * 0.4 + 0.2) * intensity;
                float edgeIntensity = borderCore * (1.5 + energyIntensity * 2.0) * activeIntensity;
                float sparkIntensity = borderSpark * energyIntensity * intensity * 2.0;
                
                // Combine layers
                finalColor = mix(liquidColor, neonEdge, edgeIntensity + sparkIntensity);
                finalColor += vec3(0.5, 0.3, 0.8) * sparkIntensity; // Purple sparks
                finalAlpha = max(faceGlow, edgeIntensity * 0.8);
                finalAlpha = min(finalAlpha + sparkIntensity * 0.5, 0.95);
                
                // Add pulsing to alpha when fully active
                if (intensity > 0.8) {
                  finalAlpha += sin(time * 15.0) * 0.1;
                }
              } else {
                // === IDLE STATE: Elegant minimal edges ===
                float idleEdge = borderGlow * 0.4;
                float idleSpark = borderSpark * 0.15 * (sin(time * 3.0) * 0.5 + 0.5);
                
                finalColor = vec3(0.7, 0.75, 0.9); // Cool white-blue
                finalAlpha = idleEdge + idleSpark;
                
                if (finalAlpha < 0.02) discard;
              }
              
              gl_FragColor = vec4(finalColor, finalAlpha);
            }
          `}
        />
      </mesh>

      {/* 3. THE GLASS: Enhanced Refractive Layer */}
      <mesh scale={1.01}>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <meshPhysicalMaterial 
          transmission={0.95}
          thickness={0.25}
          roughness={0.02}
          ior={1.5}
          clearcoat={1.0}
          clearcoatRoughness={0.02}
          reflectivity={0.3}
          transparent
          opacity={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* 4. ADDITIONAL: Outer Energy Halo (Optional) */}
      <mesh scale={1.03}>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <shaderMaterial 
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={{
            time: { value: 0 },
            intensity: { value: 0 }
          }}
          vertexShader={`
            varying vec3 vPos;
            void main() {
              vPos = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float time;
            uniform float intensity;
            varying vec3 vPos;
            
            void main() {
              float glowIntensity = intensity * 0.3 * (sin(time * 8.0) * 0.5 + 0.5);
              float alpha = glowIntensity * (1.0 - abs(vPos.x) / 1.3) * (1.0 - abs(vPos.y) / 1.3);
              gl_FragColor = vec4(vec3(0.0, 0.5, 1.0), alpha);
            }
          `}
        />
      </mesh>

    </group>
  );
}