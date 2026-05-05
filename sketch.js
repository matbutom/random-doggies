/*
  sketch.js — Doggo Prints: grid layout, modular dogs, white+stroke+texture
  version: MVP 0.2
*/

// ── Constants ─────────────────────────────────────────────────────────────────

const FORMATS = {
  A4: { w: 2480, h: 3508 },
  A3: { w: 3508, h: 4961 },
};

const BG_PALETTE = [
  { name: 'AMARILLO', hex: '#F5E642' },
  { name: 'ROSADO',   hex: '#FF6EB4' },
  { name: 'CELESTE',  hex: '#4DC8F0' },
];

const TEXTURES = [
  { id: 'HATCHING_45', label: 'hatching 45°' },
  { id: 'CROSSHATCH',  label: 'crosshatch' },
  { id: 'DOTS',        label: 'dots' },
  { id: 'BITMAP',      label: 'bitmap noise' },
  { id: 'WORDS',       label: 'words (woof)' },
  { id: 'NONE',        label: 'none (hollow)' },
];

const FILLER_TYPES = ['DIAMONDS', 'CIRCLES', 'BOLD_TEXT', 'ZIGZAG', 'EYE', 'STARBURST'];

// ── State ─────────────────────────────────────────────────────────────────────

const state = {
  format:   'A4',
  bgColor:  '#F5E642',
  bgName:   'AMARILLO',
  texture:  'HATCHING_45',
  texLabel: 'hatching 45°',
  dogs:     [],
  layout:   null,
  needsRedraw: true,
};

let pg;
let p5instance;

// ── p5 bootstrap ──────────────────────────────────────────────────────────────

new p5(function (p) {
  p5instance = p;

  p.setup = function () {
    const dims = scaledDims();
    const cnv  = p.createCanvas(dims.w, dims.h);
    cnv.parent('canvas-wrapper');

    const fmt = FORMATS[state.format];
    pg = p.createGraphics(fmt.w, fmt.h);

    randomizeBackground();
    state.texture  = 'HATCHING_45';
    state.texLabel = 'hatching 45°';
    updateMeta('meta-texture', state.texLabel);
    randomizeDogs();

    wireUI(p);
    p.noLoop();
  };

  p.draw = function () {
    if (!state.needsRedraw) return;
    state.needsRedraw = false;
    renderFull(p);
  };
});

// ── Dimension helpers ─────────────────────────────────────────────────────────

function scaledDims() {
  const fmt  = FORMATS[state.format];
  const maxW = window.innerWidth  - 262 - 48;
  const maxH = window.innerHeight - 48;
  const scale = Math.min(maxW / fmt.w, maxH / fmt.h);
  return { w: Math.floor(fmt.w * scale), h: Math.floor(fmt.h * scale) };
}

function cmToPx(cm, canvasW) {
  // 1 cm = 118 px at 300 dpi on A4 width (2480 px)
  return Math.round(canvasW * (cm * 118 / 2480));
}

// ── Grid layout ───────────────────────────────────────────────────────────────

function computeLayout(dogCount, canvasW, canvasH) {
  const margin   = cmToPx(1.0, canvasW);
  const innerPad = cmToPx(0.4, canvasW);

  let cols, rows;
  if (dogCount <= 4) { cols = 2; rows = 2; }
  else               { cols = 2; rows = 3; }

  const usableW = canvasW - margin * 2;
  const usableH = canvasH - margin * 2;
  const cellW   = usableW / cols;
  const cellH   = usableH / rows;

  const totalCells  = cols * rows;
  const fillerCount = totalCells - dogCount;

  const assignments = [
    ...Array(dogCount).fill('dog'),
    ...Array(fillerCount).fill('filler'),
  ];
  fisherYatesShuffle(assignments);

  // Each filler gets a stable random type
  const fillerRng = mulberry32(Math.floor(Math.random() * 99999));
  const cells = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const idx = row * cols + col;
      const gx  = margin + col * cellW;
      const gy  = margin + row * cellH;
      cells.push({
        gx, gy, cellW, cellH,
        x:  gx + innerPad,
        y:  gy + innerPad,
        w:  cellW - innerPad * 2,
        h:  cellH - innerPad * 2,
        cx: gx + cellW / 2,
        cy: gy + cellH / 2,
        type:       assignments[idx],
        fillerType: FILLER_TYPES[Math.floor(fillerRng() * FILLER_TYPES.length)],
      });
    }
  }
  return { cells, cols, rows, margin, cellW, cellH };
}

function fisherYatesShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ── Render pipeline ───────────────────────────────────────────────────────────

function renderFull(p) {
  const fmt = FORMATS[state.format];
  pg.background(state.bgColor);

  const layout = state.layout;
  if (!layout) return;

  let dogIdx = 0;
  for (const cell of layout.cells) {
    if (cell.type === 'dog') {
      drawDogInCell(pg, cell, state.dogs[dogIdx], state.texture);
      dogIdx++;
    } else {
      drawFillerInCell(pg, cell, state.texture);
    }
  }

  const dims = scaledDims();
  p.resizeCanvas(dims.w, dims.h);
  p.image(pg, 0, 0, dims.w, dims.h);
}

// ── Dog generation ────────────────────────────────────────────────────────────

function randomizeDogs() {
  const count = Math.floor(Math.random() * 5) + 2; // 2–6
  const fmt   = FORMATS[state.format];
  state.layout = computeLayout(count, fmt.w, fmt.h);

  const poses = ['side', 'front', 'sitting'];
  state.dogs  = [];
  for (let i = 0; i < count; i++) {
    state.dogs.push({
      pose:       poses[Math.floor(Math.random() * poses.length)],
      facing:     Math.random() > 0.5 ? 1 : -1,
      rotation:   (Math.random() - 0.5) * 14,
      earType:    Math.random() > 0.5 ? 'floppy' : 'pointy',
      tailType:   Math.random() > 0.5 ? 'curl' : 'straight',
      hasCollar:  Math.random() < 0.35,
      hasSpots:   Math.random() < 0.35,
      hasTongue:  Math.random() < 0.38,
      spotSeed:   Math.random() * 99999 | 0,
      bodyAspect: 0.85 + Math.random() * 0.4,
      legLen:     0.75 + Math.random() * 0.45,
      headSize:   0.9  + Math.random() * 0.28,
    });
  }

  updateMeta('meta-dogs', `× ${count} dog${count !== 1 ? 's' : ''}`);
  state.needsRedraw = true;
  if (p5instance) p5instance.redraw();
}

// ── Draw dog in cell ──────────────────────────────────────────────────────────

function drawDogInCell(g, cell, dog, texture) {
  const { cx, cy, w, h } = cell;
  const sw = Math.max(4, Math.min(w, h) * 0.024);
  g.push();
  g.strokeWeight(sw);
  g.stroke('#1A1A1A');
  g.translate(cx, cy);
  g.rotate(g.radians(dog.rotation));

  const uw = w * 0.88;
  const uh = h * 0.88;

  if      (dog.pose === 'side')    drawDogSide(g, uw, uh, dog, texture, sw);
  else if (dog.pose === 'front')   drawDogFront(g, uw, uh, dog, texture, sw);
  else if (dog.pose === 'sitting') drawDogSitting(g, uw, uh, dog, texture, sw);

  g.pop();
}

// ── Pose: SIDE ────────────────────────────────────────────────────────────────

function drawDogSide(g, uw, uh, dog, texture, sw) {
  const f   = dog.facing;
  const bw  = uw * 0.64 * dog.bodyAspect;
  const bh  = uh * 0.30;
  const by  = uh * 0.04;

  const hr  = bh * 0.70 * dog.headSize;
  const hx  = f * (bw * 0.38);
  const hy  = by - bh * 0.44 - hr * 0.55;

  const legH  = uh * 0.28 * dog.legLen;
  const legW  = sw * 2.8;
  const legY0 = by + bh * 0.46;

  // tail (drawn first — behind body)
  drawTailShape(g, -f * bw * 0.44, by - bh * 0.05, f, bh, dog.tailType, sw);

  // back legs
  drawLeg(g, -f * bw * 0.20, legY0, legW, legH, sw);
  drawLeg(g, -f * bw * 0.34, legY0, legW, legH, sw);

  // body
  drawFilledEllipse(g, 0, by, bw, bh, texture, sw);

  // neck
  const nw = hr * 0.72, nh = bh * 0.32;
  drawFilledRect(g, hx - f * nw * 0.35 - nw / 2, by - bh * 0.44, nw, nh, texture, sw);

  // head
  drawFilledEllipse(g, hx, hy, hr * 2.1, hr * 1.95, texture, sw);

  // ear
  drawEarSide(g, hx, hy, hr, dog.earType, f, sw, texture);

  // front legs
  drawLeg(g, f * bw * 0.22, legY0, legW, legH, sw);
  drawLeg(g, f * bw * 0.10, legY0, legW, legH, sw);

  // face
  drawFaceSide(g, hx, hy, hr, f, dog.hasTongue, sw);

  if (dog.hasCollar) drawCollarSide(g, hx - f * hr * 0.35, by - bh * 0.32, hr, f, sw);
  if (dog.hasSpots)  drawSpots(g, 0, by, bw * 0.65, bh * 0.72, dog.spotSeed, sw);
}

