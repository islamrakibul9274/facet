"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { ArtifactType, THEME_PALETTES, useStore } from "@/store/useStore";

const ARTIFACTS: ArtifactType[] = ["cube", "crystal", "torus", "pillar"];
const REST_ROTATION: Record<ArtifactType, [number, number, number]> = {
  cube: [0.34, 0.58, -0.08],
  crystal: [0.1, 0.28, -0.15],
  torus: [0.28, 0.18, -0.4],
  pillar: [0.08, 0.3, -0.24],
};

/** A cut mineral: broad crown facets, a substantial girdle and a pointed base. */
function createCrystal() {
  const sides = 8;
  const vertices: number[] = [];
  const rings = [
    { y: 1.46, radius: 0.46, offset: 0 },
    { y: 0.72, radius: 1.16, offset: 0 },
    { y: -0.22, radius: 1.2, offset: 0 },
    { y: -1.15, radius: 0.52, offset: Math.PI / 8 },
  ];
  const point = (ring: number, side: number): [number, number, number] => {
    const { y, radius, offset } = rings[ring];
    const angle = (side / sides) * Math.PI * 2 + offset;
    return [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
  };
  const triangle = (a: number[], b: number[], c: number[]) =>
    vertices.push(...a, ...b, ...c);
  for (let side = 0; side < sides; side++) {
    triangle([0, 1.46, 0], point(0, side + 1), point(0, side));
    for (let ring = 0; ring < rings.length - 1; ring++) {
      triangle(point(ring, side), point(ring, side + 1), point(ring + 1, side));
      triangle(
        point(ring, side + 1),
        point(ring + 1, side + 1),
        point(ring + 1, side),
      );
    }
    triangle(point(3, side), point(3, side + 1), [0, -1.7, 0]);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  geometry.computeVertexNormals();
  return geometry;
}

/** Continuous flutes wind around the column; the silhouette is tapered at both ends. */
function createPillar() {
  const radial = 128;
  const height = 80;
  const vertices: number[] = [];
  const indices: number[] = [];
  for (let row = 0; row <= height; row++) {
    const v = row / height;
    const y = (v - 0.5) * 3.35;
    const taper = 0.86 + Math.sin(v * Math.PI) * 0.14;
    for (let column = 0; column <= radial; column++) {
      const angle = (column / radial) * Math.PI * 2;
      const radius = (0.78 + Math.cos(angle * 16 - y * 5.4) * 0.055) * taper;
      vertices.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      if (row < height && column < radial) {
        const a = row * (radial + 1) + column;
        const b = a + radial + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  }
  const bottom = vertices.length / 3;
  vertices.push(0, -1.675, 0, 0, 1.675, 0);
  for (let column = 0; column < radial; column++) {
    indices.push(bottom, column, column + 1);
    const top = height * (radial + 1) + column;
    indices.push(bottom + 1, top + 1, top);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createCubeInlay() {
  const points: THREE.Vector3[] = [];
  const radius = 0.17;
  const half = 1.104;
  for (let corner = 0; corner < 4; corner++) {
    const angle = (corner * Math.PI) / 2;
    const cx =
      Math.cos(angle + Math.PI / 4) > 0 ? half - radius : -half + radius;
    const cz =
      Math.sin(angle + Math.PI / 4) > 0 ? half - radius : -half + radius;
    for (let step = 0; step <= 12; step++) {
      const theta = angle + ((step / 12) * Math.PI) / 2;
      points.push(
        new THREE.Vector3(
          cx + Math.cos(theta) * radius,
          -0.36,
          cz + Math.sin(theta) * radius,
        ),
      );
    }
  }
  return new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points, true, "centripetal"),
    128,
    0.007,
    6,
    true,
  );
}

function Specimen({
  type,
  geometry,
  inlay,
}: {
  type: ArtifactType;
  geometry: THREE.BufferGeometry;
  inlay: THREE.BufferGeometry;
}) {
  const activeArtifact = useStore((state) => state.activeArtifact);
  const colorTheme = useStore((state) => state.colorTheme);
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.MeshPhysicalMaterial>(null);
  const inlayMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const scale = useRef(activeArtifact === type ? 1 : 0);
  const palette = THEME_PALETTES[colorTheme];
  const targetColor = useMemo(() => {
    const mineral = new THREE.Color(type === "crystal" ? "#9bafa5" : "#78877f");
    return mineral.lerp(
      new THREE.Color(palette.start),
      type === "crystal" ? 0.68 : 0.55,
    );
  }, [palette.start, type]);
  const accent = useMemo(() => new THREE.Color(palette.start), [palette.start]);

  useFrame((_, delta) => {
    if (!group.current || !material.current) return;
    const dt = Math.min(delta, 0.05);
    scale.current = THREE.MathUtils.damp(
      scale.current,
      activeArtifact === type ? 1 : 0,
      8,
      dt,
    );
    group.current.visible = scale.current > 0.005;
    group.current.scale.setScalar(Math.max(scale.current, 0.001));
    material.current.color.lerp(targetColor, 1 - Math.exp(-5 * dt));
    material.current.opacity = Math.min(scale.current * 1.8, 1);
    material.current.depthWrite = material.current.opacity > 0.99;
    if (inlayMaterial.current) {
      inlayMaterial.current.color.lerp(accent, 1 - Math.exp(-5 * dt));
      inlayMaterial.current.emissive.copy(inlayMaterial.current.color);
      inlayMaterial.current.opacity = scale.current * 0.85;
    }
  });

  return (
    <group
      ref={group}
      rotation={REST_ROTATION[type]}
      visible={activeArtifact === type}
    >
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          ref={material}
          color={targetColor}
          metalness={type === "crystal" ? 0.58 : 0.88}
          roughness={type === "crystal" ? 0.16 : 0.21}
          clearcoat={1}
          clearcoatRoughness={0.13}
          envMapIntensity={1.25}
          transparent
          opacity={activeArtifact === type ? 1 : 0}
        />
      </mesh>
      {type === "cube" && (
        <mesh geometry={inlay}>
          <meshStandardMaterial
            ref={inlayMaterial}
            color={accent}
            emissive={accent}
            emissiveIntensity={0.45}
            roughness={0.3}
            metalness={0.4}
            transparent
          />
        </mesh>
      )}
      {type === "pillar" && (
        <>
          <mesh position={[0, 1.66, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.627, 0.011, 8, 96]} />
            <meshStandardMaterial
              color={palette.start}
              emissive={palette.start}
              emissiveIntensity={0.25}
              metalness={0.8}
              roughness={0.25}
            />
          </mesh>
          <mesh position={[0, -1.66, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.627, 0.011, 8, 96]} />
            <meshStandardMaterial
              color={palette.start}
              emissive={palette.start}
              emissiveIntensity={0.25}
              metalness={0.8}
              roughness={0.25}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

export default function ArtifactNode() {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const phase = useRef(0);
  const resetKey = useStore((state) => state.resetKey);
  const geometries = useMemo(
    () => ({
      cube: new RoundedBoxGeometry(2.2, 2.2, 2.2, 5, 0.17),
      crystal: createCrystal(),
      torus: new THREE.TorusKnotGeometry(1.02, 0.34, 240, 40, 2, 3),
      pillar: createPillar(),
      inlay: createCubeInlay(),
    }),
    [],
  );

  useEffect(
    () => () => {
      Object.values(geometries).forEach((geometry) => geometry.dispose());
    },
    [geometries],
  );

  useEffect(() => {
    phase.current = 0;
    if (group.current) {
      group.current.rotation.set(0, 0, 0);
      group.current.position.set(0, 0, 0);
    }
  }, [resetKey]);

  useFrame((_, delta) => {
    if (!group.current || !spin.current) return;
    const store = useStore.getState();
    const dt = Math.min(delta, 0.05);
    const animated = store.isPlaying;
    if (animated) phase.current += (dt * store.motionSpeed) / 0.6;
    const tracking = store.isCameraOn && store.isTargetAcquired;
    const x = tracking
      ? (0.5 - store.targetPosition[0]) * 2
      : (store.mousePosition[0] - 0.5) * 2;
    const y = tracking
      ? (0.5 - store.targetPosition[1]) * 2
      : (0.5 - store.mousePosition[1]) * 2;
    const movement = store.reducedMotion ? 0 : 1;
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      -y * 0.1 * movement,
      3.2,
      dt,
    );
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      x * 0.16 * movement,
      3.2,
      dt,
    );
    group.current.position.y = Math.sin(phase.current * 0.7) * 0.07;
    spin.current.rotation.y = phase.current * 0.105;
    spin.current.rotation.z = Math.sin(phase.current * 0.3) * 0.025;
  });

  return (
    <group ref={group}>
      <group ref={spin}>
        {ARTIFACTS.map((type) => (
          <Specimen
            key={type}
            type={type}
            geometry={geometries[type]}
            inlay={geometries.inlay}
          />
        ))}
      </group>
    </group>
  );
}
