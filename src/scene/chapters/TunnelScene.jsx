import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BackSide,
  CurvePath,
  LineCurve3,
  Vector3,
} from "three";
import { experienceState } from "../../experience/experienceState";

const RING_COUNT = 18;

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function makePolyline(points) {
  const path = new CurvePath();
  for (let index = 0; index < points.length - 1; index += 1) {
    path.add(new LineCurve3(points[index], points[index + 1]));
  }
  return path;
}

function makeBolt() {
  const random = seededRandom(1709);
  const points = Array.from({ length: 19 }, (_, index) => {
    const progress = index / 18;
    const endTaper = Math.sin(progress * Math.PI);
    return new Vector3(
      (random() - 0.5) * 0.48 * endTaper,
      (random() - 0.5) * 0.42 * endTaper,
      6.45 - progress * 6.5 + (random() - 0.5) * 0.1,
    );
  });
  points[0].set(0, 0, 6.45);
  points[points.length - 1].set(0, 0, -0.05);

  const leftFork = [
    points[8].clone(),
    points[10].clone().add(new Vector3(-0.34, 0.12, 0.04)),
    points[12].clone().add(new Vector3(-0.58, -0.16, -0.04)),
  ];
  const rightFork = [
    points[11].clone(),
    points[13].clone().add(new Vector3(0.28, -0.18, 0.03)),
    points[15].clone().add(new Vector3(0.48, 0.12, -0.06)),
  ];

  return {
    main: makePolyline(points),
    forks: [makePolyline(leftFork), makePolyline(rightFork)],
  };
}

export function TunnelScene({ position }) {
  const coreMaterial = useRef();
  const glowMaterial = useRef();
  const bolt = useMemo(makeBolt, []);

  useFrame(({ clock }) => {
    const localProgress = experienceState.beats.tunnel.localProgress;
    const active = experienceState.scenes.tunnel.visible;

    if (active) {
      const flicker = Math.sin(clock.elapsedTime * 31) * 0.18
        + Math.sin(clock.elapsedTime * 17) * 0.12;
      coreMaterial.current.emissiveIntensity = 5.2 + localProgress * 1.1 + flicker;
      glowMaterial.current.emissiveIntensity = 1.7 + localProgress * 0.5 + flicker * 0.3;
    }
  }, -1);

  return (
    <>
      <group position={position} name="Energy tunnel chapter">
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 3.45]} name="Tunnel shell">
          <cylinderGeometry args={[2.35, 2.35, 7.4, 32, 1, true]} />
          <meshStandardMaterial
            color="#0d1216"
            metalness={0.3}
            roughness={0.86}
            side={BackSide}
          />
        </mesh>

        {Array.from({ length: RING_COUNT }, (_, index) => (
          <mesh key={index} position={[0, 0, 7 - index * 0.41]} name={`Tunnel rib ${index + 1}`}>
            <torusGeometry args={[2.12, 0.17, 8, 32]} />
            <meshStandardMaterial color="#171d21" metalness={0.38} roughness={0.7} />
          </mesh>
        ))}

        <mesh name="Energy bolt glow">
          <tubeGeometry args={[bolt.main, 112, 0.085, 6, false]} />
          <meshStandardMaterial
            ref={glowMaterial}
            color="#8e3200"
            emissive="#ff6a00"
            emissiveIntensity={1.7}
            transparent
            opacity={0.34}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <mesh name="Energy bolt core">
          <tubeGeometry args={[bolt.main, 112, 0.026, 5, false]} />
          <meshStandardMaterial
            ref={coreMaterial}
            color="#ffd28a"
            emissive="#ff9e36"
            emissiveIntensity={5.2}
            roughness={0.32}
            toneMapped={false}
          />
        </mesh>

        {bolt.forks.map((fork, index) => (
          <mesh key={index} name={`Energy bolt fork ${index + 1}`}>
            <tubeGeometry args={[fork, 30, 0.018, 5, false]} />
            <meshStandardMaterial
              color="#ffd28a"
              emissive="#ff6a00"
              emissiveIntensity={4.6}
              roughness={0.35}
              toneMapped={false}
            />
          </mesh>
        ))}

        {[
          [1.72, 1.05, 5.6],
          [-1.76, -0.82, 4.0],
          [1.7, -0.95, 2.35],
          [-1.68, 0.9, 0.8],
        ].map((lightPosition) => (
          <pointLight
            key={lightPosition[2]}
            position={lightPosition}
            color="#ffb15a"
            intensity={0.8}
            distance={3.2}
            decay={2}
          />
        ))}
        <pointLight position={[0, 0, 3]} color="#ff6a00" intensity={2.4} distance={4.5} decay={2} />
      </group>
    </>
  );
}