// ── Pose: FRONT ───────────────────────────────────────────────────────────────

function drawDogFront(g, uw, uh, dog, texture, sw) {
  const bw  = uw * 0.52;
  const bh  = uh * 0.38;
  const by  = uh * 0.10;

  const hr  = bw * 0.42 * dog.headSize;
  const hy  = by - bh * 0.54 - hr * 0.45;

  const legH  = uh * 0.28 * dog.legLen;
  const legW  = bw * 0.14;
  const legY0 = by + bh * 0.46;

  // body
  drawFilledEllipse(g, 0, by, bw, bh, texture, sw);

  // neck
  const nw = bw * 0.3, nh = bh * 0.2;
  drawFilledRect(g, -nw / 2, by - bh * 0.5, nw, nh, texture, sw);

  // head
  drawFilledEllipse(g, 0, hy, hr * 2.1, hr * 2.0, texture, sw);

  // ears
  drawEarsFront(g, 0, hy, hr, dog.earType, sw, texture);

  // front legs
  drawLeg(g, -bw * 0.20, legY0, legW, legH, sw);
  drawLeg(g,  bw * 0.20, legY0, legW, legH, sw);

  // tail peek
  g.push(); g.noFill(); g.strokeWeight(sw);
  g.beginShape();
  g.vertex(bw * 0.44, by - bh * 0.08);
  g.bezierVertex(bw * 0.68, by - bh * 0.5, bw * 0.78, by - bh * 0.1, bw * 0.70, by + bh * 0.3);
  g.endShape();
  g.pop();

  // face
  drawFaceFront(g, 0, hy, hr, dog.hasTongue, sw);

  if (dog.hasCollar) drawCollarFront(g, 0, by - bh * 0.44, bw * 0.48, sw);
  if (dog.hasSpots)  drawSpots(g, 0, by, bw * 0.68, bh * 0.68, dog.spotSeed, sw);
}

// ── Pose: SITTING ─────────────────────────────────────────────────────────────

function drawDogSitting(g, uw, uh, dog, texture, sw) {
  const tw  = uw * 0.40;
  const th  = uh * 0.28;
  const ty  = uh * 0.00;

  const hw  = uw * 0.38;
  const hh  = uh * 0.32;
  const hcy = ty + th * 0.65;

  // haunches
  drawFilledEllipse(g, -uw * 0.27, hcy, hw, hh, texture, sw);
  drawFilledEllipse(g,  uw * 0.27, hcy, hw, hh, texture, sw);

  // torso
  drawFilledEllipse(g, 0, ty, tw, th, texture, sw);

  // front legs
  const legH  = uh * 0.24 * dog.legLen;
  const legW  = tw * 0.20;
  const legY0 = ty + th * 0.42;
  drawLeg(g, -tw * 0.20, legY0, legW, legH, sw);
  drawLeg(g,  tw * 0.20, legY0, legW, legH, sw);

  // neck + head
  const hr  = uw * 0.23 * dog.headSize;
  const hy  = ty - th * 0.6 - hr * 0.6;
  const nw  = tw * 0.36, nh = th * 0.28;
  drawFilledRect(g, -nw / 2, ty - th * 0.5, nw, nh, texture, sw);
  drawFilledEllipse(g, 0, hy, hr * 2.1, hr * 2.0, texture, sw);

  // ears
  drawEarsFront(g, 0, hy, hr, dog.earType, sw, texture);

  // tail
  g.push(); g.noFill(); g.strokeWeight(sw);
  g.beginShape();
  g.vertex(uw * 0.38, hcy);
  g.bezierVertex(uw * 0.62, hcy - hh * 0.7, uw * 0.58, hcy - hh * 1.4, uw * 0.32, hcy - hh * 1.2);
  g.endShape();
  g.pop();

  // face
  drawFaceFront(g, 0, hy, hr, dog.hasTongue, sw);

  if (dog.hasCollar) drawCollarFront(g, 0, ty - th * 0.44, tw * 0.44, sw);
  if (dog.hasSpots)  drawSpots(g, 0, ty, tw * 0.65, th * 0.65, dog.spotSeed, sw);
}

