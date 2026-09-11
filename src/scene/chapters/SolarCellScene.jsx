import { useLayoutEffect, useRef } from "react";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { CanvasTexture, Color, Fog, MathUtils, Matrix4 } from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { chapters } from "../chapters";
import { scrollState } from "../../scroll/scrollState";

extend({ RoundedBoxGeometry });

const MINERAL = "#e9e6df";
const WIDTH = 2.7;
const HEIGHT = 3.5;
const CELL_WIDTH = 1.265;
const CELL_HEIGHT = 1.095;
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

function SolarEnvironment() {
  const scene = useThree((state) => state.scene);
  const atmosphere = useRef();
  useLayoutEffect(() => {
    const background = scene.background;
    const fog = scene.fog;
    scene.background = new Color(MINERAL);
    atmosphere.current = new Fog(MINERAL, 4.1, 5.2);
    scene.fog = atmosphere.current;
    return () => {
      scene.background = background;
      scene.fog = fog;
      atmosphere.current = null;
    };
  }, [scene]);

  useFrame(() => {
    if (!atmosphere.current) return;
    // Let the existing placeholders emerge as the camera leaves this chapter.
    // This only reads the established progress; it never drives scroll or camera.
    const exit = MathUtils.smoothstep(scrollState.progress * (chapters.length - 1), 0.45, 1);
    atmosphere.current.near = MathUtils.lerp(4.1, 7, exit);
    atmosphere.current.far = MathUtils.lerp(5.2, 32, exit);
  });

  return (
    <>
      {/* Captured once at low resolution; no HDRI requests or live reflections. */}
      <Environment resolution={128} frames={1}>
        <color attach="background" args={["#303638"]} />
        <Lightformer position={[-4, 5, 3]} scale={[5, 7]} intensity={3} color="#fff4e5" />
        <Lightformer position={[4, 1, 4]} scale={[1.5, 6]} intensity={1.5} color="#eef2f2" />
      </Environment>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={MINERAL} roughness={1} envMapIntensity={0.25} />
      </mesh>
    </>
  );
}

export function SolarCellScene({ position }) {
  const aspect = useThree((state) => state.size.width / state.size.height);
  // Local framing only. The authored chapter anchor and the camera stay intact.
  const portrait = aspect < 0.75;
  const scale = Math.min(0.65, Math.max(0.28, aspect * 0.88));
  return (
    <>
      <SolarEnvironment />
      <group position={position} name="Solar cell chapter">
        <group
          position={[portrait ? 0 : 0.25, portrait ? 0.3 : 0.15, 2.2]}
          rotation={[-0.3, -0.48, -0.24]}
          scale={scale}
          name="Photovoltaic module"
        >
          {/* Deliberately still: the existing camera supplies the slow visual rhythm. */}
          <mesh position={[0, 0, -0.075]} name="Dark backing">
            <boxGeometry args={[WIDTH - 0.03, HEIGHT - 0.03, 0.035]} />
            <meshStandardMaterial {...MATERIALS.backing} />
          </mesh>
          <mesh position={[0, 0, -0.028]} name="Edge seal">
            <boxGeometry args={[WIDTH - 0.04, HEIGHT - 0.04, 0.045]} />
            <meshStandardMaterial {...MATERIALS.gasket} />
          </mesh>
          <SiliconCells />
          <ContactGrid />
          <AluminiumFrame />
          <mesh position={[0, 0, 0.06]} name="Front glass" renderOrder={2}>
            <boxGeometry args={[WIDTH - 0.055, HEIGHT - 0.055, 0.012]} />
            <meshPhysicalMaterial {...MATERIALS.glass} />
          </mesh>
        </group>
      </group>
    </>
  );
}
