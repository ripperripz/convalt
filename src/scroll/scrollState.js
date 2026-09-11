// A single mutable object, updated by GSAP's ScrollTrigger on every tick.
// The R3F camera rig and the DOM chapter overlay both read from this each
// frame instead of going through React state, which is how the reference
// architectures (Lusion Scroll Sync, r3f-scroll-rig) avoid re-rendering the
// whole tree 60 times a second while scrolling.
export const scrollState = {
  // 0 → top of page, 1 → bottom of page
  progress: 0,
  // Which chapter (0-5) is currently most visible, updated alongside progress
  chapterIndex: 0,
};
