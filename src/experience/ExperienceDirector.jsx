import { useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { experienceState, syncExperience } from "./experienceState";

import { createSceneFade } from "./sceneFade";

export function ExperienceDirector() {
  useFrame(() => { syncExperience(); }, -100);
  return null;
}

export function SceneGate({ sceneId, children }) {
  const group = useRef();
  const fade = useRef();
  useLayoutEffect(() => {
    fade.current = createSceneFade(group.current);
    return () => fade.current?.restore();
  }, []);
  useFrame(() => {
    fade.current?.restore();
    const state = experienceState.scenes[sceneId];
    group.current.visible = state?.visible ?? false;
    group.current.userData.timelineWeight = state?.weight ?? 0;
  }, -90);
  // Local animation runs at -1; apply fades afterwards without taking over rendering.
  useFrame(() => {
    fade.current?.apply(experienceState.scenes[sceneId]?.weight ?? 0);
  });
  return <group userData={{ timelineGate: true }} ref={group} visible={false} name={`Timeline: ${sceneId}`}>{children}</group>;
}
