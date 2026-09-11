import { useEffect, useRef } from "react";
import { chapters } from "../scene/chapters";
import { syncExperience } from "../experience/experienceState";

// DOM and WebGL resolve the same authored timeline from the same scroll input.
export function ChapterOverlay() {
  const refs = useRef([]);

  useEffect(() => {
    let frameId;

    const tick = () => {
      const resolved = syncExperience();

      refs.current.forEach((el, index) => {
        if (!el) return;
        const isActive = chapters[index].id === resolved.activeBeat;
        el.setAttribute("aria-hidden", String(!isActive));
        el.dataset.theme = resolved.theme;
        const weight = resolved.beats[chapters[index].id].weight;
        el.style.transition = "none";
        el.style.opacity = String(weight);
        el.style.transform = `translateY(${12 * (1 - weight)}px)`;
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