// ── Shape parts ───────────────────────────────────────────────────────────────

function drawLeg(g, lx, ly, lw, lh, sw) {
  g.push();
  g.fill(255); g.strokeWeight(sw);
  g.rect(lx - lw / 2, ly, lw, lh);
  // paw
  g.ellipse(lx, ly + lh + lw * 0.35, lw * 1.5, lw * 0.9);
  g.pop();
}

function drawTailShape(g, tx, ty, f, bh, tailType, sw) {
  g.push(); g.noFill(); g.strokeWeight(sw * 0.85);
  if (tailType === 'curl') {
    g.beginShape();
    g.vertex(tx, ty);
    g.bezierVertex(
      tx - f * bh * 0.9, ty - bh * 1.0,
      tx - f * bh * 1.5, ty - bh * 0.35,
      tx - f * bh * 1.0, ty + bh * 0.22
    );
    g.endShape();
  } else {
    g.beginShape();
    g.vertex(tx, ty);
    g.bezierVertex(
      tx - f * bh * 0.25, ty - bh * 0.65,
      tx - f * bh * 0.45, ty - bh * 1.15,
      tx - f * bh * 0.28, ty - bh * 1.4
    );
    g.endShape();
  }
  g.pop();
}

// ── Ear helpers ───────────────────────────────────────────────────────────────

function drawEarSide(g, hx, hy, hr, earType, f, sw, texture) {
  g.push(); g.strokeWeight(sw);
  if (earType === 'floppy') {
    const ex = hx + f * hr * 0.45;
    const ey = hy + hr * 0.28;
    drawFilledEllipseTransformed(g, ex, ey, hr * 0.52, hr * 1.05, f * 22, texture, sw);
  } else {
    g.fill(255);
    g.triangle(
      hx + f * hr * 0.05, hy - hr * 0.55,
      hx + f * hr * 0.72, hy - hr * 0.52,
      hx + f * hr * 0.40, hy - hr * 1.5
    );
  }
  g.pop();
}

function drawEarsFront(g, hx, hy, hr, earType, sw, texture) {
  g.push(); g.strokeWeight(sw);
  if (earType === 'floppy') {
    drawFilledEllipseTransformed(g, hx - hr * 0.78, hy + hr * 0.15, hr * 0.52, hr * 1.05, -22, texture, sw);
    drawFilledEllipseTransformed(g, hx + hr * 0.78, hy + hr * 0.15, hr * 0.52, hr * 1.05,  22, texture, sw);
  } else {
    g.fill(255);
    g.triangle(hx - hr * 0.8, hy - hr * 0.48, hx - hr * 0.15, hy - hr * 0.62, hx - hr * 0.47, hy - hr * 1.6);
    g.triangle(hx + hr * 0.8, hy - hr * 0.48, hx + hr * 0.15, hy - hr * 0.62, hx + hr * 0.47, hy - hr * 1.6);
  }
  g.pop();
}

// Draws a rotated filled ellipse (for floppy ears)
function drawFilledEllipseTransformed(g, cx, cy, ew, eh, angleDeg, texture, sw) {
  // white fill
  g.push(); g.fill(255); g.noStroke();
  g.translate(cx, cy); g.rotate(g.radians(angleDeg));
  g.ellipse(0, 0, ew, eh);
  g.pop();

  // texture
  if (texture !== 'NONE') {
    g.push();
    g.drawingContext.save();
    g.translate(cx, cy); g.rotate(g.radians(angleDeg));
    // clip in rotated local space
    g.drawingContext.beginPath();
    g.drawingContext.ellipse(0, 0, ew / 2, eh / 2, 0, 0, Math.PI * 2);
    g.drawingContext.clip();
    drawTexturePattern(g, -ew / 2, -eh / 2, ew, eh, texture);
    g.drawingContext.restore();
    g.pop();
  }

  // outline
  g.push(); g.noFill(); g.strokeWeight(sw);
  g.translate(cx, cy); g.rotate(g.radians(angleDeg));
  g.ellipse(0, 0, ew, eh);
  g.pop();
}

// ── Face helpers ──────────────────────────────────────────────────────────────

