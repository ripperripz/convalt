import { useRef } from "react";
import { PersistentCanvas } from "./scene/PersistentCanvas.jsx";
import { ChapterOverlay } from "./dom/ChapterOverlay.jsx";
import { ScrollSpacer } from "./dom/ScrollSpacer.jsx";
import { useScrollRig } from "./scroll/useScrollRig.js";

// This is the whole skeleton: prove that scrolling the spacer drives the
// camera through the canvas AND fades the matching DOM copy in sync, using
// nothing but placeholder boxes. Once this feels smooth, replace
// ChapterMarkers.jsx one chapter at a time with real content — never
// rewrite this shell to add art.
export default function App() {
  const scrollContainerRef = useRef(null);

  useScrollRig(scrollContainerRef);

  return (
    <>
      <PersistentCanvas />
      <ChapterOverlay />
      <ScrollSpacer ref={scrollContainerRef} />
    </>
  );
}
