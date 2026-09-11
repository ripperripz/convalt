import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { timeline, createTimelineState, resolveTimeline } from '../src/experience/timeline.js';
import { chapters } from '../src/scene/chapters.js';
import { cameraKeyframes } from '../src/scene/cameraKeyframes.js';
import { getCameraTransform } from '../src/scene/cameraPath.js';
const source = path => readFileSync(new URL('../src/' + path, import.meta.url), 'utf8');

test('content matches the eight authored beats; no grid or camera data in content', () => {
  assert.deepEqual(chapters.map(c => c.id), timeline.map(b => b.id));
  assert.equal(chapters.length, 8);
  assert.ok(chapters.every(c => !('position' in c) && c.id !== 'grid'));
});

test('all progress values have normalized overlap weights, correct scene windows and one active beat', () => {
  const state = createTimelineState();
  for (let i = 0; i <= 10000; i++) {
    const p = i / 10000;
    resolveTimeline(p, state);
    const sum = Object.values(state.beats).reduce((n, b) => n + b.weight, 0);
    assert.ok(Math.abs(sum - 1) < 1e-10, `weight gap at ${p}`);
    assert.ok(state.beats[state.activeBeat].visible);
    for (const beat of timeline) {
      const b = state.beats[beat.id];
      assert.ok(b.localProgress >= 0 && b.localProgress <= 1);
      if (p < beat.start || p > beat.end) assert.equal(b.visible, false);
    }
    assert.equal(state.scenes.heroAtmosphere.visible, state.beats.hero.visible || state.beats.exploded.visible);
    assert.equal(state.scenes.solarField.visible, state.beats['solar-field'].visible || state.beats['energy-flow'].visible);
    assert.equal(state.scenes.recycling.visible, state.beats.recycling.visible);
  }
  resolveTimeline(1, state);
  assert.equal(state.activeBeat, 'recycling');
  assert.equal(state.beats.recycling.localProgress, 1);
});

test('seek and reverse scrolling produce the same result, including endpoints and invalid input', () => {
  const shared = createTimelineState();
  for (const p of [1, .92, .88, .79, .67, .4, .15, 0, .88, .25, -1, 2, NaN]) {
    resolveTimeline(p, shared);
    assert.deepEqual(shared, resolveTimeline(p, createTimelineState()));
  }
  assert.equal(resolveTimeline(0, shared).activeBeat, 'hero');
  assert.equal(resolveTimeline(.94, shared).theme, 'light');
  assert.equal(resolveTimeline(.84, shared).theme, 'dark');
});

test('camera reaches authored keys without duplicate or static segments', () => {
  for (const [i, key] of cameraKeyframes.entries()) {
    const sampled = getCameraTransform(key.at);
    for (const field of ['position', 'lookAt']) {
      key[field].forEach((v, axis) => assert.ok(Math.abs(v - sampled[field][axis]) < 1e-9));
    }
    if (!i) continue;
    const previous = cameraKeyframes[i - 1];
    assert.ok(key.at > previous.at);
    assert.notDeepEqual(key.position, previous.position);
    const midpoint = (previous.at + key.at) / 2;
    assert.notDeepEqual(getCameraTransform(midpoint - .0001).position, getCameraTransform(midpoint + .0001).position);
  }
});

test('camera velocity is continuous at internal keys and samples stay finite', () => {
  const h = 1e-7;
  for (const { at } of cameraKeyframes.slice(1, -1)) {
    const a = getCameraTransform(at - h), b = getCameraTransform(at), c = getCameraTransform(at + h);
    const speed = Math.hypot(...c.position.map((v, axis) => (v - a.position[axis]) / (2 * h)));
    assert.ok(speed > 0.01, `camera stops at key ${at}`);
    for (const field of ['position', 'lookAt']) {
      for (let axis = 0; axis < 3; axis++) {
        const left = (b[field][axis] - a[field][axis]) / h;
        const right = (c[field][axis] - b[field][axis]) / h;
        assert.ok(Math.abs(left - right) < .02, `velocity jump at ${at}`);
      }
    }
  }
  for (let i = 0; i <= 1000; i++) {
    const transform = getCameraTransform(i / 1000);
    assert.ok([...transform.position, ...transform.lookAt].every(Number.isFinite));
  }
});

test('scene modules cannot derive timelines, mutate siblings or write global atmosphere', () => {
  for (const file of readdirSync(new URL('../src/scene/chapters/', import.meta.url))) {
    if (!file.endsWith('.jsx')) continue;
    const text = source('scene/chapters/' + file);
    assert.doesNotMatch(text, /scrollState|chapters\.length|findIndex|getObjectByName|scene\.(fog|background|environmentIntensity)\s*=/, file);
    assert.doesNotMatch(text, /\.visible\s*=/, file);
  }
  assert.doesNotMatch(source('scene/PersistentCanvas.jsx'), /attach="fog"|attach="background"|<Environment\b/);
  assert.doesNotMatch(source('scene/ChapterMarkers.jsx'), /boxGeometry/);
  assert.match(source('scene/ChapterMarkers.jsx'), /if \(!entry\) return null/);
  assert.match(source('dom/ChapterOverlay.jsx'), /syncExperience\(\)/);
  assert.doesNotMatch(source('dom/ChapterOverlay.jsx'), /chapters\.length|Math\.floor/);
  assert.doesNotMatch(source('scene/cameraPath.js'), /chapters/);
});

test('scene fades preserve authored opacity and animated lights without cumulative dimming', async () => {
  const { Group, Mesh, BoxGeometry, MeshStandardMaterial, PointLight } = await import('three');
  const { createSceneFade } = await import('../src/experience/sceneFade.js');
  const root = new Group();
  const material = new MeshStandardMaterial({ opacity: .2, transparent: true, depthWrite: false });
  const mesh = new Mesh(new BoxGeometry(), material);
  const light = new PointLight(0xffffff, 4);
  root.add(mesh, light);
  const fade = createSceneFade(root);
  for (const weight of [1, .5, .1, 0, .5, 1]) {
    fade.restore();
    light.intensity = 6; // A local animation writes before the fade pass.
    fade.apply(weight);
    assert.equal(material.opacity, .2 * weight);
    assert.equal(light.intensity, 6 * weight);
  }
  fade.restore();
  assert.equal(material.opacity, .2);
  assert.equal(material.transparent, true);
  assert.equal(material.depthWrite, false);
  mesh.geometry.dispose(); material.dispose();
});

test('nested visibility gates own their materials once; the sun and halo are removed', async () => {
  const { Group, Mesh, BoxGeometry, MeshStandardMaterial } = await import('three');
  const { createSceneFade } = await import('../src/experience/sceneFade.js');
  const parent = new Group(), child = new Group();
  child.userData.timelineGate = true;
  const material = new MeshStandardMaterial();
  const mesh = new Mesh(new BoxGeometry(), material);
  child.add(mesh); parent.add(child);
  createSceneFade(parent).apply(.5);
  createSceneFade(child).apply(.5);
  assert.equal(material.opacity, .5);
  assert.doesNotMatch(source('scene/chapters/SolarCellScene.jsx'), /DawnSun|haloTexture|Dawn sun/);
  mesh.geometry.dispose(); material.dispose();
});
