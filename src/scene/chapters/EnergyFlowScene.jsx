import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, MathUtils, Vector3 } from "three";
import { experienceState } from "../../experience/experienceState";

const STRAND_COUNT = 3;

function makeStrand(strandIndex) {
  const phase = strandIndex * 1.9;
  const baseX = (strandIndex - 1) * 0.22;
  const points = Array.from({ length: 13 }, (_, pointIndex) => {
    const t = pointIndex / 12;
    const z = MathUtils.lerp(-28, 4.2, t);
    const braid = Math.sin(t * Math.PI * 6 + phase) * 0.18;
    const drift = Math.sin(t * Math.PI * 2 + phase * 0.6) * 0.11;
    const lift = 0.5 + Math.cos(t * Math.PI * 5 + phase) * 0.055;
    return new Vector3(baseX + braid + drift, lift, z);
  });
  return new CatmullRomCurve3(points, false, "catmullrom", 0.45);
}

export function EnergyFlowScene({ position }) {
  const pulses = useRef([]);
  const curves = useMemo(
    () => Array.from({ length: STRAND_COUNT }, (_, index) => makeStrand(index)),
    [],
  );

  useFrame(() => {
    const localProgress = experienceState.beats["energy-flow"].localProgress;

    pulses.current.forEach((pulse, index) => {
      if (!pulse) return;
      const pulseProgress = Math.min(0.998, (localProgress + index * 0.14) % 1);
      pulse.position.copy(curves[index].getPointAt(pulseProgress));
      pulse.children[1].intensity = 3.2 + Math.sin(localProgress * Math.PI) * 2.2;
    });
  }, -1);

  return (
    <group position={position} name="Energy flow chapter">
      {curves.map((curve, index) => (
        <group key={index}>
          <mesh name={`Braided energy strand ${index + 1}`}>
            <tubeGeometry args={[curve, 96, 0.032, 6, false]} />
            <meshStandardMaterial
              color="#ff9e36"
              emissive="#ff6a00"
              emissiveIntensity={3.4}
              metalness={0.05}
              roughness={0.42}
              toneMapped={false}
            />
          </mesh>

          <group ref={(pulse) => { pulses.current[index] = pulse; }}>
            <mesh>
              <sphereGeometry args={[0.085, 10, 8]} />
              <meshBasicMaterial color="#ffe2a2" toneMapped={false} />
            </mesh>
            <pointLight color="#ff9e36" intensity={3.2} distance={2.8} decay={2} />
          </group>
        </group>
      ))}
    </group>
  );
}
