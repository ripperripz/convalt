# CONVALT ENERGY — AI CODING AGENT EXECUTION BRIEF

## 1. PROJECT CONTEXT

### Product

Build a premium website for **Convalt Energy**, an integrated energy company spanning:

- solar manufacturing
- power generation
- energy/grid infrastructure
- data-center infrastructure
- recycling / circular energy systems

The client specifically wants a **3D/WebGL landing page** with conventional **2D internal pages**.

The initial working project is located at:

```text
~/Downloads/convalt
```

### Deadline

This is a **web-design contest under severe deadline pressure**. Optimize for:

1. polished visual result
2. coherent cinematic storytelling
3. stable 60-fps-class performance
4. desktop + recent-mobile usability
5. maintainable source code

Do not pursue technically impressive features that do not materially improve the visual result.

### Visual benchmark

Primary reference:

```text
https://mont-fort.com
```

Target the design language of **Montfort / Immersive Garden**, not a literal clone.

Desired qualities:

- restrained
- architectural
- atmospheric
- cinematic
- large negative space
- editorial typography
- neutral mineral palette
- graphite / aluminium / warm off-white
- restrained solar-amber accent
- realistic but stylized 3D
- slow deliberate camera motion
- seamless physical transitions
- minimal interface

Avoid:

- generic green renewable-energy design
- SaaS cards
- neon cyberpunk
- excessive glassmorphism
- videogame aesthetics
- gratuitous particles
- excessive bloom
- cluttered scenes

### Narrative arc

The homepage is **one continuous journey**, not independent webpage sections:

```text
SOLAR CELL
    ↓
MANUFACTURING
    ↓
POWER GENERATION
    ↓
GRID / ENERGY FLOW
    ↓
DATA INFRASTRUCTURE
    ↓
RECYCLING
    ↓
SOLAR CELL
```

The final scene should reveal the idea of an **integrated circular energy ecosystem**.

### Site structure

```text
HOME
└── Full cinematic 3D scroll experience

PROJECTS
PROJECT DETAIL
TEAM
MEDIA / PRESS
RESOURCES
CONTACT
└── Standard responsive 2D pages
```

Internal pages must share:

- navigation
- typography
- palette
- spacing
- persistent visual system
- persistent Canvas/application shell where appropriate

Do not turn internal pages into additional complex WebGL scenes.

---

# 2. CURRENT STATE

An initial scaffold has already been created in:

```text
~/Downloads/convalt
```

It is **working and builds cleanly**.

The following architecture is already implemented and verified:

- persistent React Three Fiber Canvas
- Lenis smooth scrolling
- GSAP + ScrollTrigger integration
- normalized scroll-driven chapter progression
- shared mutable `scrollState` object
- camera rig reads directly from `scrollState`
- DOM overlay also reads from the same `scrollState`
- React state is intentionally **not** being used for per-frame scroll synchronization
- chapter metadata/data is centralized as a **single source of truth**
- placeholder box geometry currently marks each chapter/location
- chapter/camera architecture already functions

### Critical instruction

**DO NOT rebuild the scaffold.**

Do not replace the scroll architecture with:

- Drei `ScrollControls`
- React state
- a new GSAP implementation
- another camera system
- another page-scroll abstraction

Your job is to **extend the existing implementation visually**.

---

# 3. REFERENCE LIBRARY

Create:

```text
~/Downloads/convalt/references/
```

Clone only these five priority repositories.

## 1. Bruno Simon — Folio 2025

```text
https://github.com/brunosimon/folio-2025
```

Extract:

- production Three.js scene organization
- resource/preloading architecture
- environment lighting
- fog/atmosphere
- model/material pipeline
- performance controls
- texture/model compression workflow

Do **not** copy its game mechanics or visual design.

---

## 2. Lusion — WebGL Scroll Sync

```text
https://github.com/lusionltd/WebGL-Scroll-Sync
```

Extract:

- single persistent renderer
- DOM/WebGL synchronization concepts
- visibility handling
- responsive WebGL behavior
- techniques for combining normal webpage content with a persistent Canvas

Do not replace the existing Convalt scroll rig.

---

## 3. 14islands — r3f-scroll-rig

```text
https://github.com/14islands/r3f-scroll-rig
```

Extract:

- React + persistent R3F Canvas architecture
- DOM/3D coexistence
- responsive viewport handling
- model positioning
- performance patterns
- postprocessing organization

Use as an architectural reference, **not as a replacement dependency unless clearly necessary**.

---

## 4. Basement Studio — Scrollytelling

```text
https://github.com/basementstudio/scrollytelling
```

Extract:

- chapter/timeline organization
- normalized animation ranges
- GSAP scene orchestration
- waypoint/range concepts

Map useful ideas onto the existing `scrollState`; do not replace it.

---

## 5. Poimandres — React Three Next

```text
https://github.com/pmndrs/react-three-next
```

Extract:

- persistent Canvas across routes
- 2D page + 3D application-shell coexistence
- routing architecture
- separation between DOM and WebGL responsibilities

