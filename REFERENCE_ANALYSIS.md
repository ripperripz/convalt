# Convalt reference analysis

Date: 2026-09-11. Scope: repository inspection and recommendations only. No production implementation.

## Decision

Keep Convalt's existing persistent R3F Canvas, Lenis/GSAP integration, mutable `scrollState`, centralized chapter data, camera interpolation and DOM overlay. Replace scene content incrementally beneath `ChapterMarkers` in later tasks. None of these references justifies replacing the working scaffold.

The most valuable transferable ideas are staged resource loading, shared materials, instancing, restrained light/fog direction, deterministic animation ranges, DOM remaining responsible for editorial content, and measured quality tiers. The references are engineering references, not visual templates for Convalt.

## Repositories and inspection boundaries

All five requested repositories were successfully cloned from their specified GitHub remotes, with history, into the following directories. Earlier numbered checkouts (`01-bruno-folio` through `05-react-three-next`) were already present and were left intact. The fresh checkouts below are the analysis baseline; Bruno's earlier checkout was also inspected and has the same commit.

| Repository | Local directory under `references/` | Inspected HEAD |
|---|---|---|
| [Bruno Simon Folio](https://github.com/brunosimon/folio-2025) | `folio-2025` | `41046b57eeed8d156d9c3fd7fa259900baef7816` |
| [Lusion WebGL Scroll Sync](https://github.com/lusionltd/WebGL-Scroll-Sync) | `WebGL-Scroll-Sync` | `d2f2c844b449878c760e3f435ab01c85ed5ee072` |
| [14islands r3f-scroll-rig](https://github.com/14islands/r3f-scroll-rig) | `r3f-scroll-rig` | `123663599e4b31af56f1845a19132d17e6a9b81f` |
| [Basement Scrollytelling](https://github.com/basementstudio/scrollytelling) | `scrollytelling` | `0c26959b106d9e81931c30af7dfeebfd83d0a379` |
| [React Three Next](https://github.com/pmndrs/react-three-next) | `react-three-next` | `bb29a61949601e1c563688faf33a12d062ec3710` |

Evidence consists of local source, repository documentation, manifests and license files at these commits. Reference applications were not installed, built or benchmarked. Absence means no implemented technique was found in the inspected source for that category; external demo links and dependency capabilities are not counted as implementations. Montfort / Immersive Garden is treated as the supplied art-direction brief; no claim is made about that site's internal implementation.

All reference paths in the matrices are relative to the corresponding repository directory above. Function/component names are given where a relevant implementation exists. For absent categories, the inspected boundary is named rather than inventing a component.

Classifications:

- **ADOPT DIRECTLY**: retain an already matching pattern or use an isolated, compatible API/practice when later authorized. This does not mean importing repository code or adding a framework now.
- **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE**: transfer the principle into existing R3F scene children, consuming existing state. Do not transplant its scheduler, store, renderer or camera.
- **SKIP**: absent, unnecessary, incompatible or outside the explicit constraints.

## Existing Convalt scaffold

| Exact file / symbol | Observed behavior | Consequence for later visual work |
|---|---|---|
| `src/App.jsx` / `App` | Mounts `PersistentCanvas`, `ChapterOverlay`, `ScrollSpacer`; invokes `useScrollRig`. | Preserve the application shell and mounting order. |
| `src/scene/PersistentCanvas.jsx` / `PersistentCanvas` | One R3F `Canvas`, antialiasing, DPR `[1,2]`, FOV 50, near 0.1, far 100. | No additional canvases, scene render loops, or default cameras. |
| `src/scroll/useScrollRig.js` / `useScrollRig` | Lenis runs from GSAP ticker; Lenis events update ScrollTrigger; one trigger writes progress and chapter index; cleanup removes ticker and trigger. | All future chapter animation reads this progress. No second Lenis, scroll container or ScrollTrigger. |
| `src/scroll/scrollState.js` / `scrollState` | Mutable `{progress, chapterIndex}`. | Keep per-frame animation out of React state. Scene consumers must not write back to it. |
| `src/scene/chapters.js` / `chapters` | Six ordered entries with IDs, text, position, lookAt and placeholder color. | This remains the narrative authority; visual components are keyed by these IDs. |
| `src/scene/cameraPath.js` / `getCameraTransform` | Progress samples five linear segments between six waypoints; upper bound is clamped to 0.9999. | Compose objects for this actual path. Do not replace it with a spline or a reference camera. |
| `src/scene/CameraRig.jsx` / `CameraRig` | `useFrame` reads shared progress; delta-aware `MathUtils.damp` moves camera and look-at target with damping 4. | No competing camera animations, OrbitControls or `makeDefault` camera. |
| `src/scene/ChapterMarkers.jsx` / `ChapterMarkers` | Six boxes at `chapter.lookAt`, ambient and directional light. | Primary seam for future scene components and shared visual resources. |
| `src/dom/ChapterOverlay.jsx` / `ChapterOverlay` | Separate rAF reads the shared chapter index and imperatively updates copy styles. | Keep typography and content in DOM; do not replace them with WebGL text. |
| `src/dom/ScrollSpacer.jsx`, `src/styles.css` | Six 100vh sections supply scroll height; Canvas and copy are fixed. | Do not transplant DOM-tracked screen-plane layout or change scroll geometry. |

Important observations, not requests to fix the scaffold:

1. The copy index divides progress into **six** equal ranges; camera waypoints span **five** segments. For example, waypoint 1 is at approximately 0.2 while copy chapter 1 starts at 1/6. Future visual timing must acknowledge both existing mappings, rather than assuming camera arrival equals a copy change. Do not alter either mapping in this task.
2. The narrative contains six records. Recycling already looks toward the first cell at `[0,0,0]`, but the camera does not return to its initial position. The smallest circular ending is a visual reappearance/reformation of the original cell, not a seventh chapter or a seamless camera loop.
3. Reduced-motion CSS disables copy transitions. The inspected Lenis hook does not actually query the OS reduced-motion preference despite its comment. Scene-local secondary animation can respect that preference later; a complete scroll-motion change would require separate scope.
4. There is no router implemented yet. Canvas persistence is currently an application-mount property; cross-route behavior has not been tested.
5. No resource manifest, asset loader, fog, environment map, instancing, postprocessing or performance instrumentation is currently implemented. These are future visual needs, not reasons to restructure the engine.

## 1. Bruno Simon Folio 2025

**Key distinction:** this commit uses `three/webgpu`, TSL node materials and `WebGPURenderer` with `forceWebGL: false`. Even forcing that renderer's fallback would introduce a different rendering architecture. Use principles only where they can be implemented with Convalt's existing WebGL renderer.

| # / Topic | Exact source and concrete technique | Classification and Convalt application |
|---|---|---|
| 1 Persistent Canvas | `sources/Game/Game.js` / `Game.getInstance`, `Game.init`; `sources/Game/Rendering.js` / `setRenderer`, `start`: one scene/renderer and ordered initialization. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — retain single ownership of scene services as R3F children. **SKIP** the Game singleton, ticker, renderer and startup graph; persistence already exists. |
| 2 Loading/preloading | `sources/Game/ResourcesLoader.js` / `getLoader`, `load`: cached loaders/resources, typed descriptors, per-resource modifiers; `Game.init` separates intro resources from the remaining batch. `sources/Game/PreRenderer.js` / `PreRenderer.render` renders a cube view after exposing hidden objects. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — small asset descriptors and hero-first/next-scene loading through existing Drei loaders and Suspense. Include error handling and deliberate GPU warm-up. **SKIP** the WebGPU cube pre-render transplant and loading the entire world before entry. |
| 3 DOM/WebGL | `Game.init` selects `.game` and `.js-canvas`; `sources/Game/Modals.js` / `Modals` and `sources/Game/Menu.js` / `Menu` own DOM UI outside world objects. | **ADOPT DIRECTLY** — preserve DOM ownership of copy/navigation. **SKIP** game UI, modal content and game-input coupling. |
| 4 Scroll sync | `sources/Game/Ticker.js` / `Ticker`; `sources/Game/View.js` / `View.update`; README game-loop ordering: a game clock coordinates player, world and rendering, not normalized page scroll. | **SKIP** — no replacement scroll technique to adopt; keep Convalt's ticker integration. |
| 5 Chapter/timeline | `sources/Game/World/World.js` / `World`, `sources/Game/World/Areas/Areas.js` / `Areas`, `Game.init` resource phases organize areas and startup stages, not scroll chapters. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — separate visual chapter components and resource phases; use existing `chapters` for order. **SKIP** area/game progression as a second narrative system. |
| 6 Camera | `sources/Game/View.js` / `setFocusPoint`, `setCinematic`, `update`: smooth tracking and cinematic position lerp/quaternion slerp. | **SKIP** — player focus, spherical camera and cinematic mode are incompatible with the protected path. Convalt already has delta-aware damping. |
| 7 Lighting | `sources/Game/Ligthing.js` (actual spelling) / `Lighting.setLight`, `updateShadow`, `updateCoordinates`: directional lighting and bounded shadow coverage; quality chooses 2048 vs 512 shadow maps. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — coherent key light, limited shadow coverage and quality budgets. For Convalt metals add a small static environment via existing Drei; this is our proposed addition, not an HDRI pipeline demonstrated by Folio. **SKIP** its TSL lighting nodes/day-cycle machinery. |
| 8 Fog/atmosphere | `sources/Game/Fog.js` / constructor, `update`: coordinates background color and depth fog with view distances and day-cycle colors. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — shared background/fog palette and scale-appropriate depth attenuation using standard WebGL `Fog` or `FogExp2`. **SKIP** radial TSL background/fog nodes and dynamic weather. |
| 9 Instancing | `sources/Game/InstancedGroup.js` / `setMeshes`, `update`, `updateBoundings`, `getReferencesFromChildren`: one InstancedMesh per source submesh, reference transforms, dirty matrix uploads and bounding-sphere refresh helper. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — standard R3F instanced panel/frame/rack meshes, static transforms uploaded once; refresh bounds after transform changes. Avoid cloning matrices every frame. **SKIP** singleton/ticker and physics integration. |
| 10 Models/materials | `sources/Game/Materials.js` / `save`, `getFromName`, `createFromMaterial`, `updateObject`: named material registry and traversal reuse. `sources/Game/Objects.js` / `getFromModel` also interprets physical objects. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — a few shared silicon/aluminium/graphite/emissive materials and explicit model nodes. **SKIP** NodeMaterial conversion, name-based physics extraction and game objects. |
| 11 Responsive rendering | `sources/Game/Viewport.js` / `measure`, `setResize`: measures host, caps DPR at 2; `Rendering.resize` updates size/pixel ratio. | **ADOPT DIRECTLY** — the DPR-cap principle is already present. **SKIP** duplicate resize ownership; R3F continues managing Canvas size. |
| 12 Postprocessing | `sources/Game/Rendering.js` / `setPostprocessing`: centralized RenderPipeline, bloom threshold 1/strength 0.25 and quality-switched cheap DOF. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — one optional effects owner later, restrained emissive bloom and quality toggles. **SKIP** TSL RenderPipeline, private bloom mip manipulation and DOF. |
| 13 Mobile degradation | `sources/Game/Quality.js` / constructor, `changeLevel`: two quality levels, initially selected by user agent; `Rendering.setPostprocessing` drops DOF; `Lighting.updateShadow` changes resolution. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — explicit quality settings for density, textures and optional effects; validate on devices. **SKIP** user-agent-only quality decisions as a complete performance policy. |
| 14 Monitoring | `Rendering.setStats`, `Rendering.render`: optional renderer counters; `sources/Game/Monitoring.js` / `Monitoring` imports stats-gl, but its construction is commented out in `Game.init`. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — development-only frame time, calls, triangles, geometries and textures from existing WebGL renderer. Use WebGL `info.render.calls`, not the WebGPU `drawCalls` field. **SKIP** WebGPU timestamp/Inspector calls; do not describe disabled monitoring as active. |
| 15 Compression | `scripts/compress.js`: GLB ETC1S then Draco; `toktx` presets differentiate color/data channels; `sharp` creates UI WebP. `ResourcesLoader.getLoader` connects Draco/KTX2 to GLTFLoader and detects renderer support. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — optimized derived GLBs, GPU-compressed textures when justified, decoder support and correct color spaces. **SKIP** wholesale script copying and its aggressive quantization presets; inspect solar-cell lines and metal highlights for damage. |

Resource cautions: the custom loader is not a production-ready transplant. Its empty-list path does not resolve, cache entries are completed resources rather than in-flight promises, and it has no scene ownership/disposal integration. The compression script starts Draco on process close without checking success; write a validated asset pipeline when needed. Preserve originals, record generated output, and visually compare it.

## 2. Lusion WebGL Scroll Sync

This is a small image-plane synchronization demonstration, not a complete cinematic scene engine. Its distinctive solution uses an **absolute-positioned canvas translated by scroll offsets**, with optional 25% padding above and below to mitigate exposed canvas edges. That is different from Convalt's fixed Canvas and should not be transplanted.

| # / Topic | Exact source and concrete technique | Classification and Convalt application |
|---|---|---|
| 1 Persistent Canvas | `src/js/main.js` / `setupThreeJS`, `animate`: one renderer/scene and shared plane geometry. | **ADOPT DIRECTLY** — retain the one-context principle already implemented. **SKIP** raw renderer and rAF initialization. |
| 2 Loading/preloading | `main.js` / `createImageMeshes`: one TextureLoader loads `/images/{i}.webp`; no staged loading or readiness boundary. | **SKIP** as a loading architecture. Use the more applicable staged/Drei approaches from other references. |
| 3 DOM/WebGL | `main.js` / `updateItemPositions`: caches DOM rectangles in document coordinates; `src/shaders/img.vert` maps DOM coordinates into clip space; `src/index.html` supplies image containers. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — only if a future 2D page actually needs a DOM-aligned image effect. Keep current fixed editorial overlay; do not turn the world into DOM-tracked planes. |
| 4 Scroll sync | `main.js` / `updateUniforms`, `updateCanvasPosition`, `animate`; `src/css/style.css`; README synchronization explanation. | **SKIP** absolute-canvas translation, native scroll polling and overscan. Convalt already owns synchronized progress through Lenis/GSAP. The browser-compositor/rAF timing issue is useful background, not a mandate to rebuild. |
| 5 Chapter/timeline | `main.js` / `itemList`, `createImageMeshes`, `updateMeshes`: image list, no chapter ranges/timeline. | **SKIP** — keep `chapters.js`; image order is not a narrative system. |
| 6 Camera | `setupThreeJS`: plain `THREE.Camera`; clip-space image shader handles projection. | **SKIP** — no cinematic camera interpolation is demonstrated. |
| 7 Lighting | `createImageMeshes`; `src/shaders/img.frag`: textured shader planes, no environment/key-light rig. | **SKIP** — no reusable scene-lighting technique. |
| 8 Fog/atmosphere | `img.frag`, `main.js` / `updateStrength`: stylized image effects respond to scroll strength; no world-depth fog. | **SKIP** image distortion/art direction; not architectural atmosphere. |
| 9 Instancing | `createImageMeshes` shares PlaneGeometry but creates separate Mesh/ShaderMaterial per image. | **ADOPT DIRECTLY** — share immutable geometry where appropriate. **SKIP** treating this as instancing; use actual InstancedMesh for panel fields. |
| 10 Models/materials | `createImageMeshes` links `sharedUniforms` into individual material uniforms. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — stable shared time/progress references only for genuinely needed custom effects; materials otherwise remain standard. No GLB pipeline is demonstrated. |
| 11 Responsive rendering | `setupEventListeners`, `onResize`, `updateItemPositions`: ResizeObserver watches wrapper; measurement occurs on resize instead of every animation frame. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — cache any future DOM measurements; let R3F own renderer resizing. **SKIP** uncapped device DPR and oversized buffers. |
| 12 Postprocessing | `animate` renders scene directly; fragment effect is a mesh material, not a composer. README suggests a framebuffer alternative but does not implement it. | **SKIP** — no postprocessing architecture to adopt. |
| 13 Mobile degradation | `onResize` reads device DPR captured at startup; `updateMeshes` hides offscreen images; no adaptive quality tier. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — scene visibility can save draws with conservative bounds. **SKIP** assuming the demo provides a complete mobile fallback. |
| 14 Monitoring | `animate` uses performance time for delta; no FPS/GPU instrumentation. | **SKIP** as performance monitoring. `performance.now` for animation is not profiling. |
| 15 Compression | `public/images/*.webp`, `createImageMeshes`: delivered WebP image assets. | **ADOPT DIRECTLY** — efficient delivery formats for future DOM imagery. **SKIP** equating WebP with GPU texture compression or a GLB optimization pipeline. |

For chapter visibility, use world/frustum-aware bounds with transition margins, not Lusion's screen-rectangle test. Do not blindly copy `frustumCulled = false` or per-frame random Vector4 allocation from its demo.

## 3. 14islands r3f-scroll-rig

Its responsive DOM measurement and progressive-enhancement ideas are useful. Its Canvas/store/scrollbar/custom render passes are an integrated alternative framework, which Convalt must not install or reproduce.

| # / Topic | Exact source and concrete technique | Classification and Convalt application |
|---|---|---|
| 1 Persistent Canvas | `src/components/GlobalCanvas.tsx` / `GlobalCanvas`, `GlobalCanvasImpl`; `UseCanvas.tsx` / `UseCanvas`; `GlobalChildren.tsx`: persistent Canvas with tunneled children. | **ADOPT DIRECTLY** — keep existing Canvas outside changing content. **SKIP** GlobalCanvas/store/tunnel replacement. |
| 2 Loading/preloading | `src/hooks/useImageAsTexture.ts` / `useImageAsTexture`, `useTextureLoader`: DOM `currentSrc`, load readiness, cache use, optional `gl.initTexture`; `src/renderer-api.ts` / `preloadScene` queues warm-up renders. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — separate fetch/decode readiness from GPU warm-up and choose responsive image sources if needed. **SKIP** custom preload render queue and browser-version sniffing transplant. |
| 3 DOM/WebGL | `src/hooks/useTracker.ts` / `useTracker`; `src/components/ScrollScene.tsx` / `ScrollScene`: measured bounds/scale, viewport visibility and direct group placement. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — preserve semantic DOM, observe layout only when necessary. **SKIP** adopting proxy-element world positioning for cinematic chapters. |
| 4 Scroll sync | `src/scrollbar/SmoothScrollbar.tsx` / `SmoothScrollbar`; `src/components/R3FSmoothScrollbar.tsx`; `src/store.ts`: scrollbar/store coordinated updates. | **SKIP** — would duplicate the protected Lenis/GSAP/state architecture. |
| 5 Chapter/timeline | `ScrollScene.tsx`, `src/hooks/useTrackerTypes.ts`: per-element scroll state rather than a central narrative timeline. | **SKIP** as chapter organization. Keep Convalt's shared progress and chapter metadata. |
| 6 Camera | `src/components/PerspectiveCamera.tsx` / `PerspectiveCamera`: FOV/distance calculations to match CSS pixel scale; manual default camera and projection updates. | **SKIP** this camera model; it would invalidate the existing world-space path. Use responsive object composition instead. |
| 7 Lighting | `src/components/ViewportScrollScene.tsx` / `ViewportScrollScene`: isolated view scene/camera supports independently supplied lights. | **SKIP** separate viewport environments for this continuous world. The library does not supply a cinematic environment-lighting preset. |
| 8 Fog/atmosphere | `ScrollScene.tsx`, `ViewportScrollScene.tsx`, powerups: scene placement/rendering primitives, no implemented cinematic fog rig. | **SKIP** — no atmosphere recipe to transplant. |
| 9 Instancing | `ScrollScene.tsx` exposes content group/scene; `powerups/WebGLImage.tsx` handles image meshes, not a repeated-world instancing system. | **SKIP** — do not infer instancing from general R3F compatibility. |
| 10 Models/materials | `powerups/WebGLImage.tsx` / `WebGLImage`; `useImageAsTexture`: separates texture acquisition from image presentation. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — keep resource acquisition separate from chapter composition. **SKIP** adding image/text powerups for current scenes. |
| 11 Responsive rendering | `src/components/ResizeManager.ts` / `ResizeManager` observes body changes; `useTracker` tracks bounds and visibility; `GlobalCanvasImpl` fixes viewport sizing. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — account for font/image layout changes and mobile viewport resizing when future DOM alignment exists; keep normal R3F size management. |
| 12 Postprocessing | `src/components/GlobalRenderer.tsx` / `GlobalRenderer` takes over rendering with useFrame priorities; README explains custom global effects and separate viewport passes. | **SKIP** custom renderer, scissor passes and render queues. Retain the lesson that effects need one owner and separate passes can bypass global effects. |
| 13 Mobile degradation | `GlobalCanvas.tsx` uses `failIfMajorPerformanceCaveat`; `CanvasErrorBoundary.tsx` and CSS availability classes preserve fallbacks; README recommends considering disabling scrolling WebGL on mobile. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — retain readable DOM/fallback media if WebGL fails and reduce scene cost. **SKIP** blanket removal of the existing scroll rig and blindly copying context-failure policy. |
| 14 Monitoring | `GlobalCanvasImpl` debug flag; `src/components/DebugMesh.tsx` / `DebugMesh`; `GlobalRenderer` debug logging and conditional render requests. | **ADOPT DIRECTLY** — development-only layout diagnostics as a practice. **SKIP** calling this an adaptive FPS profiler; demand rendering also needs ongoing invalidation for damped motion and is outside scope. |
| 15 Compression | `useImageAsTexture` handles responsive browser images and WebP support; source has no GLB/KTX2 compression toolchain. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — responsive resolution selection if DOM images become textures. **SKIP** crediting the library with a mesh/GPU compression pipeline. |

## 4. Basement Scrollytelling

The most relevant technique is explicit bounded animation intervals. Borrow the mathematics and cleanup discipline; do not mount its Root or replace Convalt's existing scroll trigger.

| # / Topic | Exact source and concrete technique | Classification and Convalt application |
|---|---|---|
| 1 Persistent Canvas | `website/src/app/sections/hero/mac-model.tsx` / `CanvasWithMacModel` creates a section Canvas. The core library is GSAP/React, not a persistent WebGL shell. | **SKIP** section-local canvases. Keep the existing shared Canvas. |
| 2 Loading/preloading | Same file / module-level `useGLTF.preload`, `MacModel` uses `useGLTF`; `scrollytelling/src/image-sequence-canvas.tsx` exposes frame-range preload. | **ADOPT DIRECTLY** — isolated Drei GLTF preload pattern for approved assets. **SKIP** image sequences as a substitute for the continuous 3D world. |
| 3 DOM/WebGL | `MacModel` renders model nodes while its containing hero provides DOM; model rotation reads timeline progress in `useFrame`. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — chapter mesh refs read `scrollState.progress`, copy remains in the existing overlay. **SKIP** the timeline-context dependency. |
| 4 Scroll sync | `scrollytelling/src/primitive.tsx` / `Scrollytelling` exported as `Root`: creates GSAP timeline with ScrollTrigger and reverts on cleanup. | **SKIP** Root's trigger. **ADOPT DIRECTLY** — cleanup discipline for any later component-owned paused tweens. |
| 5 Chapter/timeline | `primitive.tsx` / `getTimelineSpace`, `addRestToTimeline` normalize duration to 100 and validate ranges; `components/animation/index.tsx` / `Animation`; `components/waypoint/index.tsx` / `Waypoint` has labels and reverse callbacks; `components/stagger/index.tsx` / `Stagger`. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — use 0–1 ranges with `u = clamp((p-start)/(end-start),0,1)`, explicit enter/hold/exit and reversible animation. Keep descriptors associated with existing chapter IDs. **SKIP** a second timeline authority or mandatory waypoint callback graph. |
| 6 Camera | `MacModel` rotates a model; `CanvasWithMacModel` sets a static camera. | **SKIP** — no path interpolation to adopt, and object rotation is not camera animation. |
| 7 Lighting | `mac-model.tsx` reuses authored MeshStandardMaterial nodes; no complete environment rig in that example. | **SKIP** as Convalt's lighting reference. A castShadow flag does not establish a working shadow/light pipeline. |
| 8 Fog/atmosphere | Core primitives and inspected website 3D examples provide no dedicated depth-fog system. | **SKIP** — use the simpler standard fog interpretation of Folio's atmosphere principle. |
| 9 Instancing | `website/src/app/sections/falling-caps/caps.tsx` / `CapsModel`: mapped groups sharing source geometry with individually cloned materials, not InstancedMesh. | **SKIP** cloning a material per repeated panel/rack. Limited independent props can share geometry, but large arrays require instancing. |
| 10 Models/materials | `MacModel` accesses explicit GLTF `nodes` and `materials`; `CapsModel` clones materials for independent opacity. | **ADOPT DIRECTLY** — explicit generated node/material component pattern. **SKIP** default material cloning; only clone when independent state requires it, with ownership/disposal handled. |
| 11 Responsive rendering | `MacModel` scales from `useThree().viewport.width`; `CapsModel` computes responsive width and offsets. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — frame objects from available viewport at their actual camera depth. **SKIP** copying the example's global width multiplier across world-scale architecture. |
| 12 Postprocessing | Core primitives and inspected model examples contain no EffectComposer/effects pipeline. | **SKIP** — no implemented reference technique. |
| 13 Mobile degradation | `Root`, `Animation`, `Waypoint` expose `disabled`; website hooks include `use-media.ts` and `use-viewport.tsx`. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — disable secondary scene motion/effects for reduced motion or constrained quality. **SKIP** assuming these APIs automatically reduce GPU cost or change the existing scroll rig. |
| 14 Monitoring | `scrollytelling/src/components/debugger/visualizer/index.tsx`; `primitive.tsx` lazily imports `Debugger` and attaches animation metadata. | **REIMPLEMENT INSIDE OUR EXISTING ARCHITECTURE** — development-only display of progress, chapter IDs and visual ranges if needed. **SKIP** installing the timeline debugger or equating it with GPU profiling. |
| 15 Compression | `MacModel` uses `Mac128k-light.glb`; inspected source/manifests do not establish an asset compression pipeline. | **SKIP** assuming “light” means verified Draco/KTX2 optimization. Optimize Convalt's own assets explicitly. |

Prefer direct progress sampling for visual transformations: it gives the same pose after a fast jump, reload at a scroll offset, or reverse scroll. `CapsModel` explicitly adds an onReverseCall reset to address fast-scroll cleanup; Convalt can avoid this class of stateful transition problem by calculating the pose from progress. Any optional GSAP scene timeline must be paused, created once, scrubbed from the existing progress in R3F, and reverted on unmount; it must not create ScrollTrigger or animate the camera.

## 5. React Three Next

The persistent application shell and normal DOM routes are relevant to eventual internal pages. Next.js migration, tunnels and scissored View regions are not prerequisites for Convalt.

| # / Topic | Exact source and concrete technique | Classification and Convalt application |
|---|---|---|
| 1 Persistent Canvas | `app/layout.jsx`; `src/components/dom/Layout.jsx` / `Layout`; `src/components/canvas/Scene.jsx` / `Scene`: root layout keeps a fixed Canvas alive as route children change. | **ADOPT DIRECTLY** — preserve this shell placement when routes are later added. **SKIP** replacing Vite or current Canvas with Next.js. |
| 2 Loading/preloading | `Scene` mounts Drei `Preload all`; `src/components/canvas/Examples.jsx` / `Duck`, `Dog` use `useGLTF`; `Layout` dynamically imports Scene with SSR disabled. | **ADOPT DIRECTLY** — existing Drei loading helpers and selective warm-up when useful. **SKIP** interpreting `Preload all` as downloading unknown future assets; it prepares mounted scene resources. SSR machinery is irrelevant to current Vite. |
| 3 DOM/WebGL | `Layout` puts DOM and Canvas under shared `eventSource` with `eventPrefix='client'`; `src/helpers/global.js` creates tunnel; `src/helpers/components/Three.jsx` / `Three`; `src/components/canvas/View.jsx` / `View` tracks DOM refs. | **ADOPT DIRECTLY** — normal DOM routes around persistent visual shell. **SKIP** event rebinding, tunnels and scissored views unless a future route genuinely needs interactive 3D; they are unnecessary for current copy overlay. |
| 4 Scroll sync | `src/templates/Scroll.jsx` / `Scroll`, `ScrollTicker`: older Lenis wrapper, mutable state and R3F addEffect ticker; comment says app-directory refactor is TODO. | **SKIP** — legacy optional template would duplicate the working rig; do not adopt its old Lenis import/options. |
| 5 Chapter/timeline | `app/page.jsx`, `app/blob/page.jsx` organize routes/Views; `Scroll.jsx` has a single progress scalar but no chapter descriptors. | **SKIP** as a chapter system. Future route metadata must not replace existing chapter data. |
| 6 Camera | `ScrollTicker` damps camera Y from progress; `View.jsx` / `Common` installs PerspectiveCamera; optional OrbitControls. | **SKIP** all camera writers. Convalt's CameraRig remains sole camera owner. |
| 7 Lighting | `View.jsx` / `Common`: ambient and two point lights, including blue fill; `Scene` sets AgX tone mapping. | **ADOPT DIRECTLY** — shared staging component as an organizational practice. **SKIP** example blue light palette and blindly changing tone mapping. No HDRI environment pipeline is implemented here. |
| 8 Fog/atmosphere | `Common`, `Scene`, `Examples.jsx`: no dedicated cinematic fog system. | **SKIP** — no fog technique evidenced. |
| 9 Instancing | `Examples.jsx` / `Logo`, `Blob`, `Duck`, `Dog`: individual meshes/groups/primitives. | **SKIP** — not an instancing reference. |
| 10 Models/materials | `Examples.jsx` separates model components; `Duck`/`Dog` return cached GLTF scenes as primitives. | **ADOPT DIRECTLY** — separate resource/model components from route DOM. **SKIP** mounting the same cached Object3D in multiple parents or mutating a shared scene to animate multiple instances. Prefer explicit nodes/InstancedMesh for repeats. |
| 11 Responsive rendering | `View.jsx` tracks element bounds; `Layout` uses a viewport-fixed Canvas; `app/page.jsx` supplies responsive CSS classes for view regions. | **ADOPT DIRECTLY** — keep internal-page layout in CSS. **SKIP** scissor rectangles and per-view cameras for the continuous homepage. |
| 12 Postprocessing | `src/templates/hooks/usePostprocess.jsx` / `usePostProcess`, `getFullscreenTriangle`: manual render target, second screen scene/camera and useFrame priority 1. | **SKIP** — custom render takeover conflicts with constraints; template also contains older renderer encoding assumptions. Later use one conventional effects component only if measured and necessary. |
| 13 Mobile degradation | `Layout` preserves `touchAction: 'auto'`; inspected Scene/View lack explicit adaptive DPR/effects tiers. | **ADOPT DIRECTLY** — preserve native touch interaction for normal DOM pages. **SKIP** assuming starter defaults are a tested mobile degradation policy. |
| 14 Monitoring | `next.config.js` and `package.json` / `analyze` configure bundle analysis; README lists r3f-perf as optional, not mounted source instrumentation. | **ADOPT DIRECTLY** — measure bundle size and runtime rendering separately. **SKIP** Next-specific analyzer/PWA infrastructure or claims that runtime Perf is already installed. |
| 15 Compression | `Examples.jsx` loads GLB URLs; no explicit model/texture compression script in inspected source/manifests. | **SKIP** as an asset-compression reference; loader support alone does not prove optimized assets. |

## Patterns to adopt and explicit exclusions

Adopt existing single-Canvas ownership, DOM editorial content, shared immutable geometry/materials, isolated Drei loading APIs, explicit GLTF node components and development-only diagnostics. Reimplement staged loading, normalized reversible scene animation, instancing with conservative bounds, coherent light/fog parameters, and quality settings within R3F children of the current scene.

Do not adopt:

- Folio's WebGPURenderer, TSL/node material pipeline, singleton Game, custom ticker, physics/Rapier, vehicle controls, weather simulation or DOF.
- Lusion's absolute translated canvas, overscan workaround, raw scroll polling, image glitch treatment or new rAF renderer.
- 14islands' GlobalCanvas replacement, SmoothScrollbar, store, global render queue, viewport/scissor renderer or manual default cameras.
- Basement's Root/ScrollTrigger framework, per-section Canvas, stateful choreography requiring callbacks to repair scene pose, or individually cloned materials for large repeats.
- React Three Next's Next migration, obsolete Scroll template, OrbitControls, manual full-screen postprocess hook or unnecessary route tunnels.
- WebGPU, Houdini, physics engines, fluid simulation, Gaussian splats, custom renderers, replacement scroll frameworks, Drei ScrollControls, or a React per-frame scroll store.

Retain Convalt's art direction: mineral neutrals, silicon/graphite/aluminium, deliberate negative space and restrained solar amber. The repositories do not provide a finished Montfort-style scene to copy. Proportion, surface response, silhouettes and placement along the existing camera path will provide more value than effects density.

## Licensing findings

These are findings from the checked-in notices, not a comprehensive audit of every transitive dependency or asset.

| Reference | Exact notice | Concern / handling before any future copying |
|---|---|---|
| Bruno Folio | `license.md`: MIT, copyright 2025 Bruno Simon. `package.json`: declares ISC. `static/sounds/musics/license.md`: CC0 1.0 text. | Record the MIT/ISC metadata mismatch; retain the actual MIT notice with any substantial reused source and resolve ambiguity before packaging copied material. Music-folder CC0 text is not blanket clearance for every model, photo, logo or sound elsewhere. No Folio asset is proposed for reuse. |
| Lusion | `LICENSE`: MIT, copyright 2025 Lusion Ltd. | Preserve notice for copied/substantial source; repository code license is not a verification of every image's provenance. |
| 14islands | `LICENSE`: MIT, copyright 2023 14 Islands AB. | Preserve copyright/permission notice if copying source. No need to introduce the package. |
| Basement | `LICENSE`: MIT, copyright 2023 basement.studio; explicitly states GSAP files are subject to GreenSock's standard license. | Do not describe GSAP as covered by Basement's MIT notice. Review the actual dependency/version terms if redistributing code; this task changes no GSAP dependency. Treat demo models/fonts separately. |
| React Three Next | `LICENSE`: MIT permission text, copyright 2012–2021 Scott Chacon and others; `package.json`: MIT. | The notice appears inherited/unusual for the repository. Preserve it rather than substituting assumed authorship; clarify provenance if copying significant starter code. Demo models and linked shader examples need their own provenance review. |

No implementation source or media was copied into production. Clones retain their upstream notices. Future Convalt assets should have recorded source URLs, license/attribution and optimization output. Do not ship `references/` as public site assets.

## Verification

All five fresh checkouts have the requested origin URLs and clean git working trees. The report contains 15 category rows per repository (75 total). SHA-256 comparison against the pre-inspection snapshot confirms all existing production source, configuration, package manifests/lockfile and project documentation are unchanged. The only differing pre-existing file outside references was Finder metadata `.DS_Store`; no production code was modified. Convalt itself has no git repository, so file hashes were used rather than claiming a clean project git diff. No dependencies were installed and no production build was run; the supplied clean-build baseline was not re-tested because this task changes only reference clones and documentation.

## Smallest implementation strategy — proposal only

1. **Use the current content seam.** Keep `App`, `PersistentCanvas`, `useScrollRig`, `scrollState`, `CameraRig`, `cameraPath`, `ScrollSpacer` and `ChapterOverlay` as they are. Retain `ChapterMarkers` as a lightweight composition point. Replace one box with a scene component at a time, keyed by the existing chapter ID and anchored at its `lookAt`. Leave other boxes until their own task. A component lookup keyed by IDs is acceptable; do not create another ordered chapter list.

2. **Start with the solar cell only.** Build a thin layered cell with restrained bevels/grid detail from procedural geometry, or one approved optimized GLB. Use shared silicon, aluminium and contact materials. Add a small static environment for readable metallic reflections, one deliberate key light and matching background/fog within the visual subtree. Use the current camera path and inspect real framing before adding detail. Avoid transmission/reflection render targets initially; opacity, roughness and geometry may give sufficient surface quality.

3. **Expand the same material vocabulary along the existing six locations.** The eventual content is:

   | Existing chapter ID | Minimal production scene | Reuse / cost control |
   |---|---|---|
   | `solar-cell` | Layered photovoltaic cell with fine contacts and a clean silhouette. | Shared cell geometry/materials; restrained detail. |
   | `manufacturing` | Architectural rails, machine modules and panels on an implied line. | Procedural modules; instance repeat parts; panel poses sampled from progress. |
   | `generation` | Repeated solar-panel array with a simple ground plane and depth fog. | Instance panels/frames by material; static transforms and refreshed bounds. |
   | `grid` | A designed cable/conduit with a narrow amber energy cue. | Ordinary Curve/TubeGeometry and an emissive moving marker or lightweight material uniform; no fluid simulation. |
   | `data` | Repeated graphite rack volumes with sparse emissive strips. | Instanced racks/strips, shared materials; avoid realtime floor reflection initially. |
   | `recycling` | A few separated layers/material pieces recomposing into the cell motif. | Reuse cell parts; deterministic transforms, no rigid-body physics. |

4. **Animate scene content from existing progress.** Use small pure range calculations in scene components; if range metadata is needed, associate it with the existing `chapters` entries rather than building a second chapter authority. Handle zero-length ranges explicitly. Derive poses directly from progress so reverse/fast scrolling works. Do not add ScrollTrigger, alter the camera, or reinterpret `chapterIndex` as camera-segment index. Keep active and neighboring geometry visible conservatively because the camera is damped and looks across chapter boundaries; never cull solely by the current copy index.

5. **Express the circular ending through content.** Use recycling's existing look-at toward the initial cell for a reformed-cell reveal. This supplies the final “solar cell” beat without adding a waypoint or changing the path. Whether the original cell is legible from that position must be visually verified; adjust scene content scale/orientation/composition first. A true camera return or prescribed fly-through cannot be promised without changing protected camera data/system and is outside this proposal.

6. **Load only what the art needs.** Procedural first; if GLBs are introduced, follow the existing brief's `gltfjsx <file>.glb --transform` requirement, retain source files and inspect the transformed result. Use a small hero/next-chapter loading schedule with existing Drei, local Suspense/error boundaries and explicit resource ownership. Reuse shared GPU assets, do not dispose resources still used by another chapter. Consider KTX2 only with appropriate decoder setup and visual validation; WebP alone does not reduce decoded GPU memory. Do not run reference compression scripts against Convalt unmodified.

7. **Validate each chapter before the next.** Check desktop and portrait phone framing along the actual path; full forward/reverse/fast scroll; copy readability; resource failure; scene-local reduced motion; texture upload stutters; draws, triangles and frame times. Initial quality policy: keep the existing Canvas DPR cap, reduce scene density/map resolution and omit expensive secondary effects on constrained devices. Any later Canvas-level adaptive-DPR or full reduced-motion scroll policy is a separately scoped task, not part of replacing geometry. No FPS claims until measured on devices.

8. **Finish effects last, only if needed.** After all scenes read well, evaluate one conventional WebGL-compatible R3F effects owner inside the current Canvas. Maximum initial scope: selective/thresholded emissive bloom, subtle grain and vignette. No DOF, custom render passes, per-chapter composers or renderer migration. Profile the added cost and disable optional effects in lower quality modes.

Implementation remains deferred. The next production task should be limited to the hero solar-cell geometry/material/lighting composition inside the current `ChapterMarkers` seam, with the rest of the scaffold preserved.
