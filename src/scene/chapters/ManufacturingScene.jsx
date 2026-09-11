import { useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Object3D } from "three";
import { experienceState } from "../../experience/experienceState";

const ARM_COLOR = "#d8d2c5";
const JOINT_COLOR = "#252827";

function RobotArm({ position, rotation = [0, 0, 0], phase = 0 }) {
  const shoulder = useRef();
  const elbow = useRef();
  const wrist = useRef();

  useFrame(() => {
    const localProgress = experienceState.beats.manufacturing.localProgress;
    const cycle = localProgress * Math.PI * 2 + phase;

    shoulder.current.rotation.z = -0.42 + Math.sin(cycle) * 0.28;
    elbow.current.rotation.z = 0.82 + Math.sin(cycle + 1.1) * 0.34;
    wrist.current.rotation.z = -0.38 + Math.sin(cycle + 2.15) * 0.42;
    wrist.current.rotation.y = Math.sin(cycle * 1.4 + phase) * 0.24;
  }, -1);

  return (
    <group position={position} rotation={rotation} name="Primitive robot arm">
      <mesh position={[0, 0.06, 0]} name="Robot base">
        <boxGeometry args={[0.72, 0.5, 0.72]} />
        <meshStandardMaterial color="#8b8982" metalness={0.58} roughness={0.46} />
      </mesh>

      <group ref={shoulder} position={[0, 0.38, 0]}>
        <mesh name="Shoulder joint">
          <sphereGeometry args={[0.24, 14, 10]} />
          <meshStandardMaterial color={JOINT_COLOR} metalness={0.5} roughness={0.44} />
        </mesh>
        <mesh position={[0, 0.65, 0]} name="Upper arm">
          <cylinderGeometry args={[0.17, 0.21, 1.3, 12]} />
          <meshStandardMaterial color={ARM_COLOR} metalness={0.32} roughness={0.42} />
        </mesh>

        <group ref={elbow} position={[0, 1.3, 0]}>
          <mesh name="Elbow joint">
            <sphereGeometry args={[0.21, 14, 10]} />
            <meshStandardMaterial color={JOINT_COLOR} metalness={0.5} roughness={0.44} />
          </mesh>
          <mesh position={[0, 0.52, 0]} name="Forearm">
            <cylinderGeometry args={[0.14, 0.17, 1.04, 12]} />
            <meshStandardMaterial color={ARM_COLOR} metalness={0.32} roughness={0.42} />
          </mesh>

          <group ref={wrist} position={[0, 1.04, 0]}>
            <mesh position={[0, 0.32, 0]} name="Wrist segment">
              <cylinderGeometry args={[0.1, 0.14, 0.64, 12]} />
              <meshStandardMaterial color={ARM_COLOR} metalness={0.32} roughness={0.42} />
            </mesh>
            <mesh position={[0, 0.7, 0]} name="Robot claw">
              <boxGeometry args={[0.48, 0.14, 0.3]} />
              <meshStandardMaterial color={JOINT_COLOR} metalness={0.62} roughness={0.38} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

function ConveyorRollers() {
  const rollers = useRef();
  const count = 20;

  useLayoutEffect(() => {
    const dummy = new Object3D();
    for (let index = 0; index < count; index += 1) {
      dummy.position.set(0, 0.34, 2.6 - index * 0.43);
      dummy.rotation.set(0, 0, Math.PI / 2);
      dummy.updateMatrix();
      rollers.current.setMatrixAt(index, dummy.matrix);
    }
    rollers.current.instanceMatrix.needsUpdate = true;
    rollers.current.computeBoundingSphere();
  }, []);

  return (
    <instancedMesh ref={rollers} args={[undefined, undefined, count]} name="Conveyor rollers">
      <cylinderGeometry args={[0.065, 0.065, 1.55, 10]} />
      <meshStandardMaterial color="#4d504e" metalness={0.72} roughness={0.38} />
    </instancedMesh>
  );
}

function OverheadLight({ x, z }) {
  return (
    <group position={[x, 4.6, z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.7, 0.55]} />
        <meshBasicMaterial color="#fff1d4" toneMapped={false} />
      </mesh>
      <rectAreaLight
        rotation={[-Math.PI / 2, 0, 0]}
        color="#ffe8bd"
        intensity={3.2}
        width={2.2}
        height={1.1}
      />
    </group>
  );
}

export function ManufacturingScene({ position }) {
  return (
    <group position={position} name="Manufacturing chapter">
      <mesh position={[0, 0.18, -1.55]} name="Conveyor body">
        <boxGeometry args={[1.82, 0.22, 8.8]} />
        <meshStandardMaterial color="#777872" metalness={0.62} roughness={0.44} />
      </mesh>
      <ConveyorRollers />

      {[-3.65, -1.55, 0.55].map((z) => (
        <mesh key={z} position={[0, 0.45, z]} name="Panel on conveyor">
          <boxGeometry args={[1.42, 0.055, 1.18]} />
          <meshStandardMaterial color="#17242b" metalness={0.28} roughness={0.34} />
        </mesh>
      ))}

      <RobotArm position={[-1.75, -0.18, 0.9]} rotation={[0, 0.32, -0.08]} phase={0} />
      <RobotArm position={[1.75, -0.18, -1.45]} rotation={[0, -0.42, 0.08]} phase={2.05} />
      <RobotArm position={[-1.75, -0.18, -3.85]} rotation={[0, 0.42, -0.06]} phase={4.1} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, -1.5]} name="Manufacturing floor">
        <planeGeometry args={[14, 16]} />
        <meshStandardMaterial color="#b8aa93" roughness={0.9} envMapIntensity={0.12} />
      </mesh>
      <mesh position={[0, 2.35, -6.55]} name="Warm rear wall">
        <boxGeometry args={[11, 5.6, 0.24]} />
        <meshStandardMaterial color="#c8baa2" roughness={0.92} envMapIntensity={0.1} />
      </mesh>
      <mesh position={[-4.55, 2.25, -1.8]} rotation={[0, -0.1, 0]} name="Left architectural wall">
        <boxGeometry args={[0.36, 5.4, 10]} />
        <meshStandardMaterial color="#ab9d88" roughness={0.94} />
      </mesh>
      <mesh position={[4.55, 2.25, -1.8]} rotation={[0, 0.1, 0]} name="Right architectural wall">
        <boxGeometry args={[0.36, 5.4, 10]} />
        <meshStandardMaterial color="#ab9d88" roughness={0.94} />
      </mesh>
      <mesh position={[-3.2, 2.1, -4.25]} rotation={[0, -0.18, 0]} name="Left pillar">
        <boxGeometry args={[1.05, 5.1, 0.85]} />
        <meshStandardMaterial color="#958a78" roughness={0.9} />
      </mesh>
      <mesh position={[3.2, 2.1, -4.25]} rotation={[0, 0.18, 0]} name="Right pillar">
        <boxGeometry args={[1.05, 5.1, 0.85]} />
        <meshStandardMaterial color="#958a78" roughness={0.9} />
      </mesh>

      <OverheadLight x={-2.6} z={-1.2} />
      <OverheadLight x={0} z={-2.4} />
      <OverheadLight x={2.6} z={-3.6} />
    </group>
  );
}
