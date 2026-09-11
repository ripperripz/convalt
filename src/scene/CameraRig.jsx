import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "../scroll/scrollState";
import { getCameraTransform } from "./cameraPath";

// Damping factor: lower = more cinematic lag behind the scroll position,
// higher = camera tracks the scrollbar almost instantly. Tune with Leva
// later; 4-6 reads as "smooth" without feeling disconnected from scroll.
const DAMPING = 4;

export function CameraRig() {
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const { position, lookAt } = getCameraTransform(scrollState.progress);
    targetPosition.current.set(...position);
    targetLookAt.current.set(...lookAt);

    // THREE.MathUtils.damp gives frame-rate-independent smoothing, so the
    // camera moves at the same perceived speed on a 30fps phone and a
    // 144fps monitor.
    state.camera.position.x = THREE.MathUtils.damp(
      state.camera.position.x,
      targetPosition.current.x,
      DAMPING,
      delta
    );
    state.camera.position.y = THREE.MathUtils.damp(
      state.camera.position.y,
      targetPosition.current.y,
      DAMPING,
      delta
    );
    state.camera.position.z = THREE.MathUtils.damp(
      state.camera.position.z,
      targetPosition.current.z,
      DAMPING,
      delta
    );

    currentLookAt.current.x = THREE.MathUtils.damp(
      currentLookAt.current.x,
      targetLookAt.current.x,
      DAMPING,
      delta
    );
    currentLookAt.current.y = THREE.MathUtils.damp(
      currentLookAt.current.y,
      targetLookAt.current.y,
      DAMPING,
      delta
    );
    currentLookAt.current.z = THREE.MathUtils.damp(
      currentLookAt.current.z,
      targetLookAt.current.z,
      DAMPING,
      delta
    );

    state.camera.lookAt(currentLookAt.current);
  });

  return null;
}
