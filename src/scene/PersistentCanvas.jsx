//import { Canvas } from "@react-three/fiber";
//import { CameraRig } from "./CameraRig";
//import { ChapterMarkers } from "./ChapterMarkers";

// This canvas is fixed and full-viewport, sitting behind the scrollable DOM
// content (see styles.css). It is mounted once in App.jsx and stays alive
// for the whole session — this is the "persistent canvas" pattern from
// react-three-next / r3f-scroll-rig, and it's what lets the 3D home hero
// and the 2D inner pages share one WebGL context instead of tearing it down
// and rebuilding it on every navigation.
//export function PersistentCanvas() {
//return (
//<div className="persistent-canvas">
//<Canvas
//camera={{ fov: 50, near: 0.1, far: 100, position: [0, 0, 6] }}
//gl={{ antialias: true }}
//dpr={[1, 2]}
//>
//<CameraRig />
//<ChapterMarkers />
//</Canvas>
//</div>
//);
//}


import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { CameraRig } from "./CameraRig";
import { ChapterMarkers } from "./ChapterMarkers";

const BACKGROUND_COLOR = "#e9e5db";

// Fixed full-viewport WebGL canvas shared by the 3D homepage and 2D routes.
// The existing camera / scroll architecture remains untouched.
export function PersistentCanvas() {
  return (
    <div className="persistent-canvas">
      <Canvas
        camera={{
          fov: 50,
          near: 0.1,
          far: 100,
          position: [0, 0, 6],
        }}
        gl={{
          antialias: true,
        }}
        dpr={[1, 1.5]}
      >
        {/* Keep the WebGL background and atmospheric fog visually unified. */}
        <color attach="background" args={[BACKGROUND_COLOR]} />

        {/* Atmospheric depth. Tune near/far later once all chapter geometry exists. */}
        <fog
          attach="fog"
          args={[BACKGROUND_COLOR, 8, 30]}
        />

        {/*
          Temporary neutral studio environment.

          Used primarily for:
          - readable aluminium reflections
          - subtle solar-glass reflections
          - better material separation

          Replace with a local Poly Haven HDRI later only if necessary.
        */}
        <Environment
          preset="studio"
          background={false}
          environmentIntensity={0.8}
        />

        {/*
          Deliberate warm key/rim light.

          Keep this simple. Do not add a collection of point lights
          independently inside every chapter.
        */}
        <directionalLight
          position={[-4, 4, -5]}
          intensity={1.1}
          color="#fff4e0"
        />

        {/* Very restrained fill so shadow-facing surfaces do not disappear. */}
        <ambientLight
          intensity={0.15}
          color="#f4efe5"
        />

        {/* Existing protected architecture */}
        <CameraRig />
        <ChapterMarkers />
      </Canvas>
    </div>
  );
}