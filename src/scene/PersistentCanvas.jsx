import { Canvas } from "@react-three/fiber";
import { CameraRig } from "./CameraRig";
import { ChapterMarkers } from "./ChapterMarkers";
import { ExperienceDirector } from "../experience/ExperienceDirector";
import { ExperienceAtmosphere } from "../experience/ExperienceAtmosphere";

export function PersistentCanvas() {
  return <div className="persistent-canvas">
    <Canvas camera={{ fov: 50, near: 0.1, far: 100, position: [0, 0, 6] }}
      gl={{ antialias: true }} dpr={[1, 1.5]}>
      <ExperienceDirector />
      <ExperienceAtmosphere />
      <CameraRig />
      <ChapterMarkers />
    </Canvas>
  </div>;
}
