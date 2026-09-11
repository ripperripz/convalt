import { useLayoutEffect, useRef } from "react";
import { Object3D } from "three";

const COLUMNS = 18;
const ROWS = 12;
const INSTANCE_COUNT = COLUMNS * ROWS;

const PANEL = {
  color: "#14232d",
  metalness: 0.32,
  roughness: 0.36,
  envMapIntensity: 0.42,
};

export function SolarFieldScene({ position }) {
  const panels = useRef();

  useLayoutEffect(() => {
    const dummy = new Object3D();
    let index = 0;

    for (let row = 0; row < ROWS; row += 1) {
      for (let column = 0; column < COLUMNS; column += 1) {
        const depth = 5 - row * 3.05;
        const stagger = row % 2 === 0 ? 0 : 0.82;
        dummy.position.set(
          (column - (COLUMNS - 1) / 2) * 1.72 + stagger,
          0.34,
          depth,
        );
        dummy.rotation.set(-0.2, 0, 0);
        dummy.updateMatrix();
        panels.current.setMatrixAt(index, dummy.matrix);
        index += 1;
      }
    }

    panels.current.instanceMatrix.needsUpdate = true;
    panels.current.computeBoundingSphere();
  }, []);

  return (
    <group position={position} name="Solar field chapter">
      <instancedMesh
        ref={panels}
        args={[undefined, undefined, INSTANCE_COUNT]}
        name="Solar field panels"
      >
        <boxGeometry args={[1.58, 0.07, 2.42]} />
        <meshStandardMaterial {...PANEL} />
      </instancedMesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -12]} name="Solar field ground">
        <planeGeometry args={[72, 76]} />
        <meshStandardMaterial color="#8f846b" roughness={0.96} envMapIntensity={0.08} />
      </mesh>

      <mesh position={[0, 1.15, -31]} scale={[25, 1.35, 2.5]} name="Hazy distant hills">
        <sphereGeometry args={[1, 20, 8]} />
        <meshStandardMaterial color="#b9ad96" roughness={1} envMapIntensity={0.05} />
      </mesh>
    </group>
  );
}
