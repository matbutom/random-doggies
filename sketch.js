/*
  sketch.js — Doggo Prints
  version: MVP 0.6 — flat color pixel art, guaranteed anatomy
*/

const FORMATS = {
  A4: { w: 2480, h: 3508 },
  A3: { w: 3508, h: 4961 },
};

function getFormat() {
  const f = FORMATS[state.format];
  return state.landscape ? { w: f.h, h: f.w } : f;
}

const CANVAS_BG = "#FFFFFF";
const PALETTE = [
  "#F5C842", // amarillo
  "#F57DB0", // rosa
  "#7EC8E3", // celeste
  "#78C99A", // verde
  "#6EA8D8", // azul
  "#F5904A", // naranjo
  "#B07EC8", // morado
  "#E86060", // rojo
];
const BLACK = "#1A1A1A";
const MAX_DETAIL_COLS = 150;

// ── HAND-CRAFTED TEMPLATES ──────────────────────────────────────────────────
// 0=empty · 1=body color · 2=black
// All designed facing RIGHT; non-symmetric ones get flipped randomly.

const TEMPLATES = [
  // Side walking dog
  {
    symmetric: false,
    grid: [
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 0, 2, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0],
    ],
  },

  // Front-facing sitting dog
  {
    symmetric: true,
    grid: [
      [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
      [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
      [0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0],
    ],
  },

  // Side sitting dog
  {
    symmetric: false,
    grid: [
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 2, 2, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0],
    ],
  },

  // Minimal blob side dog
  {
    symmetric: false,
    grid: [
      [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 2, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 2, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0],
    ],
  },

  // Simple front standing dog
  {
    symmetric: true,
    grid: [
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 2, 1, 1, 1, 2, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 2, 1, 1, 2, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 0, 1, 0, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 0, 1, 0, 1, 0],
      [0, 2, 0, 2, 0, 0, 2, 0, 2, 0],
    ],
  },

  // ── Cross-stitch / knitwear style (2 colors: 1=body · 2=black) ───────────
  // Flat silhouettes, square ear nubs, 4 stub legs, short tail — inspired
  // by repeating tile pixel art patterns.

  // Side walk — 4 evenly-spaced legs
  {
    symmetric: false,
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0],
      [0, 1, 0, 0, 0, 0, 1, 1, 2, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0],
      [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0],
    ],
  },

  // Side trot — legs staggered (walking motion)
  {
    symmetric: false,
    grid: [
      [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    ],
  },

  // Compact side — small body, big head energy
  {
    symmetric: false,
    grid: [
      [0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
      [0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 0, 0, 1, 1, 2, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],
    ],
  },

  // Front sitting — two square ear nubs, symmetrical
  {
    symmetric: true,
    grid: [
      [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
      [0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0],
    ],
  },

  // ── Cute detailed templates (3 colors: 1=body · 2=black · 3=dark-body) ──

  // Cute side-standing dog
  {
    symmetric: false,
    grid: [
      [0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 0],
      [0, 0, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0],
      [0, 0, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 3, 0, 3, 0, 0, 3, 0, 3, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 2, 0, 2, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0],
    ],
  },

  // Cute front-sitting dog
  {
    symmetric: true,
    grid: [
      [0, 0, 3, 3, 0, 0, 0, 0, 3, 3, 0, 0],
      [0, 3, 1, 3, 0, 0, 0, 0, 3, 1, 3, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 2, 2, 1, 2, 2, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 3, 3, 1, 1, 1, 1, 1, 3, 3, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0],
      [3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0],
      [0, 0, 3, 1, 0, 0, 0, 0, 1, 3, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
      [0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0],
    ],
  },

  // Cute side-sitting dog
  {
    symmetric: false,
    grid: [
      [0, 0, 0, 0, 0, 3, 2, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 3, 1, 3, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 3, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 0, 0, 0, 0],
      [0, 0, 0, 3, 3, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 3, 1, 1, 1, 1, 1, 1, 3, 0, 0, 0, 0],
      [0, 0, 0, 3, 1, 0, 0, 3, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0],
    ],
  },

  // Cute running dog
  {
    symmetric: false,
    grid: [
      [0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 0],
      [0, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0],
      [0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 3, 0, 0, 0, 0, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0],
      [2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },

  // ── Red accent templates (4 colors: 1=body · 2=black · 3=dark · 4=red) ──

  // Chunky dark dog with red collar — side view
  {
    symmetric: false,
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0],
      [0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 0],
      [0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 3, 3, 0],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0],
      [0, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 3, 3, 3, 3, 0],
      [0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0],
      [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0],
      [0, 0, 3, 3, 0, 3, 3, 0, 0, 3, 3, 0, 3, 3, 0, 0],
      [0, 0, 3, 3, 0, 3, 3, 0, 0, 3, 3, 0, 3, 3, 0, 0],
      [0, 0, 2, 2, 0, 2, 2, 0, 0, 2, 2, 0, 2, 2, 0, 0],
    ],
  },

  // Expressive dog with black muzzle and red bow — front sitting
  {
    symmetric: true,
    grid: [
      [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0],
      [0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
      [0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
      [0, 4, 4, 4, 0, 4, 0, 4, 4, 4, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 2, 2, 0, 0, 0, 2, 2, 0, 0, 0],
    ],
  },
];

// ── MODULAR BODY-PART TEMPLATES ────────────────────────────────────────────
// 0=empty · 1=body color · 2=black · 3=dark-body · 4=accent
// All parts designed facing RIGHT; assembler flips for left-facing dogs.
//
// Anchor convention (all coords are [col, row] into the part's own grid):
//   head   → earAnchor, eyePos, snoutAnchor (right edge, snout tip), neckAnchor
//   body   → neckAnchor (top-front), tailAnchor (top-back), legAnchors[]
//   ear    → attach (base pixel placed at head's earAnchor)
//   snout  → attach (left edge aligned to head's snoutAnchor)
//   leg    → attach (top of leg placed at body's legAnchor)
//   tail   → attach (base pixel placed at body's tailAnchor)
//
// 'size' tags drive anatomy constraints (see generateDNA / applyConstraints).

const HEAD_TEMPLATES = [
  // 0 — round head
  {
    size: "medium",
    earAnchor: [2, 0],
    eyePos: [1, 2],
    snoutAnchor: [6, 2],
    neckAnchor: [2, 4],
    grid: [
      [0, 1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 0, 0],
    ],
  },
  // 1 — wide head
  {
    size: "large",
    earAnchor: [3, 0],
    eyePos: [2, 2],
    snoutAnchor: [8, 2],
    neckAnchor: [3, 4],
    grid: [
      [0, 0, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0, 0],
    ],
  },
  // 2 — boxy head
  {
    size: "medium",
    earAnchor: [2, 0],
    eyePos: [1, 2],
    snoutAnchor: [6, 3],
    neckAnchor: [2, 5],
    grid: [
      [0, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 0, 0],
    ],
  },
  // 3 — small head
  {
    size: "small",
    earAnchor: [1, 0],
    eyePos: [1, 1],
    snoutAnchor: [4, 1],
    neckAnchor: [1, 3],
    grid: [
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
    ],
  },
  // 4 — Majestic Sloped (High-Res)
  {
    size: "large",
    earAnchor: [3, 1],
    eyePos: [4, 4],
    snoutAnchor: [10, 5],
    neckAnchor: [3, 8],
    grid: [
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    ],
  },
  // 5 — Bulbous/Alien (High-Res)
  {
    size: "large",
    earAnchor: [2, 0],
    eyePos: [2, 5],
    snoutAnchor: [8, 7],
    neckAnchor: [4, 9],
    grid: [
      [0, 0, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 1, 1, 1, 0, 0],
    ],
  },
  // 6 — narrow tapered head (fox / cat profile)
  {
    size: "small",
    earAnchor: [1, 0],
    eyePos: [1, 2],
    snoutAnchor: [5, 3],
    neckAnchor: [2, 5],
    grid: [
      [0, 0, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 0, 0],
    ],
  },
];

const EAR_TEMPLATES = [
  // 0 — floppy ears (hang beside head)
  {
    size: "large",
    style: "floppy",
    attach: [0, 0],
    grid: [
      [1, 1, 0],
      [1, 1, 1],
      [1, 1, 1],
      [0, 1, 1],
    ],
  },
  // 1 — pointy upright ears
  {
    size: "medium",
    style: "pointy",
    attach: [1, 2],
    grid: [
      [0, 1, 0],
      [1, 1, 0],
      [1, 1, 0],
    ],
  },
  // 2 — square nub ears
  {
    size: "small",
    style: "nub",
    attach: [0, 1],
    grid: [
      [1, 1],
      [1, 1],
    ],
  },
  // 3 — Intricate Curved (High-Res)
  {
    size: "medium",
    style: "pointy",
    attach: [1, 7],
    grid: [
      [0, 0, 0, 1, 1],
      [0, 0, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 0, 0],
      [1, 1, 1, 0, 0],
      [1, 1, 0, 0, 0],
      [1, 1, 0, 0, 0],
      [0, 1, 0, 0, 0],
    ],
  },
  // 4 — Bat Wing / Dragon (High-Res)
  {
    size: "large",
    style: "tall",
    attach: [0, 6],
    grid: [
      [0, 0, 0, 0, 1, 1],
      [0, 0, 0, 1, 1, 1],
      [0, 0, 1, 1, 0, 1],
      [0, 1, 1, 0, 0, 1],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0],
    ],
  },
  // 5 — tall upright ears (rabbit / fennec)
  {
    size: "large",
    style: "tall",
    attach: [0, 4],
    grid: [
      [1, 1],
      [1, 1],
      [1, 1],
      [1, 1],
      [1, 1],
    ],
  },
  // 6 — horn
  {
    size: "medium",
    style: "horn",
    attach: [0, 2],
    grid: [
      [0, 2],
      [1, 2],
      [1, 0],
    ],
  },
  // 7 — antennae
  {
    size: "small",
    style: "antenna",
    attach: [0, 3],
    grid: [
      [2, 0],
      [1, 0],
      [1, 0],
      [1, 0],
    ],
  },
  // 8 — small round pig / side-drooping ear
  {
    size: "small",
    style: "side",
    attach: [0, 0],
    grid: [
      [1, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
  },
];

const EYE_TEMPLATES = [
  // 0 — Un solo puntito clásico (simple y adorable)
  {
    size: "small",
    style: "dot",
    grid: [
      [2, 2],
      [2, 2],
    ],
  },

  // 1 — Ojo redondo estándar (el más común en kawaii)
  {
    size: "medium",
    style: "round",
    grid: [
      [0, 2, 2, 0],
      [2, 2, 2, 2],
      [2, 2, 2, 2],
      [0, 2, 2, 0],
    ],
  },

  // 2 — Ojo ovalado "kawaii" con brillo (un píxel vacío en la esquina)
  {
    size: "large",
    style: "cute",
    grid: [
      [0, 2, 2, 2, 0],
      [2, 0, 0, 2, 2], // El '0' en [1,1] y [1,2] es el brillo
      [2, 2, 2, 2, 2],
      [0, 2, 2, 2, 0],
    ],
  },

  // 3 — Ojo rasgado "sereno" (solo dos líneas oscuras)
  {
    size: "medium",
    style: "focused",
    grid: [
      [0, 0, 0, 0, 0],
      [2, 2, 2, 2, 0],
      [2, 2, 2, 2, 0],
      [0, 0, 0, 0, 0],
    ],
  },

  // 4 — "Kawaii Sparkle" con brillo complejo (simulando una estrella)
  {
    size: "large",
    style: "starshine",
    grid: [
      [0, 0, 2, 0, 0],
      [0, 2, 0, 2, 0], // El '0' en [1,2] es el brillo central
      [2, 0, 2, 0, 2],
      [0, 2, 0, 2, 0],
      [0, 0, 2, 0, 0],
    ],
  },
];

const SNOUT_TEMPLATES = [
  // 0 — round snout with nose dot
  {
    size: "medium",
    style: "round",
    attach: [0, 0],
    grid: [
      [1, 1, 1],
      [1, 2, 1],
    ],
  },
  // 1 — Detailed Wolf/Dragon Snout (High-Res)
  {
    size: "large",
    style: "long",
    attach: [0, 1],
    grid: [
      [1, 1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 2, 2, 2],
      [1, 1, 1, 0, 0, 0, 0],
    ],
  },
  // 2 — small button snout
  {
    size: "small",
    style: "button",
    attach: [0, 0],
    grid: [
      [1, 1],
      [2, 0],
    ],
  },
  // 3 — Feline/Detailed Button (High-Res)
  {
    size: "medium",
    style: "catnose",
    attach: [0, 1],
    grid: [
      [1, 1, 1, 1],
      [1, 2, 2, 1],
      [1, 1, 1, 0],
      [0, 2, 0, 0],
    ],
  },
  // 4 — round snout with open mouth
  {
    size: "medium",
    style: "open",
    attach: [0, 0],
    grid: [
      [1, 1, 1],
      [1, 2, 0],
      [2, 0, 0],
    ],
  },
  // 5 — pig snout (two nostrils)
  {
    size: "medium",
    style: "pig",
    attach: [0, 0],
    grid: [
      [1, 1, 1],
      [2, 1, 2],
    ],
  },
  // 6 — beak (pointed side-view triangle)
  {
    size: "medium",
    style: "beak",
    attach: [0, 1],
    grid: [
      [1, 1, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
  },
  // 7 — cat / button nose (tiny inverted triangle)
  {
    size: "small",
    style: "catnose",
    attach: [0, 0],
    grid: [
      [1, 2, 1],
      [1, 1, 0],
    ],
  },
];

const BODY_TEMPLATES = [
  // 0 — round body
  {
    size: "medium",
    neckAnchor: [10, 1],
    tailAnchor: [0, 2],
    legAnchors: [
      [3, 6],
      [5, 6],
      [7, 6],
      [9, 6],
    ],
    grid: [
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    ],
  },
  // 1 — Athletic S-Curve (High-Res)
  {
    size: "long",
    neckAnchor: [13, 2],
    tailAnchor: [0, 3],
    legAnchors: [
      [3, 9],
      [5, 9],
      [10, 9],
      [12, 9],
    ],
    grid: [
      [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
    ],
  },
  // 2 — Fluffy Beast (High-Res)
  {
    size: "heavy",
    neckAnchor: [11, 2],
    tailAnchor: [0, 4],
    legAnchors: [
      [2, 9],
      [5, 9],
      [8, 9],
      [11, 9],
    ],
    grid: [
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    ],
  },
  // 3 — compact body
  {
    size: "compact",
    neckAnchor: [7, 1],
    tailAnchor: [0, 1],
    legAnchors: [
      [2, 4],
      [4, 4],
      [6, 4],
    ],
    grid: [
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
    ],
  },
  // 4 — tall upright body
  {
    size: "medium",
    neckAnchor: [8, 1],
    tailAnchor: [0, 1],
    legAnchors: [
      [2, 6],
      [4, 6],
      [6, 6],
      [8, 6],
    ],
    grid: [
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
    ],
  },
  // 5 — El "Salchicha" (Extra Long Dachshund)
  {
    size: "long",
    neckAnchor: [15, 2],
    tailAnchor: [0, 2],
    legAnchors: [
      [2, 5],
      [4, 5],
      [12, 5],
      [14, 5],
    ],
    grid: [
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
    ],
  },
  // 6 — El "Pecho Paloma" (Heavy Gorilla-like)
  {
    size: "heavy",
    neckAnchor: [10, 1],
    tailAnchor: [0, 6],
    legAnchors: [
      [2, 9],
      [4, 9],
      [8, 9],
      [11, 9],
    ],
    grid: [
      [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
    ],
  },
  // 7 — El "Frijolito" (Tiny Bean)
  {
    size: "compact",
    neckAnchor: [6, 1],
    tailAnchor: [0, 2],
    legAnchors: [
      [1, 5],
      [5, 5],
    ],
    grid: [
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 0, 0, 0, 1, 0, 0],
    ],
  },
  // 8 — El "Escalonado" (Geometric / Voxel Steps)
  {
    size: "medium",
    neckAnchor: [11, 1],
    tailAnchor: [0, 5],
    legAnchors: [
      [2, 8],
      [5, 8],
      [8, 8],
      [11, 8],
    ],
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
    ],
  },
];

const LEG_TEMPLATES = [
  // 0 — short stub
  {
    size: "short",
    attach: [0, 0],
    grid: [
      [1, 1],
      [2, 2],
    ],
  },
  // 1 — Digitigrade / Animal Joint (High-Res)
  {
    size: "long",
    attach: [1, 0],
    grid: [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 1, 1],
      [0, 0, 1, 1],
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [2, 2, 2, 0],
    ],
  },
  // 2 — Thick Paw (High-Res)
  {
    size: "medium",
    attach: [1, 0],
    grid: [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [2, 2, 2, 2],
    ],
  },
  // 3 — wide round paw legs
  {
    size: "medium",
    attach: [1, 0],
    grid: [
      [0, 1, 0],
      [1, 1, 1],
      [2, 2, 2],
    ],
  },
  // 4 — thick blocky legs
  {
    size: "medium",
    attach: [1, 0],
    grid: [
      [1, 1, 1],
      [1, 1, 1],
      [2, 2, 2],
    ],
  },
  // 5 — thin stick legs
  {
    size: "long",
    style: "stick",
    attach: [0, 0],
    grid: [[1], [1], [1], [1], [1], [1], [1], [1], [2]],
  },
];

const TAIL_TEMPLATES = [
  // 0 — upright wagging tail
  {
    size: "medium",
    style: "wagging",
    attach: [0, 3],
    grid: [
      [0, 1],
      [0, 1],
      [1, 1],
      [1, 0],
    ],
  },
  // 1 — Sweeping Kitsune / Magic Tail (High-Res)
  {
    size: "large",
    style: "flowing",
    attach: [0, 8],
    grid: [
      [0, 0, 0, 0, 0, 1, 1, 0],
      [0, 0, 0, 0, 1, 1, 1, 1],
      [0, 0, 0, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  // 2 — curly tail
  {
    size: "small",
    style: "curly",
    attach: [0, 2],
    grid: [
      [0, 1, 1],
      [1, 1, 0],
      [1, 0, 0],
    ],
  },
  // 3 — Serpent Coil (High-Res)
  {
    size: "medium",
    style: "spike",
    attach: [0, 6],
    grid: [
      [0, 0, 1, 1],
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 1, 1],
      [0, 1, 1, 0],
      [1, 1, 0, 0],
    ],
  },
  // 4 — straight side tail
  { size: "small", style: "straight", attach: [3, 0], grid: [[1, 1, 1, 1]] },
  // 5 — bushy tail (fox / cat)
  {
    size: "large",
    style: "bushy",
    attach: [0, 3],
    grid: [
      [0, 1, 1],
      [1, 1, 1],
      [1, 1, 0],
      [1, 0, 0],
    ],
  },
  // 6 — fluffy pompom (rabbit / fantasy)
  {
    size: "small",
    style: "fluff",
    attach: [1, 2],
    grid: [
      [1, 1, 1],
      [1, 1, 1],
      [0, 1, 0],
    ],
  },
  // 7 — tight curly pig tail
  {
    size: "small",
    style: "pigtail",
    attach: [0, 2],
    grid: [
      [0, 1],
      [1, 0],
      [1, 0],
    ],
  },
];

const ACCESSORY_TEMPLATES = [
  // 0 — bow / ribbon
  {
    slot: "head",
    grid: [
      [4, 0, 4],
      [0, 4, 0],
      [4, 0, 4],
    ],
  },
  // 1 — collar stripe
  { slot: "neck", grid: [[4, 4, 4, 4]] },
  // 2 — tiny hat
  {
    slot: "head",
    grid: [
      [0, 2, 2, 0],
      [2, 2, 2, 2],
    ],
  },
  // 3 — Wizard Hat (High-Res)
  {
    slot: "head",
    grid: [
      [0, 0, 4, 0, 0],
      [0, 4, 4, 0, 0],
      [0, 4, 4, 4, 0],
      [4, 4, 4, 4, 4],
    ],
  },
];

// ── SPECIES REGISTRY ───────────────────────────────────────────────────────
// Each entry biases DNA part selection toward species-appropriate anatomy.
// `earStyles`, `tailSizes`, `headSizes`, `bodySizes`, `legSizes` are arrays of
// preferred values; pickBiasedIndex will favour them 70% of the time, leaving
// 30% chance for deviation so no two creatures of the same species look identical.

// Each species entry may define:
//   earStyles   → biases EAR_TEMPLATES by 'style' property
//   tailStyles  → biases TAIL_TEMPLATES by 'style' (overrides tailSizes when present)
//   tailSizes   → fallback size-based tail bias
//   snoutStyles → biases SNOUT_TEMPLATES by 'style' (optional)
//   eyeStyles   → biases EYE_TEMPLATES by 'style' (optional)
//   headSizes, bodySizes, legSizes → size-based biases

const SPECIES_REGISTRY = {
  dog: {
    label: "dog",
    earStyles: ["floppy", "nub"],
    tailStyles: ["wagging", "curly"],
    headSizes: ["medium", "large"],
    bodySizes: ["medium", "heavy", "compact"],
    legSizes: ["short", "medium"],
  },
  cat: {
    label: "cat",
    earStyles: ["pointy"],
    tailStyles: ["bushy", "flowing"],
    headSizes: ["small", "medium"],
    bodySizes: ["compact", "medium"],
    legSizes: ["medium", "long"],
    snoutStyles: ["catnose", "button"],
  },
  rabbit: {
    label: "rabbit",
    earStyles: ["tall"],
    tailStyles: ["fluff", "stub"],
    headSizes: ["medium", "large"],
    bodySizes: ["compact", "medium"],
    legSizes: ["long", "medium"],
  },
  bear: {
    label: "bear",
    earStyles: ["nub"],
    tailStyles: ["stub", "curly"],
    headSizes: ["large"],
    bodySizes: ["heavy"],
    legSizes: ["short", "medium"],
  },
  fox: {
    label: "fox",
    earStyles: ["pointy"],
    tailStyles: ["bushy", "flowing"],
    headSizes: ["medium"],
    bodySizes: ["medium", "compact"],
    legSizes: ["medium", "long"],
  },
  pig: {
    label: "pig",
    earStyles: ["side", "floppy"],
    tailStyles: ["pigtail", "curly"],
    headSizes: ["large", "medium"],
    bodySizes: ["heavy", "compact"],
    legSizes: ["short"],
    snoutStyles: ["pig"],
  },
  fantasy: {
    label: "fantasy",
    earStyles: ["horn", "antenna", "tall"],
    tailStyles: ["spike", "fluff", "bushy"],
    headSizes: ["medium", "large"],
    bodySizes: ["medium", "compact"],
    legSizes: ["medium", "long"],
    eyeStyles: ["star", "wide", "round"],
  },
};

const SPECIES_KEYS = Object.keys(SPECIES_REGISTRY);

// ── DNA GENERATION ──────────────────────────────────────────────────────────

// Picks a template index biased toward `preferredValues` (70% chance).
// Uses a single rng() call so the seed sequence stays predictable.
function pickBiasedIndex(templates, propName, preferredValues, rng) {
  const preferred = templates.reduce((acc, t, i) => {
    if (preferredValues.includes(t[propName])) acc.push(i);
    return acc;
  }, []);
  const r = rng();
  if (preferred.length > 0 && r < 0.7) {
    return preferred[Math.floor((r * preferred.length) / 0.7)];
  }
  const r2 = preferred.length > 0 ? (r - 0.7) / 0.3 : r;
  return Math.floor(r2 * templates.length);
}

// Returns the first index in `arr` whose size is in `allowed`. Falls back to 0.
function pickFirstAllowed(arr, allowed) {
  const i = arr.findIndex((t) => allowed.includes(t.size));
  return i >= 0 ? i : 0;
}

function generateDNA(rng) {
  const speciesKey = SPECIES_KEYS[Math.floor(rng() * SPECIES_KEYS.length)];
  const traits = SPECIES_REGISTRY[speciesKey];

  const headType = pickBiasedIndex(
    HEAD_TEMPLATES,
    "size",
    traits.headSizes,
    rng,
  );
  const bodyType = pickBiasedIndex(
    BODY_TEMPLATES,
    "size",
    traits.bodySizes,
    rng,
  );

  // tail: prefer style-based bias when the species has tailStyles
  const tailType = traits.tailStyles
    ? pickBiasedIndex(TAIL_TEMPLATES, "style", traits.tailStyles, rng)
    : pickBiasedIndex(TAIL_TEMPLATES, "size", traits.tailSizes || [], rng);

  // snout / eye: style bias is optional per species
  const snoutType = traits.snoutStyles
    ? pickBiasedIndex(SNOUT_TEMPLATES, "style", traits.snoutStyles, rng)
    : Math.floor(rng() * SNOUT_TEMPLATES.length);

  const eyeType = traits.eyeStyles
    ? pickBiasedIndex(EYE_TEMPLATES, "style", traits.eyeStyles, rng)
    : Math.floor(rng() * EYE_TEMPLATES.length);

  const dna = {
    headType,
    bodyType,
    earType: pickBiasedIndex(EAR_TEMPLATES, "style", traits.earStyles, rng),
    eyeType,
    snoutType,
    legType: pickBiasedIndex(LEG_TEMPLATES, "size", traits.legSizes, rng),
    tailType,
    accessory:
      rng() < 0.3 ? Math.floor(rng() * ACCESSORY_TEMPLATES.length) : -1,
    palette: Math.floor(rng() * PALETTE.length),
    facing: rng() > 0.5 ? 1 : -1,
    symmetric: rng() < 0.35,
    mutations: rollMutations(rng),
    speciesTraits: {
      species: speciesKey,
      label: traits.label,
      earStyle: traits.earStyles[0],
      bodyPref: traits.bodySizes[0],
    },
  };
  return applyConstraints(dna);
}

function applyConstraints(dna) {
  const head = HEAD_TEMPLATES[dna.headType];
  const body = BODY_TEMPLATES[dna.bodyType];
  const ear = EAR_TEMPLATES[dna.earType];
  const leg = LEG_TEMPLATES[dna.legType];
  const tail = TAIL_TEMPLATES[dna.tailType];
  const snout = SNOUT_TEMPLATES[dna.snoutType];
  const eye = EYE_TEMPLATES[dna.eyeType];
  const species = dna.speciesTraits.species;

  // ── Head ↔ Ears ───────────────────────────────────────────────────────────
  if (head.size === "small" && ear.size === "large") {
    dna.earType = pickFirstAllowed(EAR_TEMPLATES, ["small", "medium"]);
  }
  if (head.size === "large" && ear.size === "small" && ear.style === "pointy") {
    dna.earType = pickFirstAllowed(EAR_TEMPLATES, ["medium", "large"]);
  }

  // ── Head ↔ Snout ──────────────────────────────────────────────────────────
  if (head.size === "small" && snout.size === "large") {
    dna.snoutType = pickFirstAllowed(SNOUT_TEMPLATES, ["small", "medium"]);
  }
  if (head.size === "large" && snout.size === "small") {
    dna.snoutType = pickFirstAllowed(SNOUT_TEMPLATES, ["medium", "large"]);
  }

  // ── Head ↔ Eyes ───────────────────────────────────────────────────────────
  if (head.size === "small" && eye.size === "large") {
    dna.eyeType = pickFirstAllowed(EYE_TEMPLATES, ["small", "medium"]);
  }

  // ── Body ↔ Legs ───────────────────────────────────────────────────────────
  if (
    (body.size === "heavy" || body.size === "long") &&
    LEG_TEMPLATES[dna.legType].size === "short"
  ) {
    dna.legType = pickFirstAllowed(LEG_TEMPLATES, ["medium", "long"]);
  }
  if (body.size === "compact" && LEG_TEMPLATES[dna.legType].size === "long") {
    dna.legType = pickFirstAllowed(LEG_TEMPLATES, ["short", "medium"]);
  }
  if (body.size === "heavy" && LEG_TEMPLATES[dna.legType].size === "medium") {
    dna.legType = 4;
  }

  // ── Body ↔ Tail ───────────────────────────────────────────────────────────
  if (body.size === "compact" && tail.size === "large") {
    dna.tailType = pickFirstAllowed(TAIL_TEMPLATES, ["small", "medium"]);
  }
  if (body.size === "long" && tail.size === "small") {
    dna.tailType = pickFirstAllowed(TAIL_TEMPLATES, ["medium", "large"]);
  }

  // ── Species hard rules ────────────────────────────────────────────────────
  // Rabbit: tall ears and fluffy pompom tail are non-negotiable
  if (species === "rabbit") {
    const e = EAR_TEMPLATES.findIndex((t) => t.style === "tall");
    const t = TAIL_TEMPLATES.findIndex(
      (t) => t.style === "fluff" || t.style === "stub",
    );
    if (e >= 0) dna.earType = e;
    if (t >= 0) dna.tailType = t;
  }
  // Bear: nub ears define the silhouette
  if (species === "bear") {
    const e = EAR_TEMPLATES.findIndex((t) => t.style === "nub");
    if (e >= 0) dna.earType = e;
  }
  // Fox: bushy tail is the silhouette signature
  if (species === "fox") {
    const t = TAIL_TEMPLATES.findIndex((t) => t.style === "bushy");
    if (t >= 0) dna.tailType = t;
  }
  // Cat: always pointy ears; catnose preferred
  if (species === "cat") {
    const e = EAR_TEMPLATES.findIndex((t) => t.style === "pointy");
    if (e >= 0) dna.earType = e;
    const s = SNOUT_TEMPLATES.findIndex(
      (t) => t.style === "catnose" || t.style === "button",
    );
    if (s >= 0) dna.snoutType = s;
  }
  // Pig: pig snout is mandatory; tight curly tail preferred
  if (species === "pig") {
    const s = SNOUT_TEMPLATES.findIndex((t) => t.style === "pig");
    if (s >= 0) dna.snoutType = s;
    const e = EAR_TEMPLATES.findIndex(
      (t) => t.style === "side" || t.style === "floppy",
    );
    if (e >= 0) dna.earType = e;
    const t = TAIL_TEMPLATES.findIndex(
      (t) => t.style === "pigtail" || t.style === "curly",
    );
    if (t >= 0) dna.tailType = t;
  }
  // Fantasy: horns/antennae + spike/fluff tail; fancy eyes allowed on any head
  if (species === "fantasy") {
    // No strict locks — biasing + size constraints are enough for variety
    // Remove symmetry block so fantasy can freely mirror features
  }

  // ── Symmetry ↔ Head size ──────────────────────────────────────────────────
  if (dna.symmetric && head.size === "small" && species !== "fantasy")
    dna.symmetric = false;

  // ── Cute proportions ──────────────────────────────────────────────────────
  // Big head relative to body keeps creatures looking cute/chibi
  const finalHead = HEAD_TEMPLATES[dna.headType];
  const finalBody = BODY_TEMPLATES[dna.bodyType];
  if (
    finalHead.size === "small" &&
    (finalBody.size === "compact" || finalBody.size === "heavy")
  ) {
    const i = HEAD_TEMPLATES.findIndex(
      (h) => h.size === "medium" || h.size === "large",
    );
    if (i >= 0) dna.headType = i;
  }
  // Expressive eyes on medium/large heads
  if (
    finalHead.size !== "small" &&
    EYE_TEMPLATES[dna.eyeType].size === "small"
  ) {
    const i = EYE_TEMPLATES.findIndex(
      (e) => e.size === "medium" || e.size === "large",
    );
    if (i >= 0) dna.eyeType = i;
  }

  return dna;
}

// ── PIPELINE STAGE 1 — STAMP HELPER ────────────────────────────────────────

const ASSEMBLE_COLS = 50;
const ASSEMBLE_ROWS = 34;

function stampPart(canvas, partGrid, originC, originR) {
  for (let r = 0; r < partGrid.length; r++) {
    for (let c = 0; c < partGrid[r].length; c++) {
      const val = partGrid[r][c];
      if (!val) continue;
      const cr = originR + r;
      const cc = originC + c;
      if (cr < 0 || cr >= canvas.length || cc < 0 || cc >= canvas[0].length)
        continue;
      canvas[cr][cc] = val;
    }
  }
}

// ── PIPELINE STAGE 2 — buildSkeleton(dna) ──────────────────────────────────
// Pure geometry: resolves every anchor into absolute canvas coordinates.
// No pixels are written here — only a layout object is returned.

function buildSkeleton(dna, tmpl, genes) {
  const body = tmpl.body;
  const head = tmpl.head;
  const ear = tmpl.ear;
  const snout = tmpl.snout;
  const leg = tmpl.leg;
  const tail = tmpl.tail;

  const bodyC = 5 + (genes?.bodyOffsetX || 0);
  const bodyR = 12 + (genes?.bodyOffsetY || 0);

  const headC = bodyC + body.neckAnchor[0] - head.neckAnchor[0];
  const headR = bodyR + body.neckAnchor[1] - head.neckAnchor[1];

  const activeLegs = genes?.legCount ?? 4;
  return {
    bodyC,
    bodyR,
    headC,
    headR,
    eyeC: headC + head.eyePos[0],
    eyeR: headR + head.eyePos[1],
    earC: headC + head.earAnchor[0] - ear.attach[0],
    earR: headR + head.earAnchor[1] - ear.attach[1],
    snoutC: headC + head.snoutAnchor[0] - snout.attach[0],
    snoutR: headR + head.snoutAnchor[1] - snout.attach[1],
    tailC: bodyC + body.tailAnchor[0] - tail.attach[0],
    tailR: bodyR + body.tailAnchor[1] - tail.attach[1],
    legPositions: body.legAnchors.slice(0, activeLegs).map(([lc, lr]) => ({
      c: bodyC + lc - leg.attach[0],
      r: bodyR + lr,
    })),
  };
}

// ── PIPELINE STAGE 3 — assembleBodyParts(dna, skeleton) ────────────────────
// Stamps every body part onto the canvas in back-to-front order.
// Returns the filled ASSEMBLE_COLS × ASSEMBLE_ROWS grid.

function assembleBodyParts(dna, skeleton, tmpl, genes) {
  const canvas = Array.from(
    { length: ASSEMBLE_ROWS },
    () => new Uint8Array(ASSEMBLE_COLS),
  );
  const {
    bodyC,
    bodyR,
    headC,
    headR,
    eyeC,
    eyeR,
    earC,
    earR,
    snoutC,
    snoutR,
    tailC,
    tailR,
    legPositions,
  } = skeleton;

  // back → front
  stampPart(canvas, tmpl.tail.grid, tailC, tailR);

  // Segmented tail: black dividers across tail every ~quarter height
  if (genes?.segmentedTail) {
    const segH = Math.max(2, Math.round(tmpl.tail.grid.length / 4));
    for (let seg = 1; seg <= 3; seg++) {
      const segR = tailR + seg * segH;
      if (segR >= 0 && segR < canvas.length) {
        for (let c = tailC; c < tailC + tmpl.tail.grid[0].length; c++) {
          if (c >= 0 && c < canvas[0].length && canvas[segR][c] === 1)
            canvas[segR][c] = 2;
        }
      }
    }
  }

  stampPart(canvas, tmpl.body.grid, bodyC, bodyR);
  stampPart(canvas, tmpl.head.grid, headC, headR);
  stampPart(canvas, tmpl.snout.grid, snoutC, snoutR);
  stampPart(canvas, tmpl.ear.grid, earC, earR);
  for (const { c, r } of legPositions) stampPart(canvas, tmpl.leg.grid, c, r);
  stampPart(canvas, tmpl.eye.grid, eyeC, eyeR);

  // Multiple eyes (LEGENDARY): mirror second eye + third eye centered above
  if (genes?.multipleEyes) {
    const headW = tmpl.head.grid[0].length;
    const eyeW = tmpl.eye.grid[0].length;
    const mirC = headC + (headW - (eyeC - headC) - eyeW);
    stampPart(canvas, flipGrid(tmpl.eye.grid), mirC, eyeR);
    const thirdC = headC + Math.floor(headW / 2) - Math.floor(eyeW / 2);
    const thirdR = eyeR - tmpl.eye.grid.length - 1;
    stampPart(canvas, tmpl.eye.grid, thirdC, thirdR);
  }

  if (dna.symmetric)
    addSymmetricFeatures(canvas, dna, headC, headR, tmpl, genes);

  if (dna.accessory >= 0) {
    const acc = ACCESSORY_TEMPLATES[dna.accessory];
    const head = tmpl.head;
    if (acc.slot === "head") {
      stampPart(canvas, acc.grid, headC + 1, headR - acc.grid.length);
    } else if (acc.slot === "neck") {
      stampPart(
        canvas,
        acc.grid,
        headC + head.neckAnchor[0] - 1,
        headR + head.neckAnchor[1],
      );
    }
  }

  return canvas;
}

// ── HORIZONTAL SYMMETRY ─────────────────────────────────────────────────────
// Mirrors eye and ear to the opposite side of the head so the dog appears
// to look at the viewer even from a side-profile stance.
// Called only when dna.symmetric === true (enforced: medium/large heads only).

function addSymmetricFeatures(canvas, dna, headC, headR, tmpl, genes) {
  const head = tmpl.head;
  const eye = tmpl.eye;
  const ear = tmpl.ear;
  const headW = head.grid[0].length;

  // Mirror eye
  // Mirror eye
  const eyeRelC = head.eyePos[0];
  const eyeW = eye.grid[0].length;
  const mirEyeRelC = headW - eyeRelC - eyeW;
  if (mirEyeRelC >= 0 && mirEyeRelC !== eyeRelC) {
    // Si el ojo tiene brillo, no queremos que se invierta el brillo a la izquierda
    // Lo ideal es estampar el ojo original, no el espejado.
    stampPart(canvas, eye.grid, headC + mirEyeRelC, headR + head.eyePos[1]);
  }

  // Mirror ear — skip for asymmetric gene (singleEar / extremeAsymmetry)
  if (!(genes?.asymmetryChance > 0)) {
    const earRelC = head.earAnchor[0] - ear.attach[0];
    const earRelR = head.earAnchor[1] - ear.attach[1];
    const earW = ear.grid[0].length;
    const mirEarRelC = headW - earRelC - earW;
    if (mirEarRelC >= 0 && mirEarRelC !== earRelC) {
      stampPart(
        canvas,
        flipGrid(ear.grid),
        headC + mirEarRelC,
        headR + earRelR,
      );
    }
  }
}

// ── PIPELINE STAGE 4 — addDetails(canvas, dna, skeleton) ───────────────────
// Paints fine details on top of the assembled flat silhouette:
//   · eye catchlight  · body bottom shading  · paw ankle accent
//   · cheek blush for symmetric (front-facing) dogs

function addDetails(canvas, dna, skeleton, tmpl) {
  const head = tmpl.head;
  const body = tmpl.body;
  const eye = tmpl.eye;
  const leg = tmpl.leg;
  const { eyeC, eyeR, bodyC, bodyR, headC, headR, legPositions } = skeleton;

  // ── Eye catchlight ────────────────────────────────────────────────────────
  // Clear the first solid eye pixel to create a white sparkle.
  // Only applied when the eye occupies more than one pixel so it stays readable.
  const eyeCells = [];
  for (let r = 0; r < eye.grid.length; r++)
    for (let c = 0; c < eye.grid[r].length; c++)
      if (eye.grid[r][c]) eyeCells.push([eyeR + r, eyeC + c]);
  if (eyeCells.length > 1) {
    const [sr, sc] = eyeCells[0];
    if (sr >= 0 && sr < canvas.length && sc >= 0 && sc < canvas[0].length)
      canvas[sr][sc] = 0;
  }

  // ── Bottom-edge body shading ──────────────────────────────────────────────
  // Darken the lowest body row (val 1 → 3) for a subtle ground-plane hint.
  const bodyGrid = body.grid;
  const bottomRow = bodyR + bodyGrid.length - 1;
  if (bottomRow >= 0 && bottomRow < canvas.length) {
    for (let c = bodyC; c < bodyC + bodyGrid[0].length; c++) {
      if (c >= 0 && c < canvas[0].length && canvas[bottomRow][c] === 1)
        canvas[bottomRow][c] = 3;
    }
  }

  // ── Paw ankle accent ──────────────────────────────────────────────────────
  // Darken the row immediately above each black paw strip.
  const legGrid = leg.grid;
  for (const { c: lc, r: lr } of legPositions) {
    const ankleRow = lr + legGrid.length - 2;
    if (ankleRow < 0 || ankleRow >= canvas.length) continue;
    for (let dc = 0; dc < legGrid[0].length; dc++) {
      const cc = lc + dc;
      if (cc >= 0 && cc < canvas[0].length && canvas[ankleRow][cc] === 1)
        canvas[ankleRow][cc] = 3;
    }
  }

  // ── Cheek blush (symmetric / front-facing dogs only) ──────────────────────
  if (dna.symmetric && head.size !== "small") {
    const headW = head.grid[0].length;
    const cx = headC + Math.floor(headW / 2);
    const blushR = headR + Math.floor(head.grid.length * 0.6);
    for (const bc of [cx - 2, cx + 1]) {
      if (
        bc >= 0 &&
        bc < canvas[0].length &&
        blushR >= 0 &&
        blushR < canvas.length &&
        canvas[blushR][bc] === 1
      )
        canvas[blushR][bc] = 3;
    }
  }
}

// ── MORPHOLOGY GENES ──────────────────────────────────────────────────────

function scalePartGrid(grid, sx, sy) {
  if (sx === 1 && sy === 1) return grid;
  const srcH = grid.length,
    srcW = grid[0].length;
  const dstH = Math.max(1, Math.round(srcH * sy));
  const dstW = Math.max(1, Math.round(srcW * sx));
  return Array.from({ length: dstH }, (_, r) =>
    Array.from(
      { length: dstW },
      (_, c) =>
        grid[Math.min(Math.floor(r / sy), srcH - 1)][
          Math.min(Math.floor(c / sx), srcW - 1)
        ],
    ),
  );
}

function scaledTemplate(tmpl, sx, sy) {
  if (sx === 1 && sy === 1) return tmpl;
  const s = (v, f) => Math.round(v * f);
  const scaled = { ...tmpl, grid: scalePartGrid(tmpl.grid, sx, sy) };
  if (tmpl.neckAnchor)
    scaled.neckAnchor = [s(tmpl.neckAnchor[0], sx), s(tmpl.neckAnchor[1], sy)];
  if (tmpl.earAnchor)
    scaled.earAnchor = [s(tmpl.earAnchor[0], sx), s(tmpl.earAnchor[1], sy)];
  if (tmpl.eyePos)
    scaled.eyePos = [s(tmpl.eyePos[0], sx), s(tmpl.eyePos[1], sy)];
  if (tmpl.snoutAnchor)
    scaled.snoutAnchor = [
      s(tmpl.snoutAnchor[0], sx),
      s(tmpl.snoutAnchor[1], sy),
    ];
  if (tmpl.tailAnchor)
    scaled.tailAnchor = [s(tmpl.tailAnchor[0], sx), s(tmpl.tailAnchor[1], sy)];
  if (tmpl.legAnchors)
    scaled.legAnchors = tmpl.legAnchors.map(([c, r]) => [s(c, sx), s(r, sy)]);
  if (tmpl.attach)
    scaled.attach = [s(tmpl.attach[0], sx), s(tmpl.attach[1], sy)];
  return scaled;
}

const MORPH_VARIANTS = {
  COMMON: null,
  UNCOMMON: [
    "bigEars",
    "shortLegs",
    "bigNose",
    "longTail",
    "tinyBody",
    "hugeEyes",
  ],
  RARE: [
    "missingLegs",
    "singleEar",
    "doubleTail",
    "giantHead",
    "floatingBody",
    "tinyFace",
    "thickLegs",
  ],
  LEGENDARY: [
    "horns",
    "wings",
    "multipleEyes",
    "segmentedTail",
    "alienProportions",
    "extremeAsymmetry",
  ],
};

function rollMorphTier(rng) {
  const r = rng() * 100;
  if (r < 70) return "COMMON";
  if (r < 90) return "UNCOMMON";
  if (r < 98) return "RARE";
  return "LEGENDARY";
}

function generateMorphologyGenes(rng) {
  const tier = rollMorphTier(rng);
  const variants = MORPH_VARIANTS[tier];
  const variant = variants
    ? variants[Math.floor(rng() * variants.length)]
    : "normal";

  const g = {
    headScale: 1,
    bodyScale: 1,
    legLength: 1,
    legCount: 4,
    armLength: 1,
    neckLength: 1,
    tailLength: 1,
    earSize: 1,
    noseSize: 1,
    eyeSpacing: 1,
    bodyOffsetX: 0,
    bodyOffsetY: 0,
    asymmetryChance: 0,
    mutationType: tier,
    variant,
    multipleEyes: false,
    segmentedTail: false,
    forceMutations: null,
  };

  if (tier === "UNCOMMON") {
    if (variant === "bigEars") g.earSize = 1.8;
    if (variant === "shortLegs") g.legLength = 0.5;
    if (variant === "bigNose") g.noseSize = 1.7;
    if (variant === "longTail") g.tailLength = 2.0;
    if (variant === "tinyBody") {
      g.bodyScale = 0.65;
      g.headScale = 1.2;
    }
    if (variant === "hugeEyes") {
      g.headScale = 1.3;
      g.eyeSpacing = 1.3;
    }
  }
  if (tier === "RARE") {
    if (variant === "missingLegs") g.legCount = 0;
    if (variant === "singleEar") g.asymmetryChance = 1.0;
    if (variant === "doubleTail") g.tailLength = 2.5;
    if (variant === "giantHead") {
      g.headScale = 2.0;
      g.bodyScale = 0.8;
    }
    if (variant === "floatingBody") g.bodyOffsetY = -5;
    if (variant === "tinyFace") {
      g.headScale = 0.55;
      g.bodyScale = 1.2;
    }
    if (variant === "thickLegs") g.legLength = 1.4;
  }
  if (tier === "LEGENDARY") {
    if (variant === "horns") {
      g.headScale = 1.4;
      g.forceMutations = ["horn"];
    }
    if (variant === "wings") {
      g.bodyScale = 1.3;
      g.bodyOffsetY = -3;
      g.forceMutations = ["tiny_wings"];
    }
    if (variant === "multipleEyes") {
      g.headScale = 1.5;
      g.multipleEyes = true;
    }
    if (variant === "segmentedTail") {
      g.tailLength = 3.5;
      g.segmentedTail = true;
    }
    if (variant === "alienProportions") {
      g.headScale = 2.2;
      g.bodyScale = 0.5;
      g.legLength = 0.4;
      g.bodyOffsetY = 2;
    }
    if (variant === "extremeAsymmetry") {
      g.earSize = 2.2;
      g.asymmetryChance = 1.0;
    }
  }
  return g;
}

function buildMorphedTemplates(dna, genes) {
  return {
    head: scaledTemplate(
      HEAD_TEMPLATES[dna.headType],
      genes.headScale,
      genes.headScale,
    ),
    body: scaledTemplate(
      BODY_TEMPLATES[dna.bodyType],
      genes.bodyScale,
      genes.bodyScale,
    ),
    ear: scaledTemplate(
      EAR_TEMPLATES[dna.earType],
      genes.earSize,
      genes.earSize,
    ),
    eye: scaledTemplate(EYE_TEMPLATES[dna.eyeType], 1, 1),
    snout: scaledTemplate(
      SNOUT_TEMPLATES[dna.snoutType],
      genes.noseSize,
      genes.noseSize,
    ),
    leg: scaledTemplate(LEG_TEMPLATES[dna.legType], 1, genes.legLength),
    tail: scaledTemplate(TAIL_TEMPLATES[dna.tailType], 1, genes.tailLength),
  };
}

// ── MUTATIONS ──────────────────────────────────────────────────────────────

const TINY_WING_GRID = [
  [0, 2, 0, 2, 0],
  [2, 1, 2, 1, 2],
  [0, 2, 1, 2, 0],
  [0, 0, 2, 0, 0],
];

function rollMutations(rng) {
  if (rng() >= 0.08) return [];
  const pool = [
    "extra_ear",
    "tiny_wings",
    "double_tail",
    "horn",
    "unusual_color",
    "asymmetry",
  ];
  const mutations = [pool[Math.floor(rng() * pool.length)]];
  if (rng() < 0.02) {
    const rest = pool.filter((m) => m !== mutations[0]);
    mutations.push(rest[Math.floor(rng() * rest.length)]);
  }
  return mutations;
}

function applyMutationExtraEar(canvas, dna, skeleton) {
  // Stamp a second ear slightly offset above the primary ear
  const ear = EAR_TEMPLATES[dna.earType];
  if (!ear) return;
  const offsetC = skeleton.earC + Math.floor(ear.grid[0].length * 0.6);
  const offsetR = skeleton.earR - 1;
  const tinyEar = ear.grid.map((row) => row.map((v) => (v ? v : 0)));
  stampPart(canvas, tinyEar, offsetC, offsetR);
}

function applyMutationTinyWings(canvas, dna, skeleton) {
  // Stamp small wings on each side of the body
  const wingR = skeleton.bodyR + 1;
  const bodyW = BODY_TEMPLATES[dna.bodyType].grid[0].length;
  // Left wing (mirrored)
  const leftWing = TINY_WING_GRID.map((row) => [...row].reverse());
  stampPart(canvas, leftWing, skeleton.bodyC - leftWing[0].length, wingR);
  // Right wing
  stampPart(canvas, TINY_WING_GRID, skeleton.bodyC + bodyW, wingR);
}

function applyMutationDoubleTail(canvas, dna, skeleton) {
  // Stamp a second tail one row above the first
  const tail = TAIL_TEMPLATES[dna.tailType];
  if (!tail) return;
  stampPart(
    canvas,
    tail.grid,
    skeleton.tailC,
    skeleton.tailR - Math.ceil(tail.grid.length * 0.4),
  );
}

function applyMutationHorn(canvas, dna, skeleton) {
  // Place a small horn pixel cluster on top of the head
  const hornGrid = [
    [0, 2, 0],
    [2, 1, 2],
    [0, 2, 0],
  ];
  const head = HEAD_TEMPLATES[dna.headType];
  const hornC = skeleton.headC + Math.floor(head.grid[0].length / 2) - 1;
  const hornR = skeleton.headR - hornGrid.length;
  stampPart(canvas, hornGrid, hornC, hornR);
}

function applyMutationUnusualColor(canvas, dna, skeleton) {
  // Pick a contrasting palette entry and re-tint a horizontal stripe across the body
  const altPalette = (dna.palette + 3) % PALETTE.length;
  dna.mutationAccentPalette = altPalette;
  const body = BODY_TEMPLATES[dna.bodyType];
  const stripeR = skeleton.bodyR + Math.floor(body.grid.length / 2);
  if (stripeR < 0 || stripeR >= canvas.length) return;
  for (let c = skeleton.bodyC; c < skeleton.bodyC + body.grid[0].length; c++) {
    if (c >= 0 && c < canvas[0].length && canvas[stripeR][c] === 1) {
      canvas[stripeR][c] = 4; // use accent value to signal alt color at render time
    }
  }
}

function applyMutationAsymmetry(canvas, dna, skeleton) {
  // Erase one ear region to create deliberate asymmetry
  const ear = EAR_TEMPLATES[dna.earType];
  if (!ear) return;
  const eraseR = skeleton.earR;
  const eraseC = skeleton.earC;
  for (let r = 0; r < ear.grid.length; r++) {
    for (let c = 0; c < ear.grid[r].length; c++) {
      const cr = eraseR + r;
      const cc = eraseC + c;
      if (cr >= 0 && cr < canvas.length && cc >= 0 && cc < canvas[0].length) {
        if (canvas[cr][cc] !== 0) canvas[cr][cc] = 0;
      }
    }
  }
}

function applyMutations(canvas, dna, skeleton) {
  if (!dna.mutations || dna.mutations.length === 0) return;
  for (const m of dna.mutations) {
    if (m === "extra_ear") applyMutationExtraEar(canvas, dna, skeleton);
    if (m === "tiny_wings") applyMutationTinyWings(canvas, dna, skeleton);
    if (m === "double_tail") applyMutationDoubleTail(canvas, dna, skeleton);
    if (m === "horn") applyMutationHorn(canvas, dna, skeleton);
    if (m === "unusual_color") applyMutationUnusualColor(canvas, dna, skeleton);
    if (m === "asymmetry") applyMutationAsymmetry(canvas, dna, skeleton);
  }
}

const state = {
  format: "A4",
  landscape: false,
  pixelCols: 100,
  seed: null,
  creatures: [],
  needsRedraw: true,
  effects: {
    dither: false,
    roundness: 0,
    texture: false,
  },
  history: [],
};

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let pg, rng, blobCanvas, finalBlobCanvas, sketchP;

// ── HISTORY / UNDO ──────────────────────────────────────────────────────────
const HISTORY_LIMIT = 30;

function cloneCreatureState(creature) {
  return {
    ...creature,
    grid: creature.grid.map((row) => Array.from(row)),
    dna: JSON.parse(JSON.stringify(creature.dna)),
    genes: JSON.parse(JSON.stringify(creature.genes)),
  };
}

function createStateSnapshot() {
  return {
    pixelCols: state.pixelCols,
    seed: state.seed,
    format: state.format,
    landscape: state.landscape,
    effects: JSON.parse(JSON.stringify(state.effects)),
    creatures: state.creatures.map(cloneCreatureState),
  };
}

function restoreStateSnapshot(snapshot) {
  state.pixelCols = snapshot.pixelCols;
  state.seed = snapshot.seed;
  state.format = snapshot.format;
  state.landscape = snapshot.landscape;
  state.effects = JSON.parse(JSON.stringify(snapshot.effects));
  state.creatures = snapshot.creatures.map((c) => cloneCreatureState(c));
  syncUI();
}

function pushHistory() {
  const snapshot = createStateSnapshot();
  state.history.push(snapshot);
  if (state.history.length > HISTORY_LIMIT) state.history.shift();
}

function undo() {
  if (!state.history.length) return;
  const snapshot = state.history.pop();
  restoreStateSnapshot(snapshot);
  state.needsRedraw = true;
  if (sketchP) sketchP.loop();
}

function syncUI() {
  const slider = document.getElementById("slider-pixel");
  const metaPixel = document.getElementById("meta-pixel");
  const sliderRound = document.getElementById("slider-round");
  const ditherBtn = document.getElementById("btn-dither");
  const metaDogs = document.getElementById("meta-dogs");
  const btnA4 = document.getElementById("btn-a4");
  const btnA3 = document.getElementById("btn-a3");

  if (slider) slider.value = state.pixelCols;
  if (metaPixel) metaPixel.textContent = `${state.pixelCols} columnas`;
  if (sliderRound) sliderRound.value = state.effects.roundness;
  if (ditherBtn) {
    ditherBtn.classList.toggle("on", state.effects.dither);
    ditherBtn.textContent = state.effects.dither
      ? "[ dithered: on ]"
      : "[ dithered: off ]";
  }
  if (btnA4) btnA4.classList.toggle("active", state.format === "A4");
  if (btnA3) btnA3.classList.toggle("active", state.format === "A3");
  const btnUndo = document.getElementById("btn-undo");
  if (btnUndo) {
    btnUndo.disabled = state.history.length === 0;
    btnUndo.classList.toggle("disabled", state.history.length === 0);
  }
  if (metaDogs) {
    const label =
      state.creatures.length > 0 ? state.creatures[0].species : "creature";
    metaDogs.textContent = `× ${state.creatures.length} ${label}${
      state.creatures.length > 1 ? "s" : ""
    }`;
  }
}

// ── SKETCH ─────────────────────────────────────────────────────────────────

new p5(function (p) {
  p.setup = function () {
    const wrapper = document.getElementById("canvas-wrapper");
    const dims = scaledDims();
    p.createCanvas(dims.w, dims.h).parent(wrapper);
    sketchP = p;
    p.noLoop();
    const fmt = getFormat();
    pg = p.createGraphics(fmt.w, fmt.h);

    // Lienzo para dibujar los círculos borrosos
    blobCanvas = p.createGraphics(fmt.w, fmt.h);
    // Lienzo final donde aplicamos el contraste (threshold)
    finalBlobCanvas = p.createGraphics(fmt.w, fmt.h);

    wireUI(p);
    generateCreatures(1);
    syncUI();
  };

  p.draw = function () {
    if (!state.needsRedraw) return;
    state.needsRedraw = false;
    renderFrame(p);
  };

  // NUEVO: Esto escucha cuando giras el teléfono o cambias el tamaño de ventana
  p.windowResized = function () {
    const dims = scaledDims();
    p.resizeCanvas(dims.w, dims.h);
    state.needsRedraw = true;
    p.loop(); // Forzamos a que se redibuje con el nuevo tamaño
  };
});

function scaledDims() {
  const fmt = getFormat();
  // NUEVO: Ahora medimos el contenedor real (.canvas-area) en lugar de asumir 260px
  const area = document.querySelector(".canvas-area");
  const availW = area.clientWidth;
  const availH = area.clientHeight;

  // Usamos 0.90 para dejar un bonito margen alrededor del papel
  const scale = Math.min(availW / fmt.w, availH / fmt.h) * 0.9;

  return { w: Math.floor(fmt.w * scale), h: Math.floor(fmt.h * scale) };
}

let creatureLayer;

function renderFrame(p) {
  const fmt = getFormat();

  if (!pg || !creatureLayer || pg.width !== fmt.w || pg.height !== fmt.h) {
    if (pg) pg.remove();
    if (creatureLayer) creatureLayer.remove();
    pg = p.createGraphics(fmt.w, fmt.h);
    creatureLayer = p.createGraphics(fmt.w, fmt.h); // Capa invisible
  }

  pg.background(CANVAS_BG);

  for (const dog of state.creatures) {
    if (state.effects.roundness > 0) {
      creatureLayer.clear();
      // Dibujamos los bloques cuadrados en la capa transparente
      drawPixelCreature(creatureLayer, dog);

      // Ajustamos la fuerza del filtro según el slider y el tamaño del píxel
      const blurVal = dog.cellSize * 0.4 * (state.effects.roundness / 10);
      document.getElementById("goo-blur").setAttribute("stdDeviation", blurVal);

      // Pegamos la capa aplicando el Filtro "Gooey" (GPU Acelerado)
      pg.drawingContext.filter = "url(#goo)";
      pg.image(creatureLayer, 0, 0);
      pg.drawingContext.filter = "none"; // Reseteamos el filtro
    } else {
      // Si el slider es 0, dibujamos normal
      drawPixelCreature(pg, dog);
    }
  }

  const dims = scaledDims();
  p.resizeCanvas(dims.w, dims.h);
  p.smooth();
  p.image(pg, 0, 0, dims.w, dims.h);
}

// ── NUEVO MOTOR LÍQUIDO (METABALLS) ──

function drawBlobCreature(targetG, dog) {
  const { grid, cellSize, startX, startY, color } = dog;

  // 1. Limpiamos los lienzos temporales
  blobCanvas.clear();
  finalBlobCanvas.clear();

  // 2. Dibujamos la criatura como círculos borrosos (blobs)
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const val = grid[r][c];
      if (val) {
        drawCellBlob(
          blobCanvas,
          startX + c * cellSize,
          startY + r * cellSize,
          cellSize,
          val,
          color,
        );
      }
    }
  }

  // 3. Aplicamos el contraste extremo (Threshold) para redondear uniones
  finalBlobCanvas.image(blobCanvas, 0, 0);
  finalBlobCanvas.loadPixels();

  // Umbral de dureza del borde (160 es ideal para formas orgánicas)
  const threshold = 160;

  for (let i = 0; i < finalBlobCanvas.pixels.length; i += 4) {
    // Si la opacidad del píxel supera el umbral, lo hacemos sólido
    if (finalBlobCanvas.pixels[i + 3] > threshold) {
      finalBlobCanvas.pixels[i + 3] = 255;
    } else {
      // Si no, lo hacemos 100% transparente
      finalBlobCanvas.pixels[i + 3] = 0;
    }
  }
  finalBlobCanvas.updatePixels();

  // 4. Pegamos la criatura resultante en el lienzo principal
  targetG.image(finalBlobCanvas, 0, 0);
}

function drawCellBlob(g, px, py, cs, val, color) {
  g.noStroke();

  if (val === 1) g.fill(color);
  else if (val === 3) g.fill(darkenHex(color, 0.55));
  else if (val === 4) g.fill(RED_ACCENT);
  else g.fill(BLACK);

  // Cuanto más alto el slider, más grande es el círculo
  const expandFactor = 1 + state.effects.roundness / 10;
  const blobSize = cs * expandFactor;

  const centerX = px + cs / 2;
  const centerY = py + cs / 2;

  // Dibujamos círculos en lugar de cuadrados
  g.ellipse(centerX, centerY, blobSize, blobSize);
}

// ── NUEVO MOTOR LÍQUIDO (METABALLS) ──

function drawBlobCreature(targetG, dog) {
  const { grid, cellSize, startX, startY, color } = dog;

  // 1. Limpiamos los lienzos temporales
  blobCanvas.clear();
  finalBlobCanvas.clear();

  // 2. Dibujamos la criatura como círculos borrosos (blobs)
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const val = grid[r][c];
      if (val) {
        drawCellBlob(
          blobCanvas,
          startX + c * cellSize,
          startY + r * cellSize,
          cellSize,
          val,
          color,
        );
      }
    }
  }

  // 3. Aplicamos el contraste extremo (Threshold) para redondear uniones
  finalBlobCanvas.image(blobCanvas, 0, 0);
  finalBlobCanvas.loadPixels();

  // Umbral de dureza del borde (160 es ideal para formas orgánicas)
  const threshold = 160;

  for (let i = 0; i < finalBlobCanvas.pixels.length; i += 4) {
    // Si la opacidad del píxel supera el umbral, lo hacemos sólido
    if (finalBlobCanvas.pixels[i + 3] > threshold) {
      finalBlobCanvas.pixels[i + 3] = 255;
    } else {
      // Si no, lo hacemos 100% transparente
      finalBlobCanvas.pixels[i + 3] = 0;
    }
  }
  finalBlobCanvas.updatePixels();

  // 4. Pegamos la criatura resultante en el lienzo principal
  targetG.image(finalBlobCanvas, 0, 0);
}

function drawCellBlob(g, px, py, cs, val, color) {
  g.noStroke();

  if (val === 1) g.fill(color);
  else if (val === 3) g.fill(darkenHex(color, 0.55));
  else if (val === 4) g.fill(RED_ACCENT);
  else g.fill(BLACK);

  // Cuanto más alto el slider, más grande es el círculo
  const expandFactor = 1 + state.effects.roundness / 10;
  const blobSize = cs * expandFactor;

  const centerX = px + cs / 2;
  const centerY = py + cs / 2;

  // Dibujamos círculos en lugar de cuadrados
  g.ellipse(centerX, centerY, blobSize, blobSize);
}

// ── COLOR HELPERS ──────────────────────────────────────────────────────────

function darkenHex(hex, f) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${(r * f) | 0},${(g * f) | 0},${(b * f) | 0})`;
}

// ── CELL DRAW ──────────────────────────────────────────────────────────────
// val 1 = body color · val 2 = black · val 3 = dark body (~55%) · val 4 = red accent

const RED_ACCENT = "#CC2020";

function drawCell(g, px, py, cs, val, color) {
  g.noStroke();

  if (val === 1) {
    // ¡Restricción eliminada! Ahora el dither funciona siempre que el botón esté activo.
    if (state.effects.dither) {
      let gridX = Math.floor(px / cs);
      let gridY = Math.floor(py / cs);
      const bayer = [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5],
      ];

      // Aseguramos que tome la primera criatura como referencia de altura
      let creature = state.creatures[0];
      let relativeY = (py - creature.startY) / (creature.grid.length * cs);
      let threshold = relativeY * 18;

      if (bayer[gridY % 4][gridX % 4] < threshold) {
        g.fill(darkenHex(color, 0.85));
      } else {
        g.fill(color);
      }
    } else {
      g.fill(color);
    }
  } else if (val === 3) g.fill(darkenHex(color, 0.55));
  else if (val === 4) g.fill(RED_ACCENT);
  else g.fill(BLACK);

  // Dibujamos el bloque.
  // cs + 1 previene líneas blancas entre píxeles antes de aplicar el filtro.
  g.rect(px, py, cs + 1, cs + 1);
}

// ── PIPELINE STAGE 5 — render(g, dog) ──────────────────────────────────────
// Translates a dog's scaled grid into p5 draw calls on graphics buffer g.

function render(g, dog) {
  drawPixelCreature(g, dog);
}

function drawPixelCreature(g, dog) {
  const { grid, cellSize, startX, startY, color } = dog;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const val = grid[r][c];
      if (val) {
        // Volvemos a la versión limpia y sencilla
        drawCell(
          g,
          startX + c * cellSize,
          startY + r * cellSize,
          cellSize,
          val,
          color,
        );
      }
    }
  }
}

// ── DOG RASTERIZER ─────────────────────────────────────────────────────────
// All anatomy coords defined in base 40×54 space, scaled to any spriteCols.
// Guaranteed parts: tail, body, legs, paws, head, ears, eyes.
// val 1 = base color · val 2 = black

function rasterizeCreature(facing, opts, spriteCols, spriteRows) {
  const cols = spriteCols;
  const rows = spriteRows;
  const grid = Array.from({ length: rows }, () => new Uint8Array(cols));
  const sx = cols / 40;
  const sy = rows / 54;

  function fx(cx) {
    return facing === 1 ? cx * sx : cols - 1 - cx * sx;
  }

  function fill(rawCx, rawCy, rawRx, rawRy, val) {
    const cx = fx(rawCx),
      cy = rawCy * sy;
    const rx = rawRx * sx,
      ry = rawRy * sy;
    const x0 = Math.max(0, Math.floor(cx - rx));
    const x1 = Math.min(cols - 1, Math.ceil(cx + rx));
    const y0 = Math.max(0, Math.floor(cy - ry));
    const y1 = Math.min(rows - 1, Math.ceil(cy + ry));
    for (let r = y0; r <= y1; r++)
      for (let c = x0; c <= x1; c++) {
        const dx = (c - cx) / rx,
          dy = (r - cy) / ry;
        if (dx * dx + dy * dy <= 1.0) grid[r][c] = val;
      }
  }

  const {
    headRx,
    headRy,
    headCy,
    earW,
    earH,
    bodyRx,
    bodyRy,
    legH,
    legW,
    pawR,
    tailW,
    tailH,
    eyeR,
  } = opts;

  const legCy = 35 + bodyRy + legH; // leg center y
  const pawCy = Math.min(52, legCy + legH + 1); // paw y, clamped

  // ── back to front ──────────────────────────────────────────────────────

  // tail
  fill(7, 28, tailW, tailH, 1);

  // body
  fill(20, 35, bodyRx, bodyRy, 1);

  // legs — 4 stubs (black so they read as separate)
  fill(11, legCy, legW, legH, 2);
  fill(17, legCy, legW, legH, 2);
  fill(24, legCy, legW, legH, 2);
  fill(30, legCy, legW, legH, 2);

  // paws (base color, wider than legs)
  fill(11, pawCy, pawR * 1.4, pawR, 1);
  fill(17, pawCy, pawR * 1.4, pawR, 1);
  fill(24, pawCy, pawR * 1.4, pawR, 1);
  fill(30, pawCy, pawR * 1.4, pawR, 1);

  // ears (base color)
  fill(16, headCy - headRy * 0.5, earW, earH, 1);
  fill(23, headCy - headRy * 0.5, earW * 0.9, earH * 0.9, 1);

  // head
  fill(21, headCy, headRx, headRy, 1);

  // eye (black)
  fill(16, headCy - headRy * 0.15, eyeR, eyeR * 1.1, 2);

  return grid;
}

// ── GRID MUTATION ──────────────────────────────────────────────────────────
// Produces a unique variation of any grid by randomly duplicating or removing
// rows in three anatomical zones: ears (top), body (middle), legs (bottom).
// The silhouette is always preserved — only proportions change.

function mutateGrid(src, rng) {
  let grid = src.map((r) => new Uint8Array(r));

  // Helper: duplicate a row N times at position idx
  function dupRow(idx, n) {
    const ref = grid[Math.min(idx, grid.length - 1)];
    for (let i = 0; i < n; i++) grid.splice(idx, 0, new Uint8Array(ref));
  }

  // Helper: remove N rows starting at idx (keep at least 1)
  function delRows(idx, n) {
    const safe = Math.min(n, grid.length - idx - 1);
    if (safe > 0) grid.splice(idx, safe);
  }

  const earRows = Math.round((rng() - 0.3) * 4); // -1..+2 ear rows
  const bodyRows = Math.round((rng() - 0.3) * 5); // -1..+3 body rows
  const legRows = Math.round((rng() - 0.3) * 4); // -1..+2 leg rows

  // Top zone — ears
  if (earRows > 0) dupRow(0, earRows);
  else if (earRows < 0) delRows(0, -earRows);

  // Middle zone — body (recalculate mid after ear change)
  const mid = Math.floor(grid.length * 0.45);
  if (bodyRows > 0) dupRow(mid, bodyRows);
  else if (bodyRows < 0) delRows(mid, -bodyRows);

  // Bottom zone — legs/paws
  const bot = grid.length - 2;
  if (legRows > 0) dupRow(bot, legRows);
  else if (legRows < 0) delRows(bot, -legRows);

  return grid;
}

// ── GRID HELPERS ───────────────────────────────────────────────────────────

function scaleGrid(src, tCols, tRows) {
  const sRows = src.length,
    sCols = src[0].length;

  if (sCols === tCols && sRows === tRows) {
    return src.map((row) => Uint8Array.from(row));
  }

  const isShrinking = sCols > tCols || sRows > tRows;

  const scaled = Array.from({ length: tRows }, (_, r) => {
    if (!isShrinking) {
      const sr = Math.floor((r / tRows) * sRows);
      return Uint8Array.from(
        { length: tCols },
        (_, c) => src[sr][Math.floor((c / tCols) * sCols)],
      );
    }

    const y0 = Math.floor((r * sRows) / tRows);
    const y1 = Math.min(
      sRows - 1,
      Math.max(y0, Math.floor(((r + 1) * sRows) / tRows) - 1),
    );

    return Uint8Array.from({ length: tCols }, (_, c) => {
      const x0 = Math.floor((c * sCols) / tCols);
      const x1 = Math.min(
        sCols - 1,
        Math.max(x0, Math.floor(((c + 1) * sCols) / tCols) - 1),
      );

      const counts = [0, 0, 0, 0, 0];
      for (let sy = y0; sy <= y1; sy++) {
        for (let sx = x0; sx <= x1; sx++) {
          counts[src[sy][sx]]++;
        }
      }

      // Preferir detalles: mocos oscuros / acentos sobre color base, y color base sobre vacío.
      const order = [2, 4, 3, 1, 0];
      let bestValue = 0;
      let bestCount = -1;
      for (const val of order) {
        if (counts[val] > bestCount) {
          bestCount = counts[val];
          bestValue = val;
        }
      }
      return bestValue;
    });
  });

  return scaled;
}

function getGridValue(grid, r, c) {
  if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return 0;
  return grid[r][c];
}

function refineHighResGrid(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const result = grid.map((row) => Uint8Array.from(row));

  const isBody = (v) => v === 1 || v === 3 || v === 4;
  const isSolid = (v) => v !== 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 0) continue;

      const n = {
        N: getGridValue(grid, r - 1, c),
        S: getGridValue(grid, r + 1, c),
        W: getGridValue(grid, r, c - 1),
        E: getGridValue(grid, r, c + 1),
        NW: getGridValue(grid, r - 1, c - 1),
        NE: getGridValue(grid, r - 1, c + 1),
        SW: getGridValue(grid, r + 1, c - 1),
        SE: getGridValue(grid, r + 1, c + 1),
      };

      const bodyCount =
        [n.N, n.S, n.W, n.E, n.NW, n.NE, n.SW, n.SE].filter(isBody).length;
      const solidCount =
        [n.N, n.S, n.W, n.E, n.NW, n.NE, n.SW, n.SE].filter(isSolid)
          .length;

      // Añadir relleno en esquinas cóncavas.
      if (
        isBody(n.N) && isBody(n.W) && !isBody(n.NW) ||
        isBody(n.N) && isBody(n.E) && !isBody(n.NE) ||
        isBody(n.S) && isBody(n.W) && !isBody(n.SW) ||
        isBody(n.S) && isBody(n.E) && !isBody(n.SE)
      ) {
        result[r][c] = 1;
        continue;
      }

      // Si hay muchos vecinos sólidos, rellenamos para suavizar la curva.
      if (bodyCount >= 3 && solidCount >= 4) {
        result[r][c] = 1;
        continue;
      }

      // Añadir detalles de patitas y dedos: cuando hay una columna de piernas negras
      // y una celda vacía debajo, agregamos un píxel para hacer la pata más compleja.
      if (
        n.S === 0 &&
        (n.W === 2 || n.E === 2) &&
        (n.N === 2 || n.NW === 2 || n.NE === 2)
      ) {
        result[r][c] = 2;
      }
    }
  }

  return result;
}

function flipGrid(grid) {
  return grid.map((row) => Uint8Array.from([...row].reverse()));
}

function rotate90Grid(grid) {
  const R = grid.length,
    C = grid[0].length;
  return Array.from({ length: C }, (_, newR) =>
    Array.from({ length: R }, (_, newC) => grid[R - 1 - newC][newR]),
  );
}

// ── SPRITE BOUNDS ──────────────────────────────────────────────────────────
// Find the tight bounding box of non-empty cells so we can fill the canvas
// with the actual dog content rather than the full sprite rectangle.

function spriteBounds(grid) {
  let minR = grid.length,
    maxR = 0,
    minC = grid[0].length,
    maxC = 0;
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[r].length; c++)
      if (grid[r][c]) {
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
  return { minR, maxR, minC, maxC, w: maxC - minC + 1, h: maxR - minR + 1 };
}

// ── GENERATION ─────────────────────────────────────────────────────────────

function generateCreatures(count, keepSeed = false) {
  if (!keepSeed) state.seed = Math.floor(Math.random() * 1e9);
  rng = mulberry32(state.seed);

  const fmt = getFormat();
  const cW = fmt.w;
  const cH = fmt.h;
  state.creatures = [];

  for (let i = 0; i < count; i++) {
    const targetFill = count === 1 ? 0.88 : 0.44;
    const sCols = state.pixelCols; // Resolución del slider

    let grid;
    let creatureColor;
    let speciesLabel = "creature";
    let dna = null;
    let genes = null;
    let intermediateCanvas;

    // ── 1. GENERACIÓN DE ESTRUCTURA (100% Pipeline Dinámico / Modular) ──

    dna = generateDNA(rng);
    genes = generateMorphologyGenes(rng);
    const tmpl = buildMorphedTemplates(dna, genes);

    if (genes.forceMutations) {
      dna.mutations = [...new Set([...genes.forceMutations, ...dna.mutations])];
    }

    creatureColor = PALETTE[dna.palette];
    speciesLabel =
      genes.mutationType !== "COMMON"
        ? `${genes.variant} ${dna.speciesTraits.label}`
        : dna.speciesTraits.label;

    const skeleton = buildSkeleton(dna, tmpl, genes);
    const rawCanvas = assembleBodyParts(dna, skeleton, tmpl, genes);
    addDetails(rawCanvas, dna, skeleton, tmpl);
    applyMutations(rawCanvas, dna, skeleton);

    // Escalamos el ensamble a la base más detallada disponible para luego sintetizar.
    const baseRes = Math.max(MAX_DETAIL_COLS, state.pixelCols);
    const sRows = Math.round((baseRes * ASSEMBLE_ROWS) / ASSEMBLE_COLS);
    intermediateCanvas = scaleGrid(rawCanvas, baseRes, sRows);

    if (dna.facing < 0) intermediateCanvas = flipGrid(intermediateCanvas);

    // ── 2. ESCALADO FINAL AL SLIDER ──
    const finalRows = Math.round(
      (sCols * intermediateCanvas.length) / intermediateCanvas[0].length,
    );
    grid = scaleGrid(intermediateCanvas, sCols, finalRows);
    grid = refineHighResGrid(grid);

    // ── 3. POSICIONAMIENTO Y CELLSIZE ──
    const bounds = spriteBounds(grid);

    const csW = (cW * targetFill) / bounds.w;
    const csH = (cH * targetFill) / bounds.h;
    const cellSize = Math.max(1, Math.min(csW, csH));

    const contentW = bounds.w * cellSize;
    const contentH = bounds.h * cellSize;

    let baseContentX, baseContentY;
    if (count === 1) {
      baseContentX = (cW - contentW) / 2;
      baseContentY = (cH - contentH) / 2;
    } else {
      baseContentX =
        i === 0 ? cW * 0.25 - contentW / 2 : cW * 0.75 - contentW / 2;
      baseContentY = (cH - contentH) / 2;
    }

    const startX = Math.floor(baseContentX) - bounds.minC * cellSize;
    const startY = Math.floor(baseContentY) - bounds.minR * cellSize;

    state.creatures.push({
      grid,
      cellSize,
      startX,
      startY,
      color: creatureColor,
      species: speciesLabel,
      dna,
      genes,
    });
  }

  const label =
    state.creatures.length > 0 ? state.creatures[0].species : "creature";
  document.getElementById("meta-dogs").textContent =
    `× ${count} ${label}${count > 1 ? "s" : ""}`;
  state.needsRedraw = true;
}

// ── PART RANDOMIZATION ────────────────────────────────────────────────────

function rebuildCreatureGrid(creature) {
  if (!creature.dna || !creature.genes) return;
  const { dna, genes } = creature;
  const sCols = state.pixelCols;
  const tmpl = buildMorphedTemplates(dna, genes);
  const skeleton = buildSkeleton(dna, tmpl, genes);

  // 1. Generamos el canvas base (50x34)
  const canvas = assembleBodyParts(dna, skeleton, tmpl, genes);
  addDetails(canvas, dna, skeleton, tmpl);
  applyMutations(canvas, dna, skeleton);

  // --- CAMBIO 3: UNIFICACIÓN DE RESOLUCIÓN ---
  // Antes de escalar al slider, pasamos por una resolución base de detalle máximo
  // para que la misma forma pueda sintetizarse con menos píxeles.
  const baseRes = Math.max(MAX_DETAIL_COLS, sCols);
  const interRows = Math.round((baseRes * ASSEMBLE_ROWS) / ASSEMBLE_COLS);
  let highResCanvas = scaleGrid(canvas, baseRes, interRows);

  // 2. Ahora escalamos al valor actual del slider
  const sRows = Math.round(
    (sCols * highResCanvas.length) / highResCanvas[0].length,
  );
  let grid = scaleGrid(highResCanvas, sCols, sRows);
  grid = refineHighResGrid(grid);
  // -------------------------------------------

  if (dna.facing < 0) grid = flipGrid(grid);
  creature.grid = grid;

  const fmt = getFormat();
  const bounds = spriteBounds(grid);
  const count = state.creatures.length;
  const fill = count === 1 ? 0.88 : 0.44;

  // Ajuste de cellSize basado en el tamaño visible real de la criatura.
  const csW = (fmt.w * fill) / bounds.w;
  const csH = (fmt.h * fill) / bounds.h;
  const cs = Math.max(1, Math.min(csW, csH));

  creature.cellSize = cs;
  const idx = state.creatures.indexOf(creature);

  const baseContentX =
    count === 1
      ? (fmt.w - bounds.w * cs) / 2
      : idx === 0
        ? fmt.w * 0.25 - (bounds.w * cs) / 2
        : fmt.w * 0.75 - (bounds.w * cs) / 2;

  creature.startX = Math.floor(baseContentX) - bounds.minC * cs;
  creature.startY = Math.floor((fmt.h - bounds.h * cs) / 2) - bounds.minR * cs;
}

function mutatePart(fn) {
  pushHistory();
  for (const c of state.creatures) {
    if (c.dna && c.genes) {
      fn(c.dna, c.genes);
      rebuildCreatureGrid(c);
    }
  }
  state.needsRedraw = true;
}

// ── WIRE UI ────────────────────────────────────────────────────────────────

function wireUI(p) {
  let dogCount = 1;

  // Botón Randomize
  document.getElementById("btn-dogs").addEventListener("click", () => {
    pushHistory();
    generateCreatures(dogCount);
    p.loop();
  });

  // Click en el texto de conteo para alternar entre 1 y 2 criaturas
  const metaDogs = document.getElementById("meta-dogs");
  metaDogs.style.cursor = "pointer";
  metaDogs.addEventListener("click", () => {
    pushHistory();
    dogCount = dogCount === 1 ? 2 : 1;
    generateCreatures(dogCount);
    p.loop();
  });

  const btnUndo = document.getElementById("btn-undo");
  if (btnUndo) {
    btnUndo.addEventListener("click", () => {
      undo();
    });
  }

  // Slider de resolución (Píxeles)
  const slider = document.getElementById("slider-pixel");
  const metaPixel = document.getElementById("meta-pixel");

  // Slider de Redondeo
  const sliderRound = document.getElementById("slider-round");
  sliderRound.addEventListener("pointerdown", pushHistory);
  sliderRound.addEventListener("input", () => {
    state.effects.roundness = parseInt(sliderRound.value, 10);
    state.needsRedraw = true;
    p.loop();
  });

  slider.addEventListener("pointerdown", pushHistory);
  slider.addEventListener("input", () => {
    state.pixelCols = parseInt(slider.value, 10);
    metaPixel.textContent = `${state.pixelCols} columnas`;

    // Si ya hay criaturas, las regeneramos usando la misma semilla (seed)
    // pero con la nueva resolución. Esto permite ver cómo la MISMA criatura
    // se vuelve más definida sin cambiar su forma aleatoria.
    if (state.creatures.length) {
      generateCreatures(state.creatures.length, true);
    } else {
      generateCreatures(dogCount);
    }

    state.needsRedraw = true;
    p.loop();
  });

  const R = () => Math.random();
  const Ri = (n) => Math.floor(R() * n);
  const Rp = (...arr) => arr[Ri(arr.length)];

  document.getElementById("btn-dither").addEventListener("click", (e) => {
    pushHistory();
    state.effects.dither = !state.effects.dither;

    // Cambiar visualmente el botón
    e.target.classList.toggle("on", state.effects.dither);
    e.target.textContent = state.effects.dither
      ? "[ dithered: on ]"
      : "[ dithered: off ]";

    state.needsRedraw = true;
    p.loop();
  });

  document.getElementById("bp-orejas").addEventListener("click", () => {
    mutatePart((dna, g) => {
      // Elegimos un template de oreja al azar
      dna.earType = Ri(EAR_TEMPLATES.length);
      // Le damos un tamaño aleatorio (desde muy pequeñas a gigantes)
      g.earSize = Rp(0.6, 0.8, 1.0, 1.3, 1.6, 2.0);
    });
    p.loop();
  });

  document.getElementById("bp-cola").addEventListener("click", () => {
    mutatePart((dna, g) => {
      dna.tailType = Ri(TAIL_TEMPLATES.length);
      g.tailLength = Rp(0.7, 1.0, 1.3, 1.8, 2.3, 3.0);
      g.segmentedTail = R() < 0.15;
    });
    p.loop();
  });
  document.getElementById("bp-ojos").addEventListener("click", () => {
    mutatePart((dna, g) => {
      dna.eyeType = Ri(EYE_TEMPLATES.length);
      g.multipleEyes = R() < 0.15;
      g.eyeSpacing = Rp(0.8, 1.0, 1.2, 1.5);
    });
    p.loop();
  });
  document.getElementById("bp-patas").addEventListener("click", () => {
    mutatePart((dna, g) => {
      dna.legType = Ri(LEG_TEMPLATES.length);
      g.legCount = Rp(0, 2, 4, 4, 4);
      // stick legs (template 5) get stretched aggressively by default
      g.legLength =
        LEG_TEMPLATES[dna.legType].style === "stick"
          ? Rp(1.5, 2.0, 2.5, 3.0, 3.5)
          : Rp(0.4, 0.6, 0.8, 1.0, 1.3, 1.6);
    });
    p.loop();
  });
  document.getElementById("bp-nariz").addEventListener("click", () => {
    mutatePart((dna, g) => {
      dna.snoutType = Ri(SNOUT_TEMPLATES.length);
      g.noseSize = Rp(0.6, 0.8, 1.0, 1.4, 1.8);
    });
    p.loop();
  });
  document.getElementById("bp-cuerpo").addEventListener("click", () => {
    mutatePart((dna, g) => {
      dna.bodyType = Ri(BODY_TEMPLATES.length);
      g.bodyScale = Rp(0.55, 0.75, 1.0, 1.2, 1.5);
    });
    p.loop();
  });
  document.getElementById("bp-voltear").addEventListener("click", () => {
    pushHistory();
    state.landscape = !state.landscape;
    applyLandscape(p);
    p.loop();
  });
  document.getElementById("bp-largo").addEventListener("click", () => {
    mutatePart((dna, g) => {
      const f = Rp(0.4, 0.6, 0.8, 1.0, 1.3, 1.7, 2.2);
      g.legLength = f;
      g.tailLength = f * (0.7 + R() * 0.6);
      g.bodyOffsetY = Math.round((R() - 0.5) * 8);
    });
    p.loop();
  });

  document.getElementById("bp-ancho").addEventListener("click", () => {
    mutatePart((dna, g) => {
      const f = Rp(0.5, 0.7, 0.9, 1.1, 1.4, 1.8, 2.3);
      g.headScale = f * (0.8 + R() * 0.4);
      g.bodyScale = f;
      g.earSize = f * (0.7 + R() * 0.6);
    });
    p.loop();
  });

  document.getElementById("btn-recolor").addEventListener("click", () => {
    pushHistory();
    for (const creature of state.creatures) {
      let c;
      do {
        c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      } while (c === creature.color && PALETTE.length > 1);
      creature.color = c;
    }
    state.needsRedraw = true;
    p.loop();
  });

  document.getElementById("bp-reflejar").addEventListener("click", () => {
    mutatePart((dna) => {
      // Invertimos el valor de facing (si es 1 pasa a -1, y viceversa)
      dna.facing *= -1;
    });
    p.loop();
  });

  document
    .getElementById("btn-a4")
    .addEventListener("click", () => {
      pushHistory();
      switchFormat(p, "A4");
    });
  document
    .getElementById("btn-a3")
    .addEventListener("click", () => {
      pushHistory();
      switchFormat(p, "A3");
    });
  document.getElementById("btn-png").addEventListener("click", exportPNG);
  document.getElementById("btn-pdf").addEventListener("click", exportPDF);

  // Undo shortcut
  document.addEventListener("keydown", handleUndoShortcut);
}

function switchFormat(p, fmt) {
  state.format = fmt;
  document.getElementById("btn-a4").classList.toggle("active", fmt === "A4");
  document.getElementById("btn-a3").classList.toggle("active", fmt === "A3");
  const f = getFormat();
  if (pg) pg.remove();
  pg = p.createGraphics(f.w, f.h);
  for (const c of state.creatures) rebuildCreatureGrid(c);
  if (!state.creatures.length) generateCreatures(1);
  state.needsRedraw = true;
  p.loop();
}

function handleUndoShortcut(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
    undo();
    e.preventDefault();
  }
}

function applyLandscape(p) {
  const f = getFormat();
  if (pg) pg.remove();
  pg = p.createGraphics(f.w, f.h);
  for (const c of state.creatures) rebuildCreatureGrid(c);
  state.needsRedraw = true;
}

function exportPNG() {
  if (!pg) return;
  const suffix = state.format.toLowerCase() + (state.landscape ? "-h" : "");
  const link = document.createElement("a");
  link.download = `doggo-prints-${suffix}.png`;
  link.href = pg.elt.toDataURL("image/png");
  link.click();
}

function exportPDF() {
  if (!pg || typeof jspdf === "undefined") return;
  const { jsPDF } = jspdf;
  const isA4 = state.format === "A4";
  const ori = state.landscape ? "landscape" : "portrait";
  const paper = isA4 ? "a4" : "a3";
  const doc = new jsPDF({ orientation: ori, unit: "mm", format: paper });
  const mmW = isA4
    ? state.landscape
      ? 297
      : 210
    : state.landscape
      ? 420
      : 297;
  const mmH = isA4
    ? state.landscape
      ? 210
      : 297
    : state.landscape
      ? 297
      : 420;
  doc.addImage(pg.elt.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, mmW, mmH);
  doc.save(`doggo-prints-${paper}${state.landscape ? "-h" : ""}.pdf`);
}
