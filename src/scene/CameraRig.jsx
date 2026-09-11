import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { experienceState } from "../experience/experienceState";
import { getCameraTransform } from "./cameraPath";

export function CameraRig() {
  const transform = useRef({ position: [0, 0, 6], lookAt: [0, 0, 0] });
  useFrame(({ camera }) => {
    const { position, lookAt } = getCameraTransform(experienceState.progress, transform.current);
    camera.position.set(...position);
    camera.lookAt(...lookAt);
  }, -70);
  return null;
}
