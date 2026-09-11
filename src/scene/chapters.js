// Single source of truth for the scroll narrative.
// `position` / `lookAt` are camera waypoints in 3D space — replace these with
// points sampled from a real Blender camera path once you have one exported.
// `color` is a placeholder for the eventual chapter geometry/material.
export const chapters = [
  {
    id: "solar-cell",
    label: "Solar Cell",
    copy: "Every watt starts here: a single photovoltaic cell.",
    position: [0, 0, 6],
    lookAt: [0, 0, 0],
    color: "#8ecae6",
  },
  {
    id: "manufacturing",
    label: "Manufacturing",
    copy: "Cells become panels on an automated line.",
    position: [6, 1, 2],
    lookAt: [3, 0, 0],
    color: "#219ebc",
  },
  {
    id: "generation",
    label: "Generation",
    copy: "Panels gather into fields, turning light into power.",
    position: [10, 3, -6],
    lookAt: [8, 0, -6],
    color: "#ffb703",
  },
  {
    id: "grid",
    label: "The Grid",
    copy: "Power moves outward through the transmission network.",
    position: [4, 5, -14],
    lookAt: [4, 0, -18],
    color: "#fb8500",
  },
  {
    id: "data",
    label: "Data Infrastructure",
    copy: "Energy meets computation in the data center.",
    position: [-4, 2, -20],
    lookAt: [-4, 0, -24],
    color: "#023047",
  },
  {
    id: "recycling",
    label: "Recycling",
    copy: "At end of life, materials return to the beginning.",
    position: [-10, 1, -12],
    lookAt: [0, 0, 0],
    color: "#8ecae6",
  },
];
