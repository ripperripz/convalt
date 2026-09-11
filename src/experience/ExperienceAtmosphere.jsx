import { useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { CanvasTexture, Color, Fog, SRGBColorSpace } from "three";
import { experienceState } from "./experienceState";

// Existing palette and lighting values, now blended in one place.
const dawn = { sky: ["#f6f1e7", "#ead8b8", "#ead8b8", "#ead8b8", "#d6b06f"], fog: "#ead8b8", near: 3.2, far: 4.6, intensity: 0.28 };
const warm = { ...dawn, near: 8, far: 30, intensity: 0.8 };
const profiles = {
  hero: dawn,
  exploded: warm,
  manufacturing: warm,
  "solar-field": warm,
  "energy-flow": warm,
  tunnel: { sky: ["#111820", "#111820", "#111820", "#111820", "#111820"], fog: "#111820", near: 0, far: 25, intensity: 0.8 },
  data: { sky: ["#182838", "#344758", "#877664", "#af895f", "#d09a67"], fog: "#52606a", near: 0, far: 38, intensity: 0.8 },
  recycling: warm,
};
const colors = Object.fromEntries(Object.entries(profiles).map(([id, profile]) => [id, {
  ...profile, sky: profile.sky.map(color => new Color(color)), fog: new Color(profile.fog),
}]));

export function ExperienceAtmosphere() {
  const scene = useThree(state => state.scene);
  const resources = useRef();
  useLayoutEffect(() => {
    const previous = { background: scene.background, fog: scene.fog, intensity: scene.environmentIntensity };
    const canvas = document.createElement("canvas");
    canvas.width = 16; canvas.height = 256;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    const fog = new Fog(dawn.fog, dawn.near, dawn.far);
    resources.current = { canvas, context: canvas.getContext("2d"), texture, fog, lastProgress: NaN, sky: Array.from({ length: 5 }, () => new Color()) };
    scene.background = texture;
    scene.fog = fog;
    return () => {
      scene.background = previous.background;
      scene.fog = previous.fog;
      scene.environmentIntensity = previous.intensity;
      resources.current = null;
      texture.dispose();
    };
  }, [scene]);

  useFrame(() => {
    const r = resources.current;
    if (!r) return;
    let intensity = 0;
    for (const [id, profile] of Object.entries(colors)) intensity += profile.intensity * experienceState.beats[id].weight;
    // This component also owns Environment; apply the resolved value after its setup.
    scene.environmentIntensity = intensity;
    if (r.lastProgress === experienceState.progress) return;
    r.lastProgress = experienceState.progress;
    r.sky.forEach(color => color.setRGB(0, 0, 0));
    r.fog.color.setRGB(0, 0, 0);
    r.fog.near = 0; r.fog.far = 0;
    for (const [id, profile] of Object.entries(colors)) {
      const weight = experienceState.beats[id].weight;
      r.sky.forEach((color, i) => {
        color.r += profile.sky[i].r * weight;
        color.g += profile.sky[i].g * weight;
        color.b += profile.sky[i].b * weight;
      });
      r.fog.color.r += profile.fog.r * weight;
      r.fog.color.g += profile.fog.g * weight;
      r.fog.color.b += profile.fog.b * weight;
      r.fog.near += profile.near * weight;
      r.fog.far += profile.far * weight;
    }
    const gradient = r.context.createLinearGradient(0, 0, 0, r.canvas.height);
    [0, 0.3, 0.76, 0.82, 1].forEach((stop, i) => gradient.addColorStop(stop, r.sky[i].getStyle()));
    r.context.fillStyle = gradient;
    r.context.fillRect(0, 0, r.canvas.width, r.canvas.height);
    r.texture.needsUpdate = true;
  }, -80);

  return <>
    <Environment preset="studio" background={false} />
    <directionalLight position={[-4, 4, -5]} intensity={1.1} color="#fff4e0" />
    <ambientLight intensity={0.15} color="#f4efe5" />
    <ambientLight intensity={0.6} />
    <directionalLight position={[5, 10, 5]} intensity={1.2} />
  </>;
}
