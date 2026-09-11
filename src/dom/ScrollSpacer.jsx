import { forwardRef } from "react";
import { chapters } from "../scene/chapters";

// Each section is 100vh, so scrolling through N chapters means scrolling
// N*100vh of page height. The sections have no visible content — the real
// content is the fixed canvas + fixed DOM overlay sitting on top. This is
// the "invisible scrollytelling track" pattern from Basement Scrollytelling.
export const ScrollSpacer = forwardRef(function ScrollSpacer(_props, ref) {
  return (
    <div ref={ref} className="scroll-spacer">
      {chapters.map((chapter) => (
        <section key={chapter.id} className="scroll-section" />
      ))}
    </div>
  );
});