function drawFaceSide(g, hx, hy, hr, f, hasTongue, sw) {
  // eye
  g.push(); g.fill('#1A1A1A'); g.noStroke();
  const er = hr * 0.17;
  g.circle(hx + f * hr * 0.18, hy - hr * 0.18, er * 2);
  g.fill(255);
  g.circle(hx + f * hr * 0.23, hy - hr * 0.24, er * 0.52);
  g.pop();

  // nose
  g.push(); g.fill('#1A1A1A'); g.noStroke();
  g.circle(hx + f * hr * 0.74, hy + hr * 0.05, hr * 0.24);
  g.pop();

  // mouth
  g.push(); g.noFill(); g.strokeWeight(sw * 0.7);
  g.arc(hx + f * hr * 0.5, hy + hr * 0.22, hr * 0.55, hr * 0.42, 0, g.PI * 0.75);
  g.pop();

  if (hasTongue) {
    g.push(); g.fill('#FF6EB4'); g.strokeWeight(sw * 0.65);
    g.ellipse(hx + f * hr * 0.58, hy + hr * 0.55, hr * 0.30, hr * 0.42);
    g.pop();
  }
}

function drawFaceFront(g, hx, hy, hr, hasTongue, sw) {
  const eo  = hr * 0.38;
  const er  = hr * 0.19;

  // eyes
  g.push(); g.fill('#1A1A1A'); g.noStroke();
  g.circle(hx - eo, hy - hr * 0.12, er * 2);
  g.circle(hx + eo, hy - hr * 0.12, er * 2);
  g.fill(255);
  g.circle(hx - eo + er * 0.38, hy - hr * 0.20, er * 0.55);
  g.circle(hx + eo + er * 0.38, hy - hr * 0.20, er * 0.55);
  g.pop();

  // nose
  g.push(); g.fill('#1A1A1A'); g.strokeWeight(sw * 0.55);
  const nw = hr * 0.44, nh = hr * 0.28;
  g.ellipse(hx, hy + hr * 0.22, nw, nh);
  g.fill(50);
  g.ellipse(hx - nw * 0.22, hy + hr * 0.22, nw * 0.24, nh * 0.55);
  g.ellipse(hx + nw * 0.22, hy + hr * 0.22, nw * 0.24, nh * 0.55);
  g.pop();

  // mouth
  g.push(); g.noFill(); g.strokeWeight(sw * 0.7);
  g.line(hx, hy + hr * 0.40, hx - hr * 0.22, hy + hr * 0.58);
  g.line(hx, hy + hr * 0.40, hx + hr * 0.22, hy + hr * 0.58);
  g.pop();

  if (hasTongue) {
    g.push(); g.fill('#FF6EB4'); g.strokeWeight(sw * 0.65);
    g.ellipse(hx, hy + hr * 0.74, hr * 0.33, hr * 0.46);
    g.pop();
  }
}

// ── Collar / spots ────────────────────────────────────────────────────────────

function drawCollarSide(g, cx, cy, hr, f, sw) {
  g.push(); g.fill(255); g.strokeWeight(sw * 0.8);
  const cw = hr * 0.9, ch = hr * 0.22;
  g.rect(cx - cw / 2, cy - ch / 2, cw, ch);
  g.circle(cx + f * cw * 0.08, cy + ch * 0.9, ch * 1.1);
  g.pop();
}

function drawCollarFront(g, cx, cy, cw, sw) {
  g.push(); g.fill(255); g.strokeWeight(sw * 0.8);
  const ch = cw * 0.2;
  g.rect(cx - cw / 2, cy, cw, ch);
  g.circle(cx, cy + ch + ch * 0.55, ch * 1.05);
  g.pop();
}

function drawSpots(g, cx, cy, bw, bh, seed, sw) {
  const rng = mulberry32(seed);
  const n   = 2 + Math.floor(rng() * 3);
  g.push(); g.fill('#1A1A1A'); g.noStroke();
  for (let i = 0; i < n; i++) {
    const sx = cx + (rng() - 0.5) * bw;
    const sy = cy + (rng() - 0.5) * bh;
    const sr = bw * 0.038 + rng() * bw * 0.048;
    g.circle(sx, sy, sr * 2);
  }
  g.pop();
}

// ── Filled shape helpers (white + texture + stroke) ───────────────────────────

function drawFilledEllipse(g, cx, cy, ew, eh, texture, sw) {
  g.push(); g.fill(255); g.noStroke();
  g.ellipse(cx, cy, ew, eh);
  g.pop();

  if (texture !== 'NONE') {
    g.push();
    g.drawingContext.save();
    g.drawingContext.beginPath();
    g.drawingContext.ellipse(cx, cy, ew / 2, eh / 2, 0, 0, Math.PI * 2);
    g.drawingContext.clip();
    drawTexturePattern(g, cx - ew / 2, cy - eh / 2, ew, eh, texture);
    g.drawingContext.restore();
    g.pop();
  }

  g.push(); g.noFill(); g.strokeWeight(sw);
  g.ellipse(cx, cy, ew, eh);
  g.pop();
}

function drawFilledRect(g, rx, ry, rw, rh, texture, sw) {
  g.push(); g.fill(255); g.noStroke();
  g.rect(rx, ry, rw, rh);
  g.pop();

  if (texture !== 'NONE') {
    g.push();
    g.drawingContext.save();
    g.drawingContext.beginPath();
    g.drawingContext.rect(rx, ry, rw, rh);
    g.drawingContext.clip();
    drawTexturePattern(g, rx, ry, rw, rh, texture);
    g.drawingContext.restore();
    g.pop();
  }

  g.push(); g.noFill(); g.strokeWeight(sw);
  g.rect(rx, ry, rw, rh);
  g.pop();
}

// ── Filler elements ───────────────────────────────────────────────────────────

function drawFillerInCell(g, cell, texture) {
  const { cx, cy, w, h, fillerType } = cell;
  const sw = Math.max(4, Math.min(w, h) * 0.020);
  g.strokeWeight(sw);
  g.stroke('#1A1A1A');

  if      (fillerType === 'DIAMONDS')  drawFillerDiamonds(g, cx, cy, w, h, sw, texture);
  else if (fillerType === 'CIRCLES')   drawFillerCircles(g, cx, cy, w, h, sw, texture);
  else if (fillerType === 'BOLD_TEXT') drawFillerBoldText(g, cx, cy, w, h, sw);
  else if (fillerType === 'ZIGZAG')    drawFillerZigzag(g, cx, cy, w, h, sw);
  else if (fillerType === 'EYE')       drawFillerEye(g, cx, cy, w, h, sw, texture);
  else if (fillerType === 'STARBURST') drawFillerStarburst(g, cx, cy, w, h, sw);
}

function drawFillerDiamonds(g, cx, cy, w, h, sw, texture) {
  const cols = 3, rows = 4;
  const dSize = Math.min(w / cols, h / rows) * 0.68;
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const dx = cx - w / 2 + (col + 0.5) * (w / cols);
      const dy = cy - h / 2 + (row + 0.5) * (h / rows);
      g.push(); g.translate(dx, dy); g.rotate(g.radians(45));
      g.fill(255); g.noStroke();
      g.rect(-dSize / 2, -dSize / 2, dSize, dSize);
      if (texture !== 'NONE') {
        g.drawingContext.save();
        g.drawingContext.beginPath();
        g.drawingContext.rect(-dSize / 2, -dSize / 2, dSize, dSize);
        g.drawingContext.clip();
        drawTexturePattern(g, -dSize / 2, -dSize / 2, dSize, dSize, texture);
        g.drawingContext.restore();
      }
      g.noFill(); g.strokeWeight(sw);
      g.rect(-dSize / 2, -dSize / 2, dSize, dSize);
      g.pop();
    }
  }
}

function drawFillerCircles(g, cx, cy, w, h, sw, texture) {
  const cols = 3, rows = 4;
  const r = Math.min(w / cols, h / rows) * 0.40;
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const dx = cx - w / 2 + (col + 0.5) * (w / cols);
      const dy = cy - h / 2 + (row + 0.5) * (h / rows);
      drawFilledEllipse(g, dx, dy, r * 2, r * 2, texture, sw);
    }
  }
}

function drawFillerBoldText(g, cx, cy, w, h, sw) {
  const words  = ['GUAU', 'WOOF', 'PERRO', 'BORK', 'ARF'];
  const word   = words[Math.floor(Math.random() * words.length)];
  const fs     = Math.min(w * 0.52, h * 0.26);
  const lineH  = fs * 1.18;
  const lines  = Math.floor(h / lineH);
  g.push();
  g.textSize(fs);
  g.textFont('JetBrains Mono, monospace');
  g.textAlign(g.CENTER, g.CENTER);
  for (let i = 0; i < lines; i++) {
    const ly = cy - h / 2 + lineH * (i + 0.5);
    if (i % 2 === 0) {
      g.fill('#1A1A1A'); g.noStroke();
      g.text(word, cx, ly);
    } else {
      g.noFill(); g.stroke('#1A1A1A'); g.strokeWeight(sw * 0.45);
      g.text(word, cx, ly);
    }
  }
  g.pop();
}

function drawFillerZigzag(g, cx, cy, w, h, sw) {
  const rows = 9;
  const stepH = h / rows;
  g.push(); g.noFill(); g.strokeWeight(sw * 1.1);
  for (let row = 0; row < rows; row++) {
    const yBase = cy - h / 2 + (row + 0.5) * stepH;
    const cols  = 7;
    g.beginShape();
    for (let col = 0; col <= cols; col++) {
      const x  = cx - w / 2 + (col / cols) * w;
      const zy = yBase + (col % 2 === 0 ? -stepH * 0.38 : stepH * 0.38);
      g.vertex(x, zy);
    }
    g.endShape();
  }
  g.pop();
}

function drawFillerEye(g, cx, cy, w, h, sw, texture) {
  const eyeW = w * 0.72;
  const eyeH = h * 0.22;
  const count = 3;
  const gap   = h * 0.3;
  for (let i = 0; i < count; i++) {
    const ey = cy - gap + i * gap;
    drawFilledEllipse(g, cx, ey, eyeW, eyeH, texture, sw);
    // pupil
    g.push(); g.fill('#1A1A1A'); g.noStroke();
    g.circle(cx, ey, eyeH * 0.72);
    g.pop();
  }
}

function drawFillerStarburst(g, cx, cy, w, h, sw) {
  const r1  = Math.min(w, h) * 0.42;
  const r2  = r1 * 0.48;
  const pts = 8 + Math.floor(Math.random() * 5);
  g.push(); g.fill(255); g.strokeWeight(sw);
  g.beginShape();
  for (let i = 0; i < pts * 2; i++) {
    const a = (Math.PI * 2 / (pts * 2)) * i - Math.PI / 2;
    const r = i % 2 === 0 ? r1 : r2;
    g.vertex(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  g.endShape(g.CLOSE);
  g.pop();
}

// ── Texture patterns ──────────────────────────────────────────────────────────

function drawTexturePattern(g, bx, by, bw, bh, texture) {
  const spacing  = Math.max(10, Math.min(bw, bh) * 0.075);
  const texColor = darkenHex(state.bgColor, 85);
  g.noFill();
  g.stroke(texColor + '58');
  g.strokeWeight(Math.max(2, spacing * 0.13));

  if      (texture === 'HATCHING_45') drawHatching(g, bx, by, bw, bh, spacing, 45);
  else if (texture === 'CROSSHATCH')  { drawHatching(g, bx, by, bw, bh, spacing, 45); drawHatching(g, bx, by, bw, bh, spacing, -45); }
  else if (texture === 'DOTS')        drawDotsFill(g, bx, by, bw, bh, spacing, texColor);
  else if (texture === 'BITMAP')      drawBitmapFill(g, bx, by, bw, bh, spacing, texColor);
  else if (texture === 'WORDS')       drawWordsFill(g, bx, by, bw, bh, spacing, texColor);
}

function drawHatching(g, bx, by, bw, bh, spacing, angle) {
  g.push();
  g.translate(bx + bw / 2, by + bh / 2);
  g.rotate(g.radians(angle));
  const diag = Math.sqrt(bw * bw + bh * bh);
  for (let i = -diag; i < diag; i += spacing) {
    g.line(i, -diag, i, diag);
  }
  g.pop();
}

function drawDotsFill(g, bx, by, bw, bh, spacing, texColor) {
  const r   = spacing * 0.21;
  const rng = mulberry32(54321);
  g.noStroke(); g.fill(texColor + '58');
  for (let ix = bx + spacing / 2; ix < bx + bw; ix += spacing) {
    for (let iy = by + spacing / 2; iy < by + bh; iy += spacing) {
      g.circle(ix + (rng() - 0.5) * spacing * 0.28, iy + (rng() - 0.5) * spacing * 0.28, r * 2);
    }
  }
  g.noFill();
}

function drawBitmapFill(g, bx, by, bw, bh, spacing, texColor) {
  const px  = Math.max(4, spacing * 0.38);
  const rng = mulberry32(11111);
  g.noStroke(); g.fill(texColor + '58');
  for (let ix = bx; ix < bx + bw; ix += px) {
    for (let iy = by; iy < by + bh; iy += px) {
      if (rng() > 0.50) g.rect(ix, iy, px * 0.85, px * 0.85);
    }
  }
  g.noFill();
}

function drawWordsFill(g, bx, by, bw, bh, spacing, texColor) {
  const words      = ['woof', 'perro', 'guau'];
  const fs         = Math.max(8, spacing * 0.62);
  const colSpacing = fs * 3.8;
  const rowSpacing = fs * 1.7;
  g.noStroke(); g.fill(texColor + '58');
  g.textSize(fs);
  g.textFont('JetBrains Mono, monospace');
  let idx = 0;
  for (let iy = by - rowSpacing; iy < by + bh + rowSpacing; iy += rowSpacing) {
    for (let ix = bx - colSpacing; ix < bx + bw + colSpacing; ix += colSpacing) {
      g.push(); g.translate(ix, iy); g.rotate(g.radians(45));
      g.text(words[idx % words.length], 0, 0);
      idx++;
      g.pop();
    }
  }
  g.noFill();
}

// ── Color & PRNG utils ────────────────────────────────────────────────────────

function darkenHex(hex, amount) {
  const r  = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const gv = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b  = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return '#' + [r, gv, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ── Randomize actions ─────────────────────────────────────────────────────────

function randomizeBackground() {
  const idx      = Math.floor(Math.random() * BG_PALETTE.length);
  state.bgColor  = BG_PALETTE[idx].hex;
  state.bgName   = BG_PALETTE[idx].name;
  updateMeta('meta-bg', `${state.bgColor} ${state.bgName}`);
  state.needsRedraw = true;
  if (p5instance) p5instance.redraw();
}

function randomizeTexture() {
  const idx       = Math.floor(Math.random() * TEXTURES.length);
  state.texture   = TEXTURES[idx].id;
  state.texLabel  = TEXTURES[idx].label;
  updateMeta('meta-texture', state.texLabel);
  state.needsRedraw = true;
  if (p5instance) p5instance.redraw();
}

// ── Export ────────────────────────────────────────────────────────────────────

function exportPNG() {
  pg.save(`doggo-print-${Date.now()}.png`);
}

function exportPDF() {
  const { jsPDF }   = window.jspdf;
  const fmtKey      = state.format;
  const dims        = fmtKey === 'A4' ? [210, 297] : [297, 420];
  const doc         = new jsPDF({ orientation: 'portrait', unit: 'mm', format: fmtKey.toLowerCase() });
  const imgData     = pg.elt.toDataURL('image/jpeg', 0.92);
  doc.addImage(imgData, 'JPEG', 0, 0, dims[0], dims[1]);
  doc.save(`doggo-print-${Date.now()}.pdf`);
}

// ── UI wiring ─────────────────────────────────────────────────────────────────

function wireUI(p) {
  document.getElementById('btn-dogs').addEventListener('click', randomizeDogs);
  document.getElementById('btn-bg').addEventListener('click', randomizeBackground);
  document.getElementById('btn-texture').addEventListener('click', randomizeTexture);
  document.getElementById('btn-a4').addEventListener('click', () => setFormat('A4', p));
  document.getElementById('btn-a3').addEventListener('click', () => setFormat('A3', p));
  document.getElementById('btn-png').addEventListener('click', exportPNG);
  document.getElementById('btn-pdf').addEventListener('click', exportPDF);

  updateMeta('meta-bg', `${state.bgColor} ${state.bgName}`);
  updateMeta('meta-texture', state.texLabel);
}

function setFormat(fmt, p) {
  state.format = fmt;
  document.getElementById('btn-a4').classList.toggle('active', fmt === 'A4');
  document.getElementById('btn-a3').classList.toggle('active', fmt === 'A3');

  const newFmt = FORMATS[fmt];
  pg = p.createGraphics(newFmt.w, newFmt.h);

  randomizeDogs();

  const dims = scaledDims();
  p.resizeCanvas(dims.w, dims.h);
  state.needsRedraw = true;
  p.redraw();
}

function updateMeta(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

window.addEventListener('resize', () => {
  if (!p5instance) return;
  const dims = scaledDims();
  p5instance.resizeCanvas(dims.w, dims.h);
  state.needsRedraw = true;
  p5instance.redraw();
});
