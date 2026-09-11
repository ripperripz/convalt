import { chapters } from "./chapters";

const lerp = (a, b, t) => a + (b - a) * t;
const lerpVec3 = (a, b, t) => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

// Splits progress (0-1) into N-1 segments between consecutive chapter
// waypoints and linearly interpolates within the active segment.
// Replace this with a THREE.CatmullRomCurve3 sampled from a real Blender
// camera path once one exists — the call signature (progress in, transform
// out) stays the same, so nothing else has to change.
export function getCameraTransform(progress) {
  const segmentCount = chapters.length - 1;
  const scaled = Math.min(progress, 0.9999) * segmentCount;
  const index = Math.floor(scaled);
  const localT = scaled - index;

  const from = chapters[index];
  const to = chapters[Math.min(index + 1, chapters.length - 1)];

  return {
    position: lerpVec3(from.position, to.position, localT),
    lookAt: lerpVec3(from.lookAt, to.lookAt, localT),
  };
}
