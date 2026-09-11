import { cameraKeyframes as keys } from "./cameraKeyframes.js";

// Time-aware cubic Hermite spline. Shared tangents keep velocity continuous;
// moderate tension limits overshoot without stopping at every spatial extremum.
function tangent(index, field, axis) {
  const before = Math.max(0, index - 1);
  const after = Math.min(keys.length - 1, index + 1);
  const tension = index === 0 || index === keys.length - 1 ? 1 : 0.65;
  return tension * (keys[after][field][axis] - keys[before][field][axis])
    / (keys[after].at - keys[before].at);
}
const tangents = keys.map((_, index) => Object.fromEntries(
  ["position", "lookAt"].map(field => [field, [0, 1, 2].map(axis => tangent(index, field, axis))])
));
export function getCameraTransform(progress, out = { position: [0, 0, 0], lookAt: [0, 0, 0] }) {
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  let index = 0;
  while (index < keys.length - 2 && p > keys[index + 1].at) index++;
  const a = keys[index], b = keys[index + 1], duration = b.at - a.at;
  const t = (p - a.at) / duration, t2 = t * t, t3 = t2 * t;
  for (const field of ["position", "lookAt"]) {
    for (let axis = 0; axis < 3; axis++) {
      out[field][axis] = (2*t3 - 3*t2 + 1) * a[field][axis]
        + (t3 - 2*t2 + t) * duration * tangents[index][field][axis]
        + (-2*t3 + 3*t2) * b[field][axis]
        + (t3 - t2) * duration * tangents[index + 1][field][axis];
    }
  }
  return out;
}
