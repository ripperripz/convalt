import { chapters } from "./chapters";
import { SolarCellScene } from "./chapters/SolarCellScene";

// Deliberately dumb placeholder geometry. The point of this scaffold is to
// prove the scroll → camera pipeline works BEFORE any art is attempted.
// Replace each <mesh> with the real chapter scene (solar cell, factory line,
// instanced panel field, etc.) one at a time, per the build plan — never all
// at once.
export function ChapterMarkers() {
  return (
    <group>
      {chapters.map((chapter) => chapter.id === "solar-cell" ? (
        <SolarCellScene key={chapter.id} position={chapter.lookAt} />
      ) : (
        <mesh key={chapter.id} position={chapter.lookAt}>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial color={chapter.color} />
        </mesh>
      ))}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} />
    </group>
  );
}
