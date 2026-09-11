import { useLayoutEffect, useRef } from "react";
import { Matrix4 } from "three";

const BUILDINGS = [
  { position: [-1.75, 0.8, 0], size: [1.35, 3.8, 1.35] },
  { position: [0, 1.45, -0.65], size: [1.8, 5.1, 1.6] },
  { position: [1.95, 1.0, -0.3], size: [1.45, 4.2, 1.4] },
  { position: [0.8, 0.65, -2.55], size: [1.25, 3.5, 1.3] },
];

const STATUS_LIGHTS = [
  [-2.02, 1.45, 0.69], [-1.62, 0.75, 0.69],
  [-0.38, 2.3, 0.16], [0.2, 1.72, 0.16], [0.42, 0.56, 0.16],
  [1.72, 1.78, 0.42], [2.15, 0.92, 0.42], [2.2, 0.28, 0.42],
];

function StatusLights() {
  const lights = useRef();

  useLayoutEffect(() => {
    STATUS_LIGHTS.forEach((position, index) => {
      lights.current.setMatrixAt(index, new Matrix4().makeTranslation(...position));
    });
    lights.current.instanceMatrix.needsUpdate = true;
    lights.current.computeBoundingSphere();
  }, []);

  return (
    <>
      <instancedMesh ref={lights} args={[undefined, undefined, STATUS_LIGHTS.length]} name="Facade status lights">
        <sphereGeometry args={[0.025, 8, 6]} />
        <meshBasicMaterial color="#d9f4ff" toneMapped={false} />
      </instancedMesh>
      <pointLight position={[0.2, 1.7, 0.45]} color="#c8efff" intensity={0.28} distance={1.3} decay={2} />
      <pointLight position={[2.1, 0.9, 0.7]} color="#c8efff" intensity={0.2} distance={1} decay={2} />
    </>
  );
}

function AmberFacadeTraces() {
  const traces = [
    [-1.95, 0.45, 0.69, 0.035, 2.15, "#ff9e36"],
    [-0.58, 0.65, 0.16, 0.04, 2.7, "#ff9e36"],
    [0.55, 0.25, 0.16, 0.04, 2.15, "#ff6a00"],
    [1.7, 0.35, 0.42, 0.035, 2.05, "#ff9e36"],
  ];

  return (
    <group name="Amber facade traces">
      {traces.map(([x, y, z, width, height, color]) => (
        <mesh key={`${x}-${y}`} position={[x, y, z]}>
          <boxGeometry args={[width, height, 0.018]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[-0.27, -0.68, 0.16]}>
        <boxGeometry args={[0.66, 0.04, 0.018]} />
        <meshBasicMaterial color="#ff9e36" toneMapped={false} />
      </mesh>
      <mesh position={[0.78, -0.82, 0.16]}>
        <boxGeometry args={[0.5, 0.04, 0.018]} />
        <meshBasicMaterial color="#ff6a00" toneMapped={false} />
      </mesh>
      <mesh position={[1.93, -0.68, 0.42]}>
        <boxGeometry args={[0.5, 0.035, 0.018]} />
        <meshBasicMaterial color="#ff9e36" toneMapped={false} />
      </mesh>
      <pointLight position={[-0.58, 0.1, 0.5]} color="#ff6a00" intensity={1.4} distance={2.2} decay={2} />
      <pointLight position={[1.7, 0.2, 0.7]} color="#ff9e36" intensity={1.1} distance={1.8} decay={2} />
    </group>
  );
}

export function DataCenterScene({ position }) {
  return (
    <>
      <group position={position} name="Data center chapter">
        {BUILDINGS.map(({ position: buildingPosition, size }, index) => (
          <mesh key={index} position={buildingPosition} name={`Data monolith ${index + 1}`}>
            <boxGeometry args={size} />
            <meshStandardMaterial color="#111820" metalness={0.18} roughness={0.68} envMapIntensity={0.22} />
          </mesh>
        ))}

        <AmberFacadeTraces />
        <StatusLights />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.12, -5]} name="Data center ground">
          <planeGeometry args={[28, 34]} />
          <meshStandardMaterial color="#242722" roughness={0.98} envMapIntensity={0.05} />
        </mesh>

        <mesh position={[-7, -0.15, -14]} scale={[9, 1.2, 2.2]} name="Distant hill left">
          <sphereGeometry args={[1, 16, 7]} />
          <meshStandardMaterial color="#252d32" roughness={1} />
        </mesh>
        <mesh position={[8, -0.28, -16]} scale={[11, 1.05, 2.4]} name="Distant hill right">
          <sphereGeometry args={[1, 16, 7]} />
          <meshStandardMaterial color="#252d32" roughness={1} />
        </mesh>
      </group>
    </>
  );
}
