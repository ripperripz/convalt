// Authored beat windows; overlaps are deliberate transition intervals.
export const timeline = [
  { id: "hero", start: 0, end: 0.16, theme: "light" },
  { id: "exploded", start: 0.12, end: 0.29, theme: "light" },
  { id: "manufacturing", start: 0.25, end: 0.43, theme: "light" },
  { id: "solar-field", start: 0.39, end: 0.55, theme: "light" },
  { id: "energy-flow", start: 0.51, end: 0.68, theme: "light" },
  { id: "tunnel", start: 0.64, end: 0.81, theme: "dark" },
  { id: "data", start: 0.77, end: 0.91, theme: "dark" },
  { id: "recycling", start: 0.87, end: 1, theme: "light" },
];

// Shared objects stay mounted once; only these windows permit rendering.
export const sceneBeats = {
  panel: ["hero", "exploded", "recycling"],
  heroAtmosphere: ["hero", "exploded"],
  manufacturing: ["manufacturing"],
  solarField: ["solar-field", "energy-flow"],
  energyFlow: ["energy-flow"],
  tunnel: ["tunnel"],
  data: ["tunnel", "data"], // The tunnel opening intentionally reveals data.
  recycling: ["recycling"],
};
export const clamp01 = (value) => Math.max(0, Math.min(1, value));
export const smooth = (value) => { const t = clamp01(value); return t * t * (3 - 2 * t); };

export function createTimelineState() {
  return {
    progress: NaN, activeBeat: "hero", activeIndex: 0, theme: "light", darkWeight: 0,
    beats: Object.fromEntries(timeline.map(({ id }) => [id, { localProgress: 0, weight: 0, visible: false }])),
    scenes: Object.fromEntries(Object.keys(sceneBeats).map(id => [id, { weight: 0, visible: false }])),
  };
}

// Resolver shared by WebGL and DOM; reuses output objects without React state.
export function resolveTimeline(progress, out) {
  const p = Number.isFinite(progress) ? clamp01(progress) : 0;
  if (out.progress === p) return out;
  out.progress = p;
  let maximum = -1;
  out.darkWeight = 0;
  timeline.forEach((beat, index) => {
    const previous = timeline[index - 1];
    const next = timeline[index + 1];
    const state = out.beats[beat.id];
    state.localProgress = clamp01((p - beat.start) / (beat.end - beat.start));
    const inside = p >= beat.start && (p < beat.end || (index === timeline.length - 1 && p === 1));
    const enter = previous ? smooth((p - beat.start) / (previous.end - beat.start)) : 1;
    const leave = next ? 1 - smooth((p - next.start) / (beat.end - next.start)) : 1;
    state.weight = inside ? Math.min(enter, leave) : 0;
    state.visible = state.weight > 0;
    if (state.weight >= maximum) {
      maximum = state.weight; out.activeBeat = beat.id; out.activeIndex = index; out.theme = beat.theme;
    }
    if (beat.theme === "dark") out.darkWeight += state.weight;
  });
  for (const [id, beats] of Object.entries(sceneBeats)) {
    const state = out.scenes[id];
    state.weight = Math.min(1, beats.reduce((sum, beat) => sum + out.beats[beat].weight, 0));
    state.visible = state.weight > 0;
  }
  return out;
}
