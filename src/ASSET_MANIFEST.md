# ASSET_MANIFEST.md

Tracks every external asset the site needs. Update the Status column as
things land. "Procedural — no asset needed" means Codex builds it from
primitives; nothing to source or download for that row.

## Reference material (source of truth, not shipped to production)

| Asset | Location | Status |
|---|---|---|
| CONVALT_CONCEPT.mp4 (full video) | project root | done |
| 8 labeled reference stills | `/reference-frames/01-08-*.png` | done |
| REFERENCE_ANALYSIS.md (5-repo engineering analysis) | project root | done |
| CODEX_RULES.md | project root | done |

## Textures — manufacturing chapter only (hero uses gradient/emissive, not textures)

| Asset | Source | Target spec | Status |
|---|---|---|---|
| Warm concrete/travertine-toned surface | polyhaven.com/textures/concrete (browse for a lighter, warm-toned option — avoid dark/weathered industrial variants) | 1K, diffuse+normal+roughness (download the "1k" package, not 2K/4K/8K — keeps bundle size down) | TODO |
| Brushed aluminium / metal | polyhaven.com/textures (search "metal") | 1K | TODO |
| Dark graphite/concrete for data-center facades | polyhaven.com/textures/concrete or /textures/rock/concrete | 1K | TODO |

Download the 1K JPG/PNG package (not EXR) for each — smaller, and sRGB/
roughness maps don't need HDR precision. Run through no additional
compression tool for textures this small; GLB/texture compression tooling
(gltfjsx, glTF Transform) is for 3D models, not flat PBR texture sets.

## Models

| Asset | Status |
|---|---|
| Robot arms (manufacturing) | NOT NEEDED — built procedurally per CODEX_RULES.md, do not source a GLB |
| Solar panel | Already built (existing hero geometry, reused via instancing for the field) |
| All other geometry (conveyor, data-center monoliths, tunnel, fragments) | Procedural — no asset needed |

## Brand / company assets — these are yours to supply, not sourceable by an agent

| Asset | Needed for | Status |
|---|---|---|
| Convalt logo (SVG preferred, or high-res PNG) | Nav bar, all pages | TODO — you provide |
| 5–6 project photos/renders | Projects page | TODO — you provide |
| Team headshots + names/titles | Team page | TODO — you provide |
| Press/media assets, if any | Media page | TODO — you provide, optional |
| Real company copy (about, project descriptions, contact info) | All 2D pages | TODO — see CONTENT.md |

## Fonts

| Asset | Status |
|---|---|
| Primary typeface | TODO — decide/confirm license (Google Fonts is safest/fastest if no brand font is mandated) |

## Git checkpoint

Before starting any new Codex task after a reset:
```bash
cd ~/Downloads/convalt
git add -A
git commit -m "checkpoint: before <task name>"
```
If the project has no git repo yet, run `git init` once first. This is the
cheapest insurance available — if an agent damages a working file, you
revert instead of re-diagnosing or re-building.