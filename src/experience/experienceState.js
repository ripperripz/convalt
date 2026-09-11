import { scrollState } from "../scroll/scrollState";
import { createTimelineState, resolveTimeline } from "./timeline";
export const experienceState = createTimelineState();
export function syncExperience() {
  return resolveTimeline(scrollState.progress, experienceState);
}
