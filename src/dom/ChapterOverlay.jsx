import { useEffect, useRef } from "react";
import { chapters } from "../scene/chapters";
import { scrollState } from "../scroll/scrollState";

// Renders the chapter label + copy fixed over the canvas. Visibility is
// driven by scrollState.chapterIndex, applied directly to each element's
// style in a lightweight rAF loop — this sidesteps a React re-render 60
// times a second while still staying perfectly in sync with the 3D camera,
// since both read the same scrollState object.
export function ChapterOverlay() {
  const refs = useRef([]);

  useEffect(() => {
    let frameId;

    const tick = () => {
      const segmentCount = chapters.length - 1;
      const activeChapterIndex = Math.min(
        chapters.length - 1,
        Math.max(0, Math.floor(scrollState.progress * segmentCount))
      );

      refs.current.forEach((el, index) => {
        if (!el) return;
        const isActive = index === activeChapterIndex;
        el.style.opacity = isActive ? "1" : "0";
        el.style.transform = isActive
          ? "translateY(0px)"
          : "translateY(12px)";
      });
      frameId = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="chapter-overlay" aria-hidden="false">
      {chapters.map((chapter, index) => (
        <div
          key={chapter.id}
          ref={(el) => (refs.current[index] = el)}
          className="chapter-copy"
        >
          <span className="chapter-label">{chapter.label}</span>
          <p className="chapter-text">{chapter.copy}</p>
        </div>
      ))}
    </div>
  );
}
