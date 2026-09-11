import { chapters } from "./chapters";
import { SceneGate } from "../experience/ExperienceDirector";
import { SolarCellScene } from "./chapters/SolarCellScene";
import { SolarFieldScene } from "./chapters/SolarFieldScene";
import { DataCenterScene } from "./chapters/DataCenterScene";
import { EnergyFlowScene } from "./chapters/EnergyFlowScene";
import { TunnelScene } from "./chapters/TunnelScene";
import { ManufacturingScene } from "./chapters/ManufacturingScene";

const scenes = {
  manufacturing: [ManufacturingScene, "manufacturing"],
  "solar-field": [SolarFieldScene, "solarField"],
  "energy-flow": [EnergyFlowScene, "energyFlow"],
  tunnel: [TunnelScene, "tunnel"],
  data: [DataCenterScene, "data"],
};
export function ChapterMarkers() {
  return <group>
    {chapters.map(chapter => {
      // One panel instance shared by hero, exploded and recycling gates.
      if (chapter.id === "hero") return <SolarCellScene key={chapter.id} position={chapter.lookAt} />;
      const entry = scenes[chapter.id];
      if (!entry) return null;
      const [Scene, sceneId] = entry;
      return <SceneGate key={chapter.id} sceneId={sceneId}>
        <Scene position={chapter.lookAt} />
      </SceneGate>;
    })}
  </group>;
}