---

## Supporting toolkit

Use where appropriate:

### `@react-three/drei`

Preferred components:

```text
Environment
Lightformer
MeshTransmissionMaterial
MeshReflectorMaterial
Sparkles
Cloud
```

Also use `useGLTF`, `Preload`, etc. when needed.

### Assets

**Poly Haven**

Use for:

- HDRIs
- concrete
- metal
- industrial materials

### Test/reference models

**Khronos glTF Sample Assets**

Use for testing:

- transmission
- clearcoat
- emissive materials
- optimized glTF workflows

### Model pipeline

Use:

```text
gltfjsx
glTF Transform
```

Every downloaded/generated production `.glb` must be optimized before import.

Example:

```bash
npx gltfjsx model.glb --transform
```

### Live visual tuning

Use **Leva** during development for:

- camera values
- material roughness/metalness
- fog
- lighting
- object placement
- effect intensity

Bake finalized values back into code.

### Explicitly excluded

Do not introduce:

- WebGPU
- Houdini
- physics engines
- fluid simulation
- Gaussian splats
- custom rendering engines
- complex custom renderer infrastructure

---

# 4. BUILD ORDER

## Chapter 1 — Hero Solar Cell

### Technique

Procedural/simple solar-cell geometry or one optimized GLB.

### References

- Bruno Simon lighting/environment patterns
- Drei staging/material primitives

### Useful Drei

```text
Environment
Lightformer
MeshTransmissionMaterial
```

### Done when

A premium floating photovoltaic cell sits in a large atmospheric neutral environment and responds subtly to camera/pointer movement while the hero typography remains clean and legible.

---

## Chapter 2 — Solar Field / Generation

### Technique

One solar-panel mesh repeated through `InstancedMesh`.

Use terrain/fog/lighting to create apparent scale.

### References

- Bruno Simon environment/fog patterns
- Three.js instancing principles

### Useful Drei

```text
Environment
Cloud
Lightformer
```

### Done when

The camera emerges into a convincing large-scale solar landscape with hundreds of panels at low rendering cost.

---

## Chapter 3 — Manufacturing + Data Center

Build both from **simple architectural procedural geometry** before considering external models.

### Manufacturing

Use:

- boxes
- rails
- conveyor structures
- repeated machine modules
- moving photovoltaic modules

### Data center

Use:

- graphite monoliths
- emissive strips
- reflective floor
- fog

### Useful Drei

```text
MeshReflectorMaterial
Environment
Lightformer
```

### Done when

Both environments feel monumental and designed despite using lightweight geometry.

---

## Chapter 4 — Energy Pulse / Tunnel

### Technique

Use:

```text
Curve
TubeGeometry
emissive material
animated energy pulse
```

Potential restrained `Sparkles`.

### Useful Drei

```text
Sparkles
```

### Done when

The camera can physically follow energy from the solar environment through an abstract conduit into the data-center environment without a hard cut.

---

## Chapter 5 — Scene Transitions

Only after individual scenes are strong.

Preferred transitions:

```text
solar cell → pass through layers → manufacturing
finished panel fills viewport → solar field
energy cable → tunnel → data center
materials separate → recycling → new cell
```

Transitions should be caused by physical objects/camera movement rather than generic fades.

### Done when

The homepage reads as **one continuous world**, not six WebGL sections.

---

## Chapter 6 — 2D Inner Pages

Build last.

Required reusable templates:

1. index/list
2. project/article detail
3. team/contact

Maintain same typography, colors and spacing as the homepage.

### Done when

Projects, Team, Media and Contact feel like the same brand while remaining fast conventional webpages.

---

# 5. RULES FOR THE AGENT

1. **Never modify the core scroll rig, `scrollState`, or camera-path architecture unless explicitly instructed.**

2. Work primarily by replacing/enhancing geometry inside:

```text
ChapterMarkers.jsx
```

3. Work on **one chapter per task**.

4. Before writing any production 3D code, inspect `/references`.

5. Create:

```text
REFERENCE_ANALYSIS.md
```

For every useful pattern classify it as:

```text
ADOPT DIRECTLY
REIMPLEMENT IN EXISTING ARCHITECTURE
SKIP
```

6. Never transplant a reference project's visual design.

7. Check licenses before copying implementation code/assets.

8. Any external `.glb` must pass through:

```bash
npx gltfjsx <file>.glb --transform
```

before production import.

9. Prefer:

```text
simple geometry
+
great composition
+
great lighting
+
great camera motion
```

over complicated models.

10. Do not add postprocessing until all scenes work.

Final postprocessing budget:

```text
Bloom
subtle noise/grain
subtle vignette
```

Nothing more unless specifically justified.

11. Bloom must affect intentional emissive elements, not wash out the whole scene.

12. Keep repeated objects instanced.

13. Use responsive DPR and reduce expensive effects on mobile.

14. Respect:

```css
prefers-reduced-motion
```

15. Test mobile degradation before describing any chapter as finished.

16. Preserve maintainability and readable source.

---