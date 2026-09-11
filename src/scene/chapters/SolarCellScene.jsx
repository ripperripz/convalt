import { useLayoutEffect, useMemo, useRef } from "react";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { CanvasTexture, Color, MathUtils, Matrix4, Object3D } from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { experienceState } from "../../experience/experienceState";
import { SceneGate } from "../../experience/ExperienceDirector";

extend({ RoundedBoxGeometry });

const WIDTH = 2.7;
const HEIGHT = 3.5;
const CELL_WIDTH = 1.265;
const CELL_HEIGHT = 1.095;
// Keep this as the single desktop/mobile tuning point when device degradation is added.
const RECYCLING_FRAGMENT_COUNT = 84;
const CELLS = Array.from({ length: 6 }, (_, i) => [
  (i % 2 === 0 ? -1 : 1) * 0.644,
  (1 - Math.floor(i / 2)) * 1.116,
  0.022,
]);

// Stable, shared material descriptions; R3F owns and disposes their instances.
const MATERIALS = {
  silicon: { color: "#111b22", metalness: 0.32, roughness: 0.3, envMapIntensity: 0.65 },
  aluminium: { color: "#a6a7a4", metalness: 0.86, roughness: 0.38, envMapIntensity: 0.9 },
  contacts: { color: "#626966", metalness: 0.7, roughness: 0.48, envMapIntensity: 0.55 },
  backing: { color: "#242725", metalness: 0.12, roughness: 0.66 },
  gasket: { color: "#0e1213", metalness: 0.05, roughness: 0.8 },
  glass: {
    color: "#e7eeec", metalness: 0, roughness: 0.16,
    transmission: 0, transparent: true, opacity: 0.07,
    ior: 1.5, clearcoat: 1, clearcoatRoughness: 0.2,
    envMapIntensity: 1.1, depthWrite: false,
  },
};

function ContactGrid() {
  const mesh = useRef();
  const gl = useThree((state) => state.gl);

  useLayoutEffect(() => {
    // One mipmapped mask shared by six contact planes prevents fine-wire shimmer.
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const context = canvas.getContext("2d");
    context.fillStyle = "black";
    context.fillRect(0, 0, 512, 512);
    context.fillStyle = "#909090";
    for (let row = 0; row < 36; row++) {
      context.fillRect(10, 12 + row * 13.5, 492, 1);
    }
    context.fillStyle = "#cccccc";
    for (const x of [112, 256, 400]) context.fillRect(x, 10, 2, 492);

    const texture = new CanvasTexture(canvas);
    texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    const material = mesh.current.material;
    material.alphaMap = texture;
    material.needsUpdate = true;
    CELLS.forEach(([x, y], index) => {
      mesh.current.setMatrixAt(index, new Matrix4().makeTranslation(x, y, 0.041));
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
    return () => {
      material.alphaMap = null;
      texture.dispose();
    };
  }, [gl]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, CELLS.length]} name="Solar contacts" renderOrder={1}>
      <planeGeometry args={[CELL_WIDTH, CELL_HEIGHT]} />
      <meshStandardMaterial {...MATERIALS.contacts} transparent depthWrite={false} />
    </instancedMesh>
  );
}

function SiliconCells() {
  const mesh = useRef();
  useLayoutEffect(() => {
    CELLS.forEach((position, index) => {
      mesh.current.setMatrixAt(index, new Matrix4().makeTranslation(...position));
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, []);
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, CELLS.length]} name="Silicon wafers">
      <roundedBoxGeometry args={[CELL_WIDTH, CELL_HEIGHT, 0.032, 1, 0.012]} />
      <meshStandardMaterial {...MATERIALS.silicon} />
    </instancedMesh>
  );
}

function AluminiumFrame() {
  const mesh = useRef();
  useLayoutEffect(() => {
    const bars = [
      [-WIDTH / 2, 0, 0, 1],
      [WIDTH / 2, 0, 0, 1],
      [0, -HEIGHT / 2, Math.PI / 2, (WIDTH + 0.038) / HEIGHT],
      [0, HEIGHT / 2, Math.PI / 2, (WIDTH + 0.038) / HEIGHT],
    ];
    bars.forEach(([x, y, rotation, length], i) => {
      const matrix = new Matrix4().makeRotationZ(rotation);
      matrix.multiply(new Matrix4().makeScale(1, length, 1));
      matrix.setPosition(x, y, -0.018);
      mesh.current.setMatrixAt(i, matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, []);
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 4]} name="Aluminium perimeter">
      <roundedBoxGeometry args={[0.038, HEIGHT, 0.13, 2, 0.009]} />
      <meshStandardMaterial {...MATERIALS.aluminium} />
    </instancedMesh>
  );
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function RecyclingFragments() {
  const mesh = useRef();
  const dummy = useMemo(() => new Object3D(), []);
  const fragments = useMemo(() => {
    const random = seededRandom(8041);
    return Array.from({ length: RECYCLING_FRAGMENT_COUNT }, () => {
      const inward = Math.pow(random(), 1.65);
      const size = 0.035 + random() * 0.085;
      return {
        origin: [
          -WIDTH / 2 + inward * 0.72,
          HEIGHT / 2 - random() * 2.05,
          0.02 + (random() - 0.5) * 0.1,
        ],
        drift: [
          -(0.24 + random() * 0.76),
          (random() - 0.42) * 0.62,
          (random() - 0.5) * 0.72,
        ],
        rotation: [random() * Math.PI, random() * Math.PI, random() * Math.PI],
        spin: [(random() - 0.5) * 3, (random() - 0.5) * 3, (random() - 0.5) * 3],
        scale: [size * (0.65 + random()), size * (0.55 + random()), size * (0.45 + random())],
        threshold: MathUtils.clamp(inward * 0.74 + random() * 0.18, 0, 0.92),
        color: ["#15232c", "#303535", "#8b8b84"][Math.floor(random() * 3)],
      };
    });
  }, []);

  useLayoutEffect(() => {
    fragments.forEach((fragment, index) => {
      mesh.current.setColorAt(index, new Color(fragment.color));
    });
    mesh.current.instanceColor.needsUpdate = true;
  }, [fragments]);

  useFrame(() => {
    const localProgress = experienceState.beats.recycling.localProgress;
    fragments.forEach((fragment, index) => {
      const reveal = MathUtils.smootherstep(localProgress, fragment.threshold, Math.min(1, fragment.threshold + 0.2));
      dummy.position.set(
        fragment.origin[0] + fragment.drift[0] * reveal,
        fragment.origin[1] + fragment.drift[1] * reveal - reveal * reveal * 0.24,
        fragment.origin[2] + fragment.drift[2] * reveal,
      );
      dummy.rotation.set(
        fragment.rotation[0] + fragment.spin[0] * reveal,
        fragment.rotation[1] + fragment.spin[1] * reveal,
        fragment.rotation[2] + fragment.spin[2] * reveal,
      );
      const visibleScale = MathUtils.smootherstep(reveal, 0, 0.18);
      dummy.scale.set(
        fragment.scale[0] * visibleScale,
        fragment.scale[1] * visibleScale,
        fragment.scale[2] * visibleScale,
      );
      dummy.updateMatrix();
      mesh.current.setMatrixAt(index, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  }, -1);

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, RECYCLING_FRAGMENT_COUNT]}
      frustumCulled={false}
      name="Recycling edge fragments"
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial vertexColors metalness={0.22} roughness={0.68} />
    </instancedMesh>
  );
}

export function HeroAtmosphereGeometry() {
  return (
    <>
      <hemisphereLight color="#fff3d9" groundColor="#aa8250" intensity={0.55} />
      <directionalLight position={[-4, 5, 3]} color="#ffe3ad" intensity={1.35} />
      <Sparkles
        count={24}
        scale={[10, 6, 5]}
        position={[0, 0.4, 0.5]}
        size={0.7}
        speed={0.08}
        opacity={0.22}
        color="#f8dfb0"
        noise={0.25}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#dfc89e" roughness={1} />
      </mesh>
    </>
  );
}

export function SolarCellScene({ position }) {
  const aspect = useThree((state) => state.size.width / state.size.height);
  const portrait = aspect < 0.75;
  const scale = Math.min(0.65, Math.max(0.28, aspect * 0.88));
  const module = useRef();
  const backingLayer = useRef();
  const gasketLayer = useRef();
  const cellLayer = useRef();
  const contactLayer = useRef();
  const frameLayer = useRef();
  const glassLayer = useRef();
  const glassMaterial = useRef();
  const seamLights = useRef([]);

  useFrame(() => {
    const exploded = experienceState.beats.exploded;
    const separation = MathUtils.smootherstep(exploded.localProgress, 0.04, 0.65)
      * (1 - MathUtils.smootherstep(exploded.localProgress, 0.82, 1));

    backingLayer.current.position.z = MathUtils.lerp(0, -0.92, separation);
    gasketLayer.current.position.z = MathUtils.lerp(0, -0.54, separation);
    cellLayer.current.position.z = MathUtils.lerp(0, -0.1, separation);
    contactLayer.current.position.z = MathUtils.lerp(0, 0.34, separation);
    frameLayer.current.position.z = MathUtils.lerp(0, -0.38, separation);
    glassLayer.current.position.z = MathUtils.lerp(0, 1.16, separation);
    glassMaterial.current.opacity = MathUtils.lerp(0.07, 0.2, separation);

    const lightIntensity = Math.sin(separation * Math.PI) * 2.6 + separation * 1.1;
    seamLights.current.forEach((light) => {
      if (light) light.intensity = lightIntensity;
    });

    const recyclingProgress = MathUtils.smootherstep(experienceState.beats.recycling.localProgress, 0, 1);
    const targetScale = portrait ? 1.45 : 2.05;
    const currentScale = MathUtils.lerp(scale, targetScale, recyclingProgress);
    module.current.scale.setScalar(currentScale);
    module.current.position.set(
      MathUtils.lerp(portrait ? 0 : 0.25, 0, recyclingProgress),
      MathUtils.lerp(portrait ? 0.3 : 0.15, 0, recyclingProgress),
      MathUtils.lerp(2.2, 0, recyclingProgress),
    );
    module.current.rotation.set(
      MathUtils.lerp(-0.3, -0.08, recyclingProgress),
      MathUtils.lerp(-0.48, -2.45, recyclingProgress),
      MathUtils.lerp(-0.24, -0.18, recyclingProgress),
    );
  }, -1);

  // Local framing only. The authored chapter anchor and the camera stay intact.
  return (
    <>
      <SceneGate sceneId="heroAtmosphere"><HeroAtmosphereGeometry /></SceneGate>
      <SceneGate sceneId="panel">
      <group position={position} name="Solar cell chapter">
        <group
          ref={module}
          position={[portrait ? 0 : 0.25, portrait ? 0.3 : 0.15, 2.2]}
          rotation={[-0.3, -0.48, -0.24]}
          scale={scale}
          name="Photovoltaic module"
        >
          <group ref={backingLayer}>
            <mesh position={[0, 0, -0.075]} name="Dark backing">
              <boxGeometry args={[WIDTH - 0.03, HEIGHT - 0.03, 0.035]} />
              <meshStandardMaterial {...MATERIALS.backing} />
            </mesh>
          </group>
          <group ref={gasketLayer}>
            <mesh position={[0, 0, -0.028]} name="Edge seal">
              <boxGeometry args={[WIDTH - 0.04, HEIGHT - 0.04, 0.045]} />
              <meshStandardMaterial {...MATERIALS.gasket} />
            </mesh>
          </group>
          <group ref={cellLayer}>
            <SiliconCells />
          </group>
          <group ref={contactLayer}>
            <ContactGrid />
            {[
              [-1.08, -1.58, 0.2],
              [-0.36, -1.58, 0.2],
              [0.36, -1.58, 0.2],
              [1.08, -1.58, 0.2],
            ].map((lightPosition, index) => (
              <pointLight
                key={lightPosition[0]}
                ref={(light) => { seamLights.current[index] = light; }}
                position={lightPosition}
                color="#ff9e36"
                intensity={0}
                distance={0.9}
                decay={2}
              />
            ))}
          </group>
          <group ref={frameLayer}>
            <AluminiumFrame />
          </group>
          <group ref={glassLayer}>
            <mesh position={[0, 0, 0.06]} name="Front glass" renderOrder={2}>
              <boxGeometry args={[WIDTH - 0.055, HEIGHT - 0.055, 0.012]} />
              <meshPhysicalMaterial ref={glassMaterial} {...MATERIALS.glass} />
            </mesh>
          </group>
          <SceneGate sceneId="recycling"><RecyclingFragments /></SceneGate>
        </group>
      </group>
      </SceneGate>
    </>
  );
}
