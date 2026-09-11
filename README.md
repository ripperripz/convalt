# Convalt — scroll skeleton

This is Step 1-2 of the build plan: a working, verified scroll → camera
pipeline with placeholder geometry. It runs and builds as-is (checked with
`npm install && npm run build` before hand-off). Nothing here is final art —
its only job is to prove the architecture before any shaders or models are
touched.

## Run it

```bash
npm install
npm run dev
```

Open the printed localhost URL and scroll. You should see:
- The camera moving smoothly through 6 colored placeholder boxes as you scroll
- A text label + one line of copy fading in/out in the bottom-left, in sync
  with whichever box the camera is nearest

If that's smooth, the skeleton is proven. Everything from here is additive.

## How it's wired

```
App.jsx
 ├─ PersistentCanvas.jsx   → fixed, full-viewport <Canvas>, never unmounts
 │   ├─ CameraRig.jsx      → reads scrollState every frame, damps camera toward it
 │   └─ ChapterMarkers.jsx → placeholder boxes (REPLACE THESE ONE AT A TIME)
 ├─ ChapterOverlay.jsx     → fixed DOM text, fades by chapter via direct DOM writes
 └─ ScrollSpacer.jsx       → tall invisible 100vh×6 track that creates scroll height

scroll/useScrollRig.js     → Lenis + GSAP ScrollTrigger, writes into scrollState
scroll/scrollState.js      → plain mutable object, the single source of truth
scene/chapters.js          → the narrative: waypoints + copy for all 6 chapters
scene/cameraPath.js        → pure function: progress (0-1) → camera transform
```

The key design decision: **scroll progress lives in one plain JS object
(`scrollState`), not React state.** Both the camera rig and the DOM overlay
read it directly in their own per-frame loops. This is the pattern used by
Lusion's WebGL Scroll Sync and 14islands' r3f-scroll-rig — it's what keeps
scroll buttery at 60fps instead of re-rendering the whole React tree on
every tick.

## Next steps, in order

1. **Clone the 5 reference repos** into `/references` (not included here —
   pull them fresh so you get current versions):
   ```bash
   mkdir references
   git clone https://github.com/brunosimon/folio-2025 references/01-bruno-folio
   git clone https://github.com/lusionltd/WebGL-Scroll-Sync references/02-lusion-scroll-sync
   git clone https://github.com/14islands/r3f-scroll-rig references/03-r3f-scroll-rig
   git clone https://github.com/basementstudio/scrollytelling references/04-basement-scrollytelling
   git clone https://github.com/pmndrs/react-three-next references/05-react-three-next
   ```

2. **Hand this exact prompt to Codex:**

   > Inspect only `/references`. Do not touch `/src` yet. Analyze: (1) persistent
   > canvas architecture, (2) scroll-progress → camera interpolation, (3) chapter
   > lifecycle for scene transitions, (4) DOM/WebGL sync. Write
   > `REFERENCE_ANALYSIS.md` naming which pattern from which repo we should
   > adopt directly vs. reimplement vs. skip, given that our own scroll rig in
   > `/src/scroll` and `/src/scene/CameraRig.jsx` already works. Then propose
   > any improvements to our existing camera-path/chapter architecture — do
   > not propose replacing it wholesale.

3. **Replace one chapter at a time**, easiest to hardest, in
   `ChapterMarkers.jsx`:
   1. Hero solar cell — `Environment` + `Lightformer` + `MeshTransmissionMaterial` (all from `@react-three/drei`, already installed)
   2. Solar field — `InstancedMesh` of one panel model
   3. Manufacturing / data center — boxes + emissive strips + `MeshReflectorMaterial`
   4. Energy pulse/tunnel — `TubeGeometry` + emissive + Bloom (`@react-three/postprocessing`, not yet installed — add when you get here)
   5. Transitions between chapters — cross-fade pattern from Lusion/Shader.se

   Give Codex one chapter per prompt, e.g.: *"Replace the `solar-cell` chapter
   in ChapterMarkers.jsx with real geometry using drei's Environment,
   Lightformer, and MeshTransmissionMaterial. Use a Poly Haven HDRI for the
   environment map. Keep every other chapter untouched."*

4. **Real assets** — pull HDRIs/materials from Poly Haven, test models from
   the Khronos glTF Sample Assets repo, and run anything you download through
   `gltfjsx` before importing:
   ```bash
   npx gltfjsx model.glb --transform
   ```

5. **2D inner pages** (Projects/Team/Media/Contact) — add React Router,
   keep `<PersistentCanvas />` mounted at the App root so it survives route
   changes (this is exactly what `react-three-next` demonstrates), and just
   don't render `ChapterOverlay`/`ScrollSpacer` on those routes.

6. **Polish pass, last 10% of time only** — Bloom + subtle noise + vignette
   (nothing more), verify `prefers-reduced-motion` (already partially wired
   in `styles.css`), test on a real mid-range phone, freeze any Leva-tuned
   values into constants before shipping.

## What to deliberately not do

No WebGPU, no Houdini, no physics engine, no custom renderer, no fluid
simulation. The reference doc that led to this scaffold calls these out
explicitly — they're excellent to look at, not to build with, under a
deadline.
