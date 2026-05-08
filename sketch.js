/*
  sketch.js — Doggo Prints
  version: MVP 0.6 — flat color pixel art, guaranteed anatomy
*/

const FORMATS = {
  A4: { w: 2480, h: 3508 },
  A3: { w: 3508, h: 4961 },
};
const CANVAS_BG = '#FFFFFF';
const PALETTE   = ['#F5C842', '#F57DB0', '#7EC8E3'];
const BLACK     = '#1A1A1A';

// ── HAND-CRAFTED TEMPLATES ──────────────────────────────────────────────────
// 0=empty · 1=body color · 2=black
// All designed facing RIGHT; non-symmetric ones get flipped randomly.

const TEMPLATES = [

  // Side walking dog
  { symmetric: false, grid: [
    [0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
    [0,1,1,0,0,0,0,0,0,0,0,0,1,1,1,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,1,1,1,1,2,1,1,1,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,0,1,0,0,1,0,1,0,0,0,0,0,0],
    [0,0,1,0,1,0,0,1,0,1,0,0,0,0,0,0],
    [0,0,2,0,2,0,0,2,0,2,0,0,0,0,0,0],
  ]},

  // Front-facing sitting dog
  { symmetric: true, grid: [
    [0,1,1,0,0,0,0,0,1,1,0,0],
    [0,1,1,0,0,0,0,0,1,1,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,2,1,1,1,1,1,2,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,1,2,1,1,1,2,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,0,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,0,0,0,0,1,1,0,0],
    [0,0,1,1,0,0,0,0,1,1,0,0],
    [0,0,2,2,0,0,0,0,2,2,0,0],
  ]},

  // Side sitting dog
  { symmetric: false, grid: [
    [0,0,0,0,1,1,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,1,1,2,1,1,1,1,0,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,0,1,1,1,1,1,0,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,1,1,0,0,0,1,1,0,0,0,0,0],
    [0,0,1,1,0,0,0,1,1,0,0,0,0,0],
    [0,0,2,2,0,0,0,2,2,0,0,0,0,0],
  ]},

  // Minimal blob side dog
  { symmetric: false, grid: [
    [0,0,0,1,1,1,0,0,0,0,0,0],
    [0,0,1,1,1,1,1,0,0,0,0,0],
    [0,0,1,2,1,1,1,1,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,0,0,0],
    [1,1,1,1,1,1,1,1,1,0,0,0],
    [1,1,1,1,1,1,1,1,1,0,0,0],
    [0,1,1,1,1,1,1,1,0,0,0,0],
    [0,1,0,1,0,0,1,0,0,0,0,0],
    [0,2,0,2,0,0,2,0,0,0,0,0],
  ]},

  // Simple front standing dog
  { symmetric: true, grid: [
    [0,0,1,0,0,0,0,1,0,0],
    [0,1,1,1,0,0,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,0],
    [1,1,2,1,1,1,2,1,1,0],
    [1,1,1,1,1,1,1,1,1,0],
    [1,1,1,2,1,1,2,1,1,0],
    [0,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,0,0],
    [0,1,0,1,0,0,1,0,1,0],
    [0,1,0,1,0,0,1,0,1,0],
    [0,2,0,2,0,0,2,0,2,0],
  ]},

  // ── Cross-stitch / knitwear style (2 colors: 1=body · 2=black) ───────────
  // Flat silhouettes, square ear nubs, 4 stub legs, short tail — inspired
  // by repeating tile pixel art patterns.

  // Side walk — 4 evenly-spaced legs
  { symmetric: false, grid: [
    [0,0,0,0,0,0,0,0,1,0,1,0,0],
    [0,1,0,0,0,0,0,1,1,1,1,1,0],
    [0,1,0,0,0,0,1,1,2,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,0,1,0,1,0,1,0,0,0,0],
    [0,0,1,0,1,0,1,0,1,0,0,0,0],
  ]},

  // Side trot — legs staggered (walking motion)
  { symmetric: false, grid: [
    [0,1,0,0,0,0,0,0,1,0,1,0,0],
    [0,1,0,0,0,0,0,1,1,1,1,1,0],
    [0,0,0,0,0,0,1,1,2,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,1,0,0,1,0,0,1,0,0,0,0],
    [0,0,0,1,0,0,1,0,0,0,0,0,0],
  ]},

  // Compact side — small body, big head energy
  { symmetric: false, grid: [
    [0,0,0,0,0,0,1,0,1,0,0,0],
    [0,1,0,0,0,1,1,1,1,1,0,0],
    [0,1,0,0,1,1,2,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,1,1,1,1,0,0,0,0,0],
    [0,0,1,0,1,0,1,0,0,0,0,0],
    [0,0,1,0,1,0,1,0,0,0,0,0],
  ]},

  // Front sitting — two square ear nubs, symmetrical
  { symmetric: true, grid: [
    [0,0,1,1,0,0,0,0,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,1,2,1,1,1,1,2,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,2,1,1,2,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,0,0,0,0,1,1,0,0],
    [0,0,1,1,0,0,0,0,1,1,0,0],
    [0,0,2,2,0,0,0,0,2,2,0,0],
  ]},

  // ── Cute detailed templates (3 colors: 1=body · 2=black · 3=dark-body) ──

  // Cute side-standing dog
  { symmetric: false, grid: [
    [0,0,3,0,0,0,0,0,0,0,0,0,0,3,2,0],
    [0,0,1,3,0,0,0,0,0,0,0,0,1,1,3,0],
    [0,0,1,0,0,0,0,0,0,0,0,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,0],
    [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,1,3,0],
    [0,0,3,3,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,3,0,3,0,0,3,0,3,0,0,0,0,0],
    [0,0,0,1,0,1,0,0,1,0,1,0,0,0,0,0],
    [0,0,0,1,0,1,0,0,1,0,1,0,0,0,0,0],
    [0,0,0,2,0,2,0,0,2,0,2,0,0,0,0,0],
  ]},

  // Cute front-sitting dog
  { symmetric: true, grid: [
    [0,0,3,3,0,0,0,0,3,3,0,0],
    [0,3,1,3,0,0,0,0,3,1,3,0],
    [0,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,2,1,1,1,1,1,2,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,1,2,2,1,2,2,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,0,0],
    [0,3,3,1,1,1,1,1,3,3,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,0],
    [3,1,1,1,1,1,1,1,1,1,3,0],
    [3,1,1,1,1,1,1,1,1,1,3,0],
    [0,0,3,1,0,0,0,0,1,3,0,0],
    [0,0,1,1,0,0,0,0,1,1,0,0],
    [0,0,2,2,0,0,0,0,2,2,0,0],
  ]},

  // Cute side-sitting dog
  { symmetric: false, grid: [
    [0,0,0,0,0,3,2,0,0,0,0,0,0,0],
    [0,0,0,0,3,1,3,0,0,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,1,2,1,1,1,1,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,3,0,0,0],
    [0,0,0,0,0,1,1,1,2,2,0,0,0,0],
    [0,0,0,3,3,1,1,1,1,0,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,3,1,1,1,1,1,1,3,0,0,0,0],
    [0,0,0,3,1,0,0,3,1,0,0,0,0,0],
    [0,0,0,1,1,0,0,1,1,0,0,0,0,0],
    [0,0,0,2,2,0,0,2,2,0,0,0,0,0],
  ]},

  // Cute running dog
  { symmetric: false, grid: [
    [0,0,3,0,0,0,0,0,0,0,0,0,0,3,2,0],
    [0,3,1,0,0,0,0,0,0,0,0,0,1,1,3,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,0],
    [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
    [0,0,0,0,1,1,1,1,1,1,1,1,1,3,0,0],
    [0,0,3,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
    [1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0],
    [1,3,0,0,0,0,1,3,0,0,0,0,0,0,0,0],
    [2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0],
  ]},

  // ── Red accent templates (4 colors: 1=body · 2=black · 3=dark · 4=red) ──

  // Chunky dark dog with red collar — side view
  { symmetric: false, grid: [
    [0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0],
    [0,3,0,0,0,0,0,0,0,0,0,3,3,3,3,0],
    [0,3,3,0,0,0,0,0,0,0,3,3,2,3,3,0],
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0],
    [0,3,3,3,3,3,3,3,3,4,4,3,3,3,3,0],
    [0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0],
    [0,0,3,3,3,3,3,3,3,3,3,3,3,3,0,0],
    [0,0,3,3,0,3,3,0,0,3,3,0,3,3,0,0],
    [0,0,3,3,0,3,3,0,0,3,3,0,3,3,0,0],
    [0,0,2,2,0,2,2,0,0,2,2,0,2,2,0,0],
  ]},

  // Expressive dog with black muzzle and red bow — front sitting
  { symmetric: true, grid: [
    [0,0,1,1,0,0,0,1,1,0,0,0],
    [0,1,1,1,0,0,0,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,1,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,2,1,1,1,1,1,2,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,2,2,2,2,2,2,2,2,1,0],
    [0,0,2,2,2,2,2,2,2,0,0,0],
    [0,4,4,4,0,4,0,4,4,4,0,0],
    [0,0,1,1,1,1,1,1,1,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,0,0,0,1,1,0,0,0],
    [0,0,1,1,0,0,0,1,1,0,0,0],
    [0,0,2,2,0,0,0,2,2,0,0,0],
  ]},

];

const state = {
  format: 'A4',
  seed: Math.floor(Math.random() * 1e9),
  dogs: [],
  pixelCols: 20,
  needsRedraw: true,
  effects: { SCALLOPED: false },
  mode: 'generate', // 'generate' | 'compose'
};

// ── COMPOSE STATE ──────────────────────────────────────────────────────────
const HANDLE_PX = 8;
const compose = {
  dogs: [],
  selected: -1,
  activeColor: PALETTE[0],
  needsRedraw: true,
  dragging: null,   // { idx, pgStartX, pgStartY, dogStartX, dogStartY }
  resizing: null,   // { idx, anchorPgX, anchorPgY, anchorIsBottom }
};
let sidebarDrag = null; // { tmplIdx, ghost }

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

let pg, rng;

// ── SKETCH ─────────────────────────────────────────────────────────────────

new p5(function (p) {
  p.setup = function () {
    const wrapper = document.getElementById('canvas-wrapper');
    const dims = scaledDims();
    p.createCanvas(dims.w, dims.h).parent(wrapper);
    p.noLoop();
    const fmt = FORMATS[state.format];
    pg = p.createGraphics(fmt.w, fmt.h);
    wireUI(p);
    generateDogs(1);
  };

  p.draw = function () {
    if (state.mode === 'compose') {
      renderCompose(p);
    } else {
      if (!state.needsRedraw) return;
      state.needsRedraw = false;
      renderFrame(p);
    }
  };

  p.mousePressed = function () {
    if (state.mode !== 'compose') return;
    const fmt  = FORMATS[state.format];
    const dims = scaledDims();
    const sc   = fmt.w / dims.w;
    const pgX  = p.mouseX * sc;
    const pgY  = p.mouseY * sc;

    // Check corner handles of selected dog first
    if (compose.selected >= 0 && compose.selected < compose.dogs.length) {
      const lay  = composeDogLayout(compose.dogs[compose.selected]);
      const sSc  = dims.w / fmt.w;
      const corners = [
        { px: lay.x,         py: lay.y,         ancX: lay.x + lay.w, ancY: lay.y + lay.h },
        { px: lay.x + lay.w, py: lay.y,         ancX: lay.x,         ancY: lay.y + lay.h },
        { px: lay.x,         py: lay.y + lay.h, ancX: lay.x + lay.w, ancY: lay.y         },
        { px: lay.x + lay.w, py: lay.y + lay.h, ancX: lay.x,         ancY: lay.y         },
      ];
      for (const corner of corners) {
        if (Math.abs(p.mouseX - corner.px * sSc) <= HANDLE_PX + 2 &&
            Math.abs(p.mouseY - corner.py * sSc) <= HANDLE_PX + 2) {
          compose.resizing = {
            idx: compose.selected,
            anchorPgX: corner.ancX,
            anchorPgY: corner.ancY,
            anchorIsBottom: corner.ancY > lay.y + lay.h * 0.5,
          };
          return false;
        }
      }
    }

    // Hit test dogs topmost first
    for (let i = compose.dogs.length - 1; i >= 0; i--) {
      const lay = composeDogLayout(compose.dogs[i]);
      if (pgX >= lay.x && pgX <= lay.x + lay.w &&
          pgY >= lay.y && pgY <= lay.y + lay.h) {
        compose.selected = i;
        compose.dragging = {
          idx: i, pgStartX: pgX, pgStartY: pgY,
          dogStartX: compose.dogs[i].x,
          dogStartY: compose.dogs[i].y,
        };
        return false;
      }
    }
    compose.selected = -1;
  };

  p.mouseDragged = function () {
    if (state.mode !== 'compose') return;
    const fmt  = FORMATS[state.format];
    const dims = scaledDims();
    const sc   = fmt.w / dims.w;
    const pgX  = p.mouseX * sc;
    const pgY  = p.mouseY * sc;

    if (compose.resizing) {
      const { idx, anchorPgX, anchorPgY, anchorIsBottom } = compose.resizing;
      const dog = compose.dogs[idx];
      let   grid = TEMPLATES[dog.tmplIdx].grid;
      if (dog.flipped) grid = flipGrid(grid);
      const b    = spriteBounds(grid);
      const minW = b.w * 4;
      const cs   = Math.max(4, Math.floor(Math.max(minW, Math.abs(pgX - anchorPgX)) / b.w));
      dog.w  = b.w * cs;
      dog.x  = Math.min(pgX, anchorPgX);
      dog.y  = anchorIsBottom ? anchorPgY - b.h * cs : anchorPgY;
      compose.needsRedraw = true;
      return false;
    }

    if (compose.dragging) {
      const { idx, pgStartX, pgStartY, dogStartX, dogStartY } = compose.dragging;
      compose.dogs[idx].x = dogStartX + (pgX - pgStartX);
      compose.dogs[idx].y = dogStartY + (pgY - pgStartY);
      compose.needsRedraw = true;
      return false;
    }
  };

  p.mouseReleased = function () {
    compose.dragging = null;
    compose.resizing = null;
  };
});

function scaledDims() {
  const fmt    = FORMATS[state.format];
  const wrapper = document.getElementById('canvas-wrapper');
  const availW  = wrapper.clientWidth  || window.innerWidth  - 260;
  const availH  = wrapper.clientHeight || window.innerHeight;
  const scale   = Math.min(availW / fmt.w, availH / fmt.h) * 0.96;
  return { w: Math.floor(fmt.w * scale), h: Math.floor(fmt.h * scale) };
}

function renderFrame(p) {
  const fmt = FORMATS[state.format];
  if (!pg || pg.width !== fmt.w || pg.height !== fmt.h) {
    if (pg) pg.remove();
    pg = p.createGraphics(fmt.w, fmt.h);
  }
  pg.background(CANVAS_BG);
  for (const dog of state.dogs) drawPixelDog(pg, dog);
  const dims = scaledDims();
  p.resizeCanvas(dims.w, dims.h);
  p.smooth();
  p.image(pg, 0, 0, dims.w, dims.h);
}

// ── COLOR HELPERS ──────────────────────────────────────────────────────────

function darkenHex(hex, f) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgb(${(r*f)|0},${(g*f)|0},${(b*f)|0})`;
}

// ── CELL DRAW ──────────────────────────────────────────────────────────────
// val 1 = body color · val 2 = black · val 3 = dark body (~55%) · val 4 = red accent

const RED_ACCENT = '#CC2020';

function drawCell(g, px, py, cs, val, color) {
  g.noStroke();
  if      (val === 1) g.fill(color);
  else if (val === 3) g.fill(darkenHex(color, 0.55));
  else if (val === 4) g.fill(RED_ACCENT);
  else                g.fill(BLACK);
  if (state.effects.SCALLOPED) {
    g.ellipse(px + cs * 0.5, py + cs * 0.5, cs * 0.86, cs * 0.86);
  } else {
    g.rect(px, py, cs, cs);
  }
}

function drawPixelDog(g, dog) {
  const { grid, cellSize, startX, startY, color } = dog;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const val = grid[r][c];
      if (val) drawCell(g, startX + c * cellSize, startY + r * cellSize, cellSize, val, color);
    }
  }
}

// ── DOG RASTERIZER ─────────────────────────────────────────────────────────
// All anatomy coords defined in base 40×54 space, scaled to any spriteCols.
// Guaranteed parts: tail, body, legs, paws, head, ears, eyes.
// val 1 = base color · val 2 = black

function rasterizeDog(facing, opts, spriteCols, spriteRows) {
  const cols = spriteCols;
  const rows = spriteRows;
  const grid = Array.from({ length: rows }, () => new Uint8Array(cols));
  const sx   = cols / 40;
  const sy   = rows / 54;

  function fx(cx) { return facing === 1 ? cx * sx : cols - 1 - cx * sx; }

  function fill(rawCx, rawCy, rawRx, rawRy, val) {
    const cx = fx(rawCx), cy = rawCy * sy;
    const rx = rawRx * sx, ry = rawRy * sy;
    const x0 = Math.max(0, Math.floor(cx - rx));
    const x1 = Math.min(cols - 1, Math.ceil(cx + rx));
    const y0 = Math.max(0, Math.floor(cy - ry));
    const y1 = Math.min(rows - 1, Math.ceil(cy + ry));
    for (let r = y0; r <= y1; r++)
      for (let c = x0; c <= x1; c++) {
        const dx = (c - cx) / rx, dy = (r - cy) / ry;
        if (dx * dx + dy * dy <= 1.0) grid[r][c] = val;
      }
  }

  const { headRx, headRy, headCy, earW, earH,
          bodyRx, bodyRy, legH, legW, pawR,
          tailW,  tailH,  eyeR } = opts;

  const legCy  = 35 + bodyRy + legH;           // leg center y
  const pawCy  = Math.min(52, legCy + legH + 1); // paw y, clamped

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
  fill(16, headCy - headRy * 0.5, earW,       earH,       1);
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
  let grid = src.map(r => new Uint8Array(r));

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

  const earRows  = Math.round((rng() - 0.3) * 4); // -1..+2 ear rows
  const bodyRows = Math.round((rng() - 0.3) * 5); // -1..+3 body rows
  const legRows  = Math.round((rng() - 0.3) * 4); // -1..+2 leg rows

  // Top zone — ears
  if (earRows > 0)  dupRow(0, earRows);
  else if (earRows < 0) delRows(0, -earRows);

  // Middle zone — body (recalculate mid after ear change)
  const mid = Math.floor(grid.length * 0.45);
  if (bodyRows > 0)  dupRow(mid, bodyRows);
  else if (bodyRows < 0) delRows(mid, -bodyRows);

  // Bottom zone — legs/paws
  const bot = grid.length - 2;
  if (legRows > 0)  dupRow(bot, legRows);
  else if (legRows < 0) delRows(bot, -legRows);

  return grid;
}

// ── GRID HELPERS ───────────────────────────────────────────────────────────

function scaleGrid(src, tCols, tRows) {
  const sRows = src.length, sCols = src[0].length;
  return Array.from({ length: tRows }, (_, r) => {
    const sr = Math.floor(r / tRows * sRows);
    return Uint8Array.from({ length: tCols }, (_, c) =>
      src[sr][Math.floor(c / tCols * sCols)]);
  });
}

function flipGrid(grid) {
  return grid.map(row => Uint8Array.from([...row].reverse()));
}

// ── SPRITE BOUNDS ──────────────────────────────────────────────────────────
// Find the tight bounding box of non-empty cells so we can fill the canvas
// with the actual dog content rather than the full sprite rectangle.

function spriteBounds(grid) {
  let minR = grid.length, maxR = 0, minC = grid[0].length, maxC = 0;
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[r].length; c++)
      if (grid[r][c]) {
        if (r < minR) minR = r; if (r > maxR) maxR = r;
        if (c < minC) minC = c; if (c > maxC) maxC = c;
      }
  return { minR, maxR, minC, maxC,
           w: maxC - minC + 1, h: maxR - minR + 1 };
}

// ── COMPOSE HELPERS ────────────────────────────────────────────────────────

function composeDogLayout(dog) {
  let grid = TEMPLATES[dog.tmplIdx].grid;
  if (dog.flipped) grid = flipGrid(grid);
  const b  = spriteBounds(grid);
  const cs = Math.max(1, Math.floor(dog.w / b.w));
  return { grid, b, cs, x: dog.x, y: dog.y, w: b.w * cs, h: b.h * cs };
}

function drawComposeDog(g, dog) {
  const { grid, b, cs, x, y } = composeDogLayout(dog);
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[r].length; c++) {
      const val = grid[r][c];
      if (val) drawCell(g, x + (c - b.minC) * cs, y + (r - b.minR) * cs, cs, val, dog.color);
    }
}

function thumbnailDataURL(tmplIdx, color) {
  const cv  = document.createElement('canvas');
  cv.width = cv.height = 60;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 60, 60);
  const grid = TEMPLATES[tmplIdx].grid;
  const b    = spriteBounds(grid);
  const cs   = Math.max(1, Math.min(Math.floor(60 / b.w), Math.floor(60 / b.h)));
  const ox   = Math.floor((60 - b.w * cs) / 2);
  const oy   = Math.floor((60 - b.h * cs) / 2);
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[r].length; c++) {
      const val = grid[r][c];
      if (!val) continue;
      ctx.fillStyle = val === 1 ? color
                    : val === 3 ? darkenHex(color, 0.55)
                    : val === 4 ? RED_ACCENT
                    : BLACK;
      ctx.fillRect(ox + (c - b.minC) * cs, oy + (r - b.minR) * cs, cs, cs);
    }
  return cv.toDataURL();
}

function renderCompose(p) {
  const fmt = FORMATS[state.format];
  if (!pg || pg.width !== fmt.w || pg.height !== fmt.h) {
    if (pg) pg.remove();
    pg = p.createGraphics(fmt.w, fmt.h);
  }
  if (compose.needsRedraw) {
    compose.needsRedraw = false;
    pg.background(CANVAS_BG);
    for (const dog of compose.dogs) drawComposeDog(pg, dog);
  }
  const dims = scaledDims();
  p.resizeCanvas(dims.w, dims.h);
  p.image(pg, 0, 0, dims.w, dims.h);

  // Selection overlay (drawn on screen canvas, not pg — not exported)
  if (compose.selected >= 0 && compose.selected < compose.dogs.length) {
    const lay = composeDogLayout(compose.dogs[compose.selected]);
    const sc  = dims.w / fmt.w;
    const bx  = lay.x * sc, by = lay.y * sc;
    const bw  = lay.w * sc, bh = lay.h * sc;
    p.push();
    p.noFill(); p.stroke(70, 110, 240); p.strokeWeight(1.5);
    p.rect(bx, by, bw, bh);
    p.fill(255); p.stroke(70, 110, 240); p.strokeWeight(1.5);
    const hs = HANDLE_PX;
    for (const [hx, hy] of [[bx,by],[bx+bw,by],[bx,by+bh],[bx+bw,by+bh]])
      p.rect(hx - hs/2, hy - hs/2, hs, hs);
    p.pop();
  }
}

// ── SIDEBAR DRAG ───────────────────────────────────────────────────────────

function startSidebarDrag(tmplIdx, e) {
  const ghost = document.createElement('img');
  ghost.id    = 'drag-ghost';
  ghost.src   = thumbnailDataURL(tmplIdx, compose.activeColor);
  ghost.style.width = ghost.style.height = '60px';
  document.body.appendChild(ghost);
  moveDragGhost(e.clientX, e.clientY);
  sidebarDrag = { tmplIdx, ghost };
}

function moveDragGhost(cx, cy) {
  if (!sidebarDrag) return;
  sidebarDrag.ghost.style.left = `${cx - 30}px`;
  sidebarDrag.ghost.style.top  = `${cy - 30}px`;
}

function endSidebarDrag(e) {
  if (!sidebarDrag) return;
  const { tmplIdx, ghost } = sidebarDrag;
  document.body.removeChild(ghost);
  sidebarDrag = null;
  const canvasEl = document.querySelector('#canvas-wrapper canvas');
  if (!canvasEl) return;
  const rect = canvasEl.getBoundingClientRect();
  if (e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top  && e.clientY <= rect.bottom) {
    const fmt  = FORMATS[state.format];
    const dims = scaledDims();
    const pgX  = (e.clientX - rect.left) * fmt.w / dims.w;
    const pgY  = (e.clientY - rect.top)  * fmt.h / dims.h;
    placeDog(tmplIdx, pgX, pgY);
  }
}

function placeDog(tmplIdx, pgX, pgY) {
  const grid = TEMPLATES[tmplIdx].grid;
  const b    = spriteBounds(grid);
  const fmt  = FORMATS[state.format];
  const cs   = Math.max(4, Math.floor(fmt.w * 0.30 / b.w));
  const w    = b.w * cs;
  const h    = b.h * cs;
  compose.dogs.push({
    tmplIdx, color: compose.activeColor, flipped: false,
    x: pgX - w / 2, y: pgY - h / 2, w,
  });
  compose.selected  = compose.dogs.length - 1;
  compose.needsRedraw = true;
}

// ── GENERATION ─────────────────────────────────────────────────────────────

function generateDogs(count, keepSeed = false) {
  if (!keepSeed) state.seed = Math.floor(Math.random() * 1e9);
  rng = mulberry32(state.seed);

  const fmt  = FORMATS[state.format];
  const cW   = fmt.w;
  const cH   = fmt.h;
  state.dogs = [];

  for (let i = 0; i < count; i++) {
    const targetFill = count === 1 ? 0.88 : 0.44;
    const sCols      = state.pixelCols;
    const colorIdx   = Math.floor(rng() * PALETTE.length);

    let grid;

    if (rng() < 0.65) {
      // ── Template style ─────────────────────────────────────────────────
      const tmpl    = TEMPLATES[Math.floor(rng() * TEMPLATES.length)];
      const srcCols = tmpl.grid[0].length;
      const srcRows = tmpl.grid.length;
      const tRows   = Math.round(sCols * srcRows / srcCols);
      grid = scaleGrid(tmpl.grid, sCols, tRows);
      if (!tmpl.symmetric && rng() > 0.5) grid = flipGrid(grid);
      grid = mutateGrid(grid, rng); // unique proportions every time

    } else {
      // ── Procedural ellipse style ────────────────────────────────────────
      const sRows  = Math.round(sCols * 54 / 40);
      const facing = rng() > 0.5 ? 1 : -1;
      const style  = rng();
      const opts   = {
        headRx: 5  + rng() * 9,
        headRy: 4  + rng() * 8,
        headCy: 10 + rng() * 8,
        earW:   2  + rng() * 3,
        earH:   3  + rng() * 7,
        bodyRx: 9  + rng() * 7,
        bodyRy: 6  + style  * 7,
        legH:   2  + rng() * 5,
        legW:   1.5 + rng() * 2,
        pawR:   1.5 + rng() * 2,
        tailW:  1.5 + rng() * 2.5,
        tailH:  4  + rng() * 7,
        eyeR:   1  + rng() * 1.5,
      };
      grid = rasterizeDog(facing, opts, sCols, sRows);
    }
    const bounds   = spriteBounds(grid);

    // Cell size driven by the actual dog content, not the full sprite rectangle
    const csW      = Math.floor(cW * targetFill / bounds.w);
    const csH      = Math.floor(cH * targetFill / bounds.h);
    const cellSize = Math.max(1, Math.min(csW, csH));

    const contentW = bounds.w * cellSize;
    const contentH = bounds.h * cellSize;

    // Center content; offset so sprite origin aligns correctly
    let baseContentX, baseContentY;
    if (count === 1) {
      baseContentX = (cW - contentW) / 2 + (rng() - 0.5) * cW * 0.04;
      baseContentY = (cH - contentH) / 2 + (rng() - 0.5) * cH * 0.04;
    } else {
      baseContentX = i === 0 ? cW * 0.04 : cW * 0.54;
      baseContentY = (cH - contentH) / 2 + (rng() - 0.5) * cH * 0.03;
    }

    const startX = Math.floor(baseContentX) - bounds.minC * cellSize;
    const startY = Math.floor(baseContentY) - bounds.minR * cellSize;

    state.dogs.push({
      grid, cellSize, startX, startY,
      color: PALETTE[colorIdx],
    });
  }

  document.getElementById('meta-dogs').textContent =
    `× ${count} dog${count > 1 ? 's' : ''}`;
  state.needsRedraw = true;
}

// ── COMPOSE UI BUILDERS ────────────────────────────────────────────────────

function buildColorSwatches(p) {
  const container = document.getElementById('color-swatches');
  container.innerHTML = '';
  PALETTE.forEach(color => {
    const el = document.createElement('div');
    el.className = 'color-swatch' + (color === compose.activeColor ? ' active' : '');
    el.style.background = color;
    el.addEventListener('click', () => {
      compose.activeColor = color;
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      el.classList.add('active');
      buildTemplateGrid();
    });
    container.appendChild(el);
  });
}

function buildTemplateGrid() {
  const grid = document.getElementById('template-grid');
  grid.innerHTML = '';
  TEMPLATES.forEach((_, idx) => {
    const img = document.createElement('img');
    img.className = 'tmpl-thumb';
    img.src       = thumbnailDataURL(idx, compose.activeColor);
    img.draggable = false;
    img.title     = `Template ${idx + 1}`;
    img.addEventListener('mousedown', e => {
      e.preventDefault();
      if (state.mode === 'compose') startSidebarDrag(idx, e);
    });
    grid.appendChild(img);
  });
}

function switchMode(p, mode) {
  state.mode = mode;
  document.getElementById('btn-mode-gen').classList.toggle('active', mode === 'generate');
  document.getElementById('btn-mode-comp').classList.toggle('active', mode === 'compose');
  document.getElementById('panel-generate').style.display = mode === 'generate' ? '' : 'none';
  document.getElementById('panel-compose').style.display  = mode === 'compose'  ? '' : 'none';
  if (mode === 'compose') {
    compose.needsRedraw = true;
  } else {
    state.needsRedraw = true;
  }
  p.loop();
}

// ── WIRE UI ────────────────────────────────────────────────────────────────

function wireUI(p) {
  let dogCount = 1;

  document.getElementById('btn-dogs').addEventListener('click', () => {
    generateDogs(dogCount);
    p.loop();
  });

  const metaDogs = document.getElementById('meta-dogs');
  metaDogs.style.cursor = 'pointer';
  metaDogs.addEventListener('click', () => {
    dogCount = dogCount === 1 ? 2 : 1;
    generateDogs(dogCount);
    p.loop();
  });

  document.getElementById('eff-scallop').addEventListener('click', function () {
    state.effects.SCALLOPED = !state.effects.SCALLOPED;
    this.classList.toggle('on', state.effects.SCALLOPED);
    state.needsRedraw = true;
    p.loop();
  });

  const slider    = document.getElementById('slider-pixel');
  const metaPixel = document.getElementById('meta-pixel');
  slider.addEventListener('input', () => {
    state.pixelCols = parseInt(slider.value, 10);
    metaPixel.textContent = `${state.pixelCols} columnas`;
    generateDogs(dogCount, true);
    p.loop();
  });

  document.getElementById('btn-a4').addEventListener('click', () => switchFormat(p, 'A4'));
  document.getElementById('btn-a3').addEventListener('click', () => switchFormat(p, 'A3'));
  document.getElementById('btn-png').addEventListener('click', exportPNG);
  document.getElementById('btn-pdf').addEventListener('click', exportPDF);

  // ── Compose mode ──────────────────────────────────────────────────────────
  document.getElementById('btn-mode-gen').addEventListener('click',  () => switchMode(p, 'generate'));
  document.getElementById('btn-mode-comp').addEventListener('click', () => switchMode(p, 'compose'));

  buildColorSwatches(p);
  buildTemplateGrid();

  document.getElementById('btn-flip-compose').addEventListener('click', () => {
    if (compose.selected >= 0) {
      const dog = compose.dogs[compose.selected];
      dog.flipped = !dog.flipped;
      compose.needsRedraw = true;
    }
  });

  document.getElementById('btn-delete-compose').addEventListener('click', () => {
    if (compose.selected >= 0) {
      compose.dogs.splice(compose.selected, 1);
      compose.selected = Math.min(compose.selected, compose.dogs.length - 1);
      compose.needsRedraw = true;
    }
  });

  document.getElementById('btn-clear-compose').addEventListener('click', () => {
    compose.dogs    = [];
    compose.selected = -1;
    compose.needsRedraw = true;
  });

  // Drag ghost tracking & drop
  document.addEventListener('mousemove', e => moveDragGhost(e.clientX, e.clientY));
  document.addEventListener('mouseup',   e => endSidebarDrag(e));

  // Delete / Backspace removes selected dog in compose mode
  document.addEventListener('keydown', e => {
    if (state.mode === 'compose' && (e.key === 'Delete' || e.key === 'Backspace')) {
      if (compose.selected >= 0) {
        compose.dogs.splice(compose.selected, 1);
        compose.selected = Math.min(compose.selected, compose.dogs.length - 1);
        compose.needsRedraw = true;
      }
    }
  });
}

function switchFormat(p, fmt) {
  state.format = fmt;
  document.getElementById('btn-a4').classList.toggle('active', fmt === 'A4');
  document.getElementById('btn-a3').classList.toggle('active', fmt === 'A3');
  const f = FORMATS[fmt];
  if (pg) pg.remove();
  pg = p.createGraphics(f.w, f.h);
  generateDogs(state.dogs.length || 1, true);
  state.needsRedraw = true;
  p.loop();
}

function exportPNG() {
  if (!pg) return;
  const link = document.createElement('a');
  link.download = `doggo-prints-${state.format.toLowerCase()}.png`;
  link.href = pg.elt.toDataURL('image/png');
  link.click();
}

function exportPDF() {
  if (!pg || typeof jspdf === 'undefined') return;
  const { jsPDF } = jspdf;
  const isA4 = state.format === 'A4';
  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: isA4 ? 'a4' : 'a3' });
  doc.addImage(pg.elt.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0,
    isA4 ? 210 : 297, isA4 ? 297 : 420);
  doc.save(`doggo-prints-${state.format.toLowerCase()}.pdf`);
}
