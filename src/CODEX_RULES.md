# CODEX_RULES.md — read this before every task, do not ask for re-confirmation

## Protected files — never modify without an explicit, separate instruction
```
src/scroll/scrollState.js
src/scroll/useScrollRig.js
src/scene/cameraPath.js
src/scene/CameraRig.jsx
```
`src/scene/chapters.js` is DATA and may be edited to adjust waypoint positions,
copy, or add/remove chapters — this is not the same as touching the engine
above, which reads that data generically and needs no changes when it does.

All chapter-specific work happens inside `src/scene/ChapterMarkers.jsx` (or
scene components it renders), one chapter per task.

## Reference material — read once, don't re-scan
- `REFERENCE_ANALYSIS.md` contains the full write-up of the 5 cloned repos.
  Do NOT open, search, or re-read anything under `/references` — that folder
  has been moved outside this project specifically to stop it being
  re-ingested into context on every task. Everything needed from it is
  already distilled into REFERENCE_ANALYSIS.md.
- `/reference-frames` contains 8 labeled stills from CONVALT_CONCEPT.mp4, one
  per narrative beat. Use the still matching the chapter you're building as
  the visual target — you do not need to re-watch the full video per task.
- The small on-screen HUD text in the concept video/frames (tiny corner
  labels, timestamps) is AI-video-generation artifact and mostly illegible.
  Do not attempt to transcribe or replicate it literally. Keep only the
  motif — thin corner brackets, a small metadata-style label, a progress
  indicator — using real copy from `chapters.js`. Large captions like
  "POWER FLOWS" or "POWERED BY SUN" ARE legible and are a fair model for
  tone/format, not verbatim text to reuse as-is.

## Visual direction — decided, do not re-litigate
- Hero (`hero-cell`): solar-void/dawn atmosphere, not an architectural room.
  Warm ivory-to-pale-gold gradient, one large soft sun disc (emissive
  sphere or billboard) with a glow halo, subtle haze/fog, a small amount of
  floating dust (Drei `Sparkles`, low count). No literal starfield, no
  galaxy, no lens-flare spam.
- Manufacturing (`manufacturing`): THIS is where warm architectural
  materials belong (travertine/concrete-toned surfaces, soft overhead
  panel lighting) — see `/reference-frames/03-manufacturing.png`.
- Amber energy motif: established visually as sunlight in the hero, reused
  as the energy trail/tunnel/facade-trace color throughout. Keep one
  consistent amber (~`#ff9e36` core, `#ff6a00` emissive) across all chapters
  rather than inventing a new accent per scene.
- Palette otherwise: graphite / aluminium / warm off-white. No neon, no
  SaaS-card gradients, no glassmorphism, no videogame HUD density.

## Explicitly excluded techniques — do not reach for these regardless of task
- No ShaderMaterial / custom GLSL, for any effect including the recycling
  dissolve. Use instanced fragment geometry that appears past a scroll
  threshold instead.
- No imported/sourced GLB for the manufacturing robot arms. Build them from
  primitives (cylinders + sphere joints + a box claw) animated via
  GSAP/useFrame rotation on shoulder/elbow/wrist. This removes asset
  licensing and rigging risk entirely.
- No WebGPU, Houdini, physics engine, fluid simulation, Gaussian splats,
  custom renderer, raymarching, or volumetric cloud simulation.
- No Drei `ScrollControls`, no React state for per-frame scroll values.

## Model and reasoning-effort selection
Default to the cheaper/faster model tier (Sol or equivalent) at LOW or
MEDIUM reasoning for all tasks below — these are bounded implementation
against an already-agreed visual reference, not open design decisions:
```
solar field (InstancedMesh)        Sol, Low
exploded panel animation           Sol, Low
data center                        Sol, Low
hero atmosphere (sun/gradient/fog) Sol, Low
energy trail / tunnel bolt         Sol, Medium
manufacturing (procedural arms)    Sol, Medium
recycling crumble                  Sol, Medium
2D inner pages, CSS, copy          Sol/Terra, Low
```
Escalate to the expensive/flagship tier ONLY for: an unexplained rendering
bug that survives one attempted fix, scroll/camera sync breaking, or a
genuine architecture question that requires changing a protected file.
Never use the flagship tier or high reasoning for moving an object,
writing an InstancedMesh, or tuning a material value.

## Task discipline
- One chapter/scene per task. Do not accept "build the full experience" as
  a single task — split it yourself if asked to.
- If a task isn't converging in one pass (repeated edits without visible
  progress toward the stated done-condition), STOP and report what's
  blocking rather than continuing to iterate blind. You cannot see the
  rendered browser — the human is the visual feedback loop; ask for a
  screenshot and specific numeric feedback rather than guessing again.
- Report back after each task: what was built, what deviated from scope
  (if anything), and confirmation that protected files were untouched
  (unless the task explicitly authorized touching one).