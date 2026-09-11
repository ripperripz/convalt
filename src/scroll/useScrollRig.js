import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollState } from "./scrollState";
import { chapters } from "../scene/chapters";

gsap.registerPlugin(ScrollTrigger);

// This hook is the entire "engine" of the site. It does three things:
//   1. Smooths native scroll with Lenis.
//   2. Feeds Lenis's smoothed position into GSAP's ticker, so ScrollTrigger
//      sees the eased position rather than the raw, jumpy native scroll.
//   3. On every tick, writes normalized progress (0-1) and the current
//      chapter index into scrollState, which the camera rig and DOM
//      overlay both read from in their own render loops.
//
// Swap the ScrollTrigger `trigger`/`start`/`end` for a pinned, per-chapter
// setup later if you want hard chapter snaps instead of continuous scroll.
export function useScrollRig(scrollContainerRef) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      // Respect the OS-level reduced-motion setting from day one.
      autoRaf: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const rafCallback = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);

    const trigger = ScrollTrigger.create({
      trigger: scrollContainerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        scrollState.progress = self.progress;
        scrollState.chapterIndex = Math.min(
          chapters.length - 1,
          Math.floor(self.progress * chapters.length)
        );
      },
    });

    return () => {
      trigger.kill();
      gsap.ticker.remove(rafCallback);
      lenis.destroy();
    };
  }, [scrollContainerRef]);
}
