(function () {
  'use strict';

  // ---------------------------------------------------------------------
  // Config
  // ---------------------------------------------------------------------
  const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#78350f', '#111827'
  ];

  const OBJECT_EMOJIS = ['🍎', '🍓', '⭐', '🎈', '🐟', '🌸', '🚗', '🐱', '⚽', '🍌', '🦋', '🧸', '🍩', '🐢', '🌼'];

  const STAGES = [
    { key: 'seq-outline', label: '1단계 · 순서대로 (윤곽선)', guide: 'thick', order: 'sequential' },
    { key: 'rand-outline', label: '2단계 · 무작위 (윤곽선)', guide: 'thick', order: 'random' },
    { key: 'rand-dotted', label: '3단계 · 무작위 (점선)', guide: 'thin', order: 'random' },
    { key: 'rand-blank', label: '4단계 · 무작위 (도움 없이)', guide: 'none', order: 'random' }
  ];

  // Per-digit handwriting stroke paths, in a shared 100x140 design box.
  // Each digit is one or more strokes; each stroke is a sequence of path
  // commands (M/L/Q) written in stroke order/direction. These same paths
  // drive the paintable mask, the dashed guide line, the direction arrows,
  // and the "corrected" reveal, so tracing the arrows always draws the
  // number exactly.
  const DIGIT_STROKES = {
    '0': [[
      { cmd: 'M', x: 50, y: 6 },
      { cmd: 'Q', cx: 8, cy: 6, x: 8, y: 70 },
      { cmd: 'Q', cx: 8, cy: 134, x: 50, y: 134 },
      { cmd: 'Q', cx: 92, cy: 134, x: 92, y: 70 },
      { cmd: 'Q', cx: 92, cy: 6, x: 50, y: 6 }
    ]],
    '1': [[
      { cmd: 'M', x: 50, y: 18 },
      { cmd: 'L', x: 50, y: 134 }
    ]],
    '2': [[
      { cmd: 'M', x: 16, y: 34 },
      { cmd: 'Q', cx: 30, cy: 4, x: 55, y: 6 },
      { cmd: 'Q', cx: 88, cy: 8, x: 86, y: 34 },
      { cmd: 'Q', cx: 84, cy: 54, x: 58, y: 72 },
      { cmd: 'L', x: 18, y: 130 },
      { cmd: 'L', x: 90, y: 130 }
    ]],
    '3': [[
      { cmd: 'M', x: 18, y: 18 },
      { cmd: 'Q', cx: 55, cy: 2, x: 82, y: 20 },
      { cmd: 'Q', cx: 96, cy: 34, x: 74, y: 52 },
      { cmd: 'Q', cx: 60, cy: 62, x: 46, y: 62 },
      { cmd: 'Q', cx: 66, cy: 64, x: 84, y: 80 },
      { cmd: 'Q', cx: 98, cy: 98, x: 80, y: 118 },
      { cmd: 'Q', cx: 60, cy: 136, x: 18, y: 122 }
    ]],
    '4': [
      [
        { cmd: 'M', x: 66, y: 6 },
        { cmd: 'L', x: 14, y: 88 },
        { cmd: 'L', x: 90, y: 88 }
      ],
      [
        { cmd: 'M', x: 70, y: 20 },
        { cmd: 'L', x: 70, y: 134 }
      ]
    ],
    '5': [
      [
        { cmd: 'M', x: 22, y: 10 },
        { cmd: 'L', x: 80, y: 10 }
      ],
      [
        { cmd: 'M', x: 22, y: 10 },
        { cmd: 'L', x: 18, y: 58 },
        { cmd: 'Q', cx: 40, cy: 50, x: 64, y: 60 },
        { cmd: 'Q', cx: 92, cy: 74, x: 84, y: 104 },
        { cmd: 'Q', cx: 76, cy: 132, x: 28, y: 128 }
      ]
    ],
    '6': [[
      { cmd: 'M', x: 78, y: 10 },
      { cmd: 'Q', cx: 28, cy: 16, x: 16, y: 62 },
      { cmd: 'Q', cx: 6, cy: 100, x: 34, y: 122 },
      { cmd: 'Q', cx: 64, cy: 140, x: 84, y: 112 },
      { cmd: 'Q', cx: 100, cy: 88, x: 78, y: 70 },
      { cmd: 'Q', cx: 54, cy: 54, x: 34, y: 72 },
      { cmd: 'Q', cx: 22, cy: 84, x: 30, y: 100 }
    ]],
    '7': [[
      { cmd: 'M', x: 15, y: 12 },
      { cmd: 'L', x: 88, y: 12 },
      { cmd: 'L', x: 35, y: 136 }
    ]],
    '8': [[
      { cmd: 'M', x: 50, y: 68 },
      { cmd: 'Q', cx: 20, cy: 68, x: 20, y: 38 },
      { cmd: 'Q', cx: 20, cy: 6, x: 50, y: 6 },
      { cmd: 'Q', cx: 80, cy: 6, x: 80, y: 38 },
      { cmd: 'Q', cx: 80, cy: 68, x: 50, y: 68 },
      { cmd: 'Q', cx: 20, cy: 68, x: 20, y: 102 },
      { cmd: 'Q', cx: 20, cy: 134, x: 50, y: 134 },
      { cmd: 'Q', cx: 80, cy: 134, x: 80, y: 102 },
      { cmd: 'Q', cx: 80, cy: 68, x: 50, y: 68 }
    ]],
    '9': [[
      { cmd: 'M', x: 66, y: 44 },
      { cmd: 'Q', cx: 66, cy: 14, x: 45, y: 14 },
      { cmd: 'Q', cx: 22, cy: 14, x: 22, y: 40 },
      { cmd: 'Q', cx: 22, cy: 66, x: 45, y: 66 },
      { cmd: 'Q', cx: 66, cy: 66, x: 66, y: 42 },
      { cmd: 'L', x: 60, y: 100 },
      { cmd: 'Q', cx: 57, cy: 128, x: 32, y: 132 }
    ]]
  };

  // Alternate stroke forms accepted only when *recognizing* a freeform
  // drawing (stage 4) - not used for the guide/mask/arrows in earlier
  // stages, which always teach the single canonical DIGIT_STROKES form.
  // Kids very commonly write "1" with a top flag and a base serif, and
  // "4" with an open (non-triangle) top instead of a closed apex; both
  // are legitimate, so the recognizer tries each digit's plain form and
  // these variants and keeps whichever scores best.
  const DIGIT_RECOGNITION_ALTS = {
    '1': [
      [
        { cmd: 'M', x: 30, y: 34 },
        { cmd: 'L', x: 50, y: 18 },
        { cmd: 'L', x: 50, y: 134 }
      ],
      [
        { cmd: 'M', x: 30, y: 134 },
        { cmd: 'L', x: 70, y: 134 }
      ]
    ],
    '4': [
      [
        { cmd: 'M', x: 66, y: 6 },
        { cmd: 'L', x: 14, y: 88 },
        { cmd: 'L', x: 90, y: 88 }
      ],
      [
        { cmd: 'M', x: 70, y: 88 },
        { cmd: 'L', x: 70, y: 134 }
      ]
    ]
  };

  const STROKE_BOX_W = 100;
  const STROKE_BOX_H = 140;

  // ---------------------------------------------------------------------
  // DOM refs
  // ---------------------------------------------------------------------
  const drawArea = document.getElementById('draw-area');
  const guideCanvas = document.getElementById('guideCanvas');
  const inkCanvas = document.getElementById('inkCanvas');
  const objectGrid = document.getElementById('object-grid');
  const stageDotsEl = document.getElementById('stage-dots');
  const progressLabel = document.getElementById('progress-label');
  const colorPickerEl = document.getElementById('color-picker');
  const actionButtons = document.getElementById('action-buttons');
  const clearBtn = document.getElementById('clear-btn');
  const doneBtn = document.getElementById('done-btn');
  const hintToast = document.getElementById('hint-toast');
  const resultOverlay = document.getElementById('result-overlay');
  const resultCanvas = document.getElementById('resultCanvas');
  const resultBar = document.getElementById('result-bar');
  const nextBtn = document.getElementById('next-btn');
  const stageClearOverlay = document.getElementById('stage-clear-overlay');
  const stageClearTitle = document.getElementById('stage-clear-title');
  const stageNextBtn = document.getElementById('stage-next-btn');
  const allClearOverlay = document.getElementById('all-clear-overlay');
  const restartBtn2 = document.getElementById('restart-btn-2');
  const restartBtn = document.getElementById('restart-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsOverlay = document.getElementById('settings-overlay');
  const settingsCloseBtn = document.getElementById('settings-close-btn');
  const recordingListEl = document.getElementById('recording-list');

  // ---------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  let stageIndex = 0;
  let numberQueue = [];
  let queuePos = 0;
  let currentNumber = 1;
  let currentColor = COLORS[0];
  let strokes = [];
  let activePointerId = null;
  let cssW = 0, cssH = 0;
  let currentGlyphInfo = null;
  let guideCtx = null, inkCtx = null;
  let maskCanvas = null, maskCtx = null, maskOpaqueCount = 0;
  let altMaskCanvas = null, altMaskCtx = null;
  let hintTimer = null;
  let midAnnounced = false;

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildQueue(stage) {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    return stage.order === 'sequential' ? nums : shuffle(nums);
  }

  function setupHiDPICanvas(canvas, wCss, hCss) {
    canvas.width = Math.max(1, Math.round(wCss * dpr));
    canvas.height = Math.max(1, Math.round(hCss * dpr));
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  function sampleAlphaCount(ctx, canvas) {
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let count = 0;
    for (let i = 3; i < data.length; i += 16) if (data[i] > 10) count++;
    return count;
  }

  function currentStageGuideMode() {
    return STAGES[stageIndex].guide;
  }

  // ---------------------------------------------------------------------
  // Layout
  // ---------------------------------------------------------------------
  function layout() {
    const rect = drawArea.getBoundingClientRect();
    cssW = rect.width;
    cssH = rect.height;
    guideCtx = setupHiDPICanvas(guideCanvas, cssW, cssH);
    inkCtx = setupHiDPICanvas(inkCanvas, cssW, cssH);
    maskCanvas = maskCanvas || document.createElement('canvas');
    maskCtx = setupHiDPICanvas(maskCanvas, cssW, cssH);
    altMaskCanvas = altMaskCanvas || document.createElement('canvas');
    altMaskCtx = setupHiDPICanvas(altMaskCanvas, cssW, cssH);
    if (numberQueue.length) {
      strokes = [];
      loadRound();
    }
  }

  function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

  // ---------------------------------------------------------------------
  // Mask (paintable silhouette of the number) + guide (visual scaffolding)
  //
  // The mask, the dashed guide, the direction arrows, and the corrected
  // reveal are all traced from the same DIGIT_STROKES data through the
  // same character boxes, so the arrows always sit exactly on the line
  // the child is meant to draw, start to finish.
  // ---------------------------------------------------------------------
  function computeLayout(number) {
    const text = String(number);
    const n = text.length;
    let charH = cssH * 0.72;
    let charW = charH * (STROKE_BOX_W / STROKE_BOX_H);
    let gapPx = charH * 0.08;
    let totalWidth = charW * n + gapPx * (n - 1);
    const maxWidth = cssW * 0.8;
    if (totalWidth > maxWidth) {
      const scale = maxWidth / totalWidth;
      charH *= scale;
      charW *= scale;
      gapPx *= scale;
      totalWidth = maxWidth;
    }
    const x0 = cssW / 2 - totalWidth / 2;
    const y0 = cssH / 2 - charH / 2;
    return { text, n, charW, charH, gapPx, x0, y0 };
  }

  function charBox(lay, i) {
    return { boxX: lay.x0 + i * (lay.charW + lay.gapPx), boxY: lay.y0, boxW: lay.charW, boxH: lay.charH };
  }

  function mapPt(box, dx, dy) {
    return { x: box.boxX + (dx / STROKE_BOX_W) * box.boxW, y: box.boxY + (dy / STROKE_BOX_H) * box.boxH };
  }

  function tracePathOnCtx(ctx, stroke, box) {
    for (const cmd of stroke) {
      if (cmd.cmd === 'M') {
        const p = mapPt(box, cmd.x, cmd.y);
        ctx.moveTo(p.x, p.y);
      } else if (cmd.cmd === 'L') {
        const p = mapPt(box, cmd.x, cmd.y);
        ctx.lineTo(p.x, p.y);
      } else if (cmd.cmd === 'Q') {
        const c = mapPt(box, cmd.cx, cmd.cy);
        const p = mapPt(box, cmd.x, cmd.y);
        ctx.quadraticCurveTo(c.x, c.y, p.x, p.y);
      }
    }
  }

  function forEachDigitStroke(lay, fn) {
    for (let i = 0; i < lay.n; i++) {
      const ch = lay.text[i];
      const strokesForCh = DIGIT_STROKES[ch];
      if (!strokesForCh) continue;
      const box = charBox(lay, i);
      strokesForCh.forEach((stroke, strokeIdx) => fn(stroke, box, strokeIdx, strokesForCh.length));
    }
  }

  function strokeAllDigits(ctx, lay) {
    forEachDigitStroke(lay, (stroke, box) => {
      ctx.beginPath();
      tracePathOnCtx(ctx, stroke, box);
      ctx.stroke();
    });
  }

  function drawMask(number) {
    const lay = computeLayout(number);
    maskCtx.clearRect(0, 0, cssW, cssH);
    maskCtx.lineCap = 'round';
    maskCtx.lineJoin = 'round';
    maskCtx.setLineDash([]);
    maskCtx.strokeStyle = '#000';
    maskCtx.lineWidth = lay.charW * 0.26;
    strokeAllDigits(maskCtx, lay);
    maskOpaqueCount = sampleAlphaCount(maskCtx, maskCanvas);
    return lay;
  }

  // Flattens one stroke (already mapped into canvas space) into a dense
  // polyline so arrows can be placed at even arc-length intervals along it.
  function flattenStroke(stroke, box) {
    const pts = [];
    let cur = null;
    for (const cmd of stroke) {
      if (cmd.cmd === 'M') {
        cur = mapPt(box, cmd.x, cmd.y);
        pts.push(cur);
      } else if (cmd.cmd === 'L') {
        cur = mapPt(box, cmd.x, cmd.y);
        pts.push(cur);
      } else if (cmd.cmd === 'Q') {
        const c = mapPt(box, cmd.cx, cmd.cy);
        const p1 = mapPt(box, cmd.x, cmd.y);
        const steps = 16;
        for (let s = 1; s <= steps; s++) {
          const t = s / steps, mt = 1 - t;
          pts.push({
            x: mt * mt * cur.x + 2 * mt * t * c.x + t * t * p1.x,
            y: mt * mt * cur.y + 2 * mt * t * c.y + t * t * p1.y
          });
        }
        cur = p1;
      }
    }
    return pts;
  }

  // Walks a flattened polyline and returns {x,y,angle} at even spacing,
  // skipping a little room at the very start/end for the start marker.
  function pointsAlongPolyline(pts, spacing, startOffset, endMargin) {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) {
      cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    }
    const total = cum[cum.length - 1];
    const out = [];
    if (total < 1) return out;
    for (let d = startOffset; d < total - endMargin; d += spacing) {
      let idx = 1;
      while (idx < cum.length - 1 && cum[idx] < d) idx++;
      const segLen = (cum[idx] - cum[idx - 1]) || 1;
      const t = (d - cum[idx - 1]) / segLen;
      const p0 = pts[idx - 1], p1 = pts[idx];
      out.push({
        x: p0.x + (p1.x - p0.x) * t,
        y: p0.y + (p1.y - p0.y) * t,
        angle: Math.atan2(p1.y - p0.y, p1.x - p0.x)
      });
    }
    return out;
  }

  function drawArrowHead(ctx, x, y, angle, headSize) {
    ctx.save();
    ctx.fillStyle = '#5b6ff0';
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(headSize, 0);
    ctx.lineTo(-headSize * 0.6, headSize * 0.6);
    ctx.lineTo(-headSize * 0.6, -headSize * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Draws a green "start here" dot (numbered when a digit needs more than
  // one stroke) plus a run of arrowheads along the stroke's own path, so
  // connecting dot -> arrows -> arrows traces the number itself.
  // Nudges a start-marker away from ones already placed for this digit, so
  // two strokes that begin at (or near) the same point - like "5"'s top
  // bar and its down-stroke - don't draw their numbered badges on top of
  // each other. Only the badge moves; the arrows still trace the true path.
  function resolveMarkerPos(pos, placed, minDist) {
    let candidate = pos;
    for (let attempt = 0; attempt < 8; attempt++) {
      const collides = placed.some((p) => Math.hypot(p.x - candidate.x, p.y - candidate.y) < minDist);
      if (!collides) break;
      const angle = (Math.PI * 2 * attempt) / 8 - Math.PI / 2;
      candidate = { x: pos.x + Math.cos(angle) * minDist * 1.3, y: pos.y + Math.sin(angle) * minDist * 1.3 };
    }
    return candidate;
  }

  function drawStrokeGuide(ctx, lay) {
    const placedMarkers = [];
    forEachDigitStroke(lay, (stroke, box, strokeIdx, strokeCount) => {
      const pts = flattenStroke(stroke, box);
      if (pts.length < 2) return;
      const headSize = Math.max(9, lay.charH * 0.05);
      const spacing = Math.max(24, lay.charH * 0.3);

      const marker = strokeCount > 1 ? resolveMarkerPos(pts[0], placedMarkers, headSize * 1.9) : pts[0];
      placedMarkers.push(marker);

      ctx.save();
      ctx.fillStyle = '#22c58b';
      ctx.beginPath();
      ctx.arc(marker.x, marker.y, headSize * 0.6, 0, Math.PI * 2);
      ctx.fill();
      if (strokeCount > 1) {
        ctx.fillStyle = '#fff';
        ctx.font = `700 ${Math.round(headSize * 0.85)}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(strokeIdx + 1), marker.x, marker.y + 1);
      }
      ctx.restore();

      const arrowPts = pointsAlongPolyline(pts, spacing, spacing * 0.7, spacing * 0.35);
      for (const ap of arrowPts) drawArrowHead(ctx, ap.x, ap.y, ap.angle, headSize);
    });
  }

  function drawGuide(number, mode, lay) {
    guideCtx.clearRect(0, 0, cssW, cssH);
    if (mode === 'none') return;
    guideCtx.lineCap = 'round';
    guideCtx.lineJoin = 'round';

    if (mode === 'thick') {
      guideCtx.setLineDash([]);
      guideCtx.strokeStyle = 'rgba(91,111,240,0.12)';
      guideCtx.lineWidth = lay.charW * 0.26;
      strokeAllDigits(guideCtx, lay);
      guideCtx.setLineDash([lay.charH * 0.05, lay.charH * 0.045]);
      guideCtx.lineWidth = Math.max(4, lay.charH * 0.02);
      guideCtx.strokeStyle = '#9aa8e8';
      strokeAllDigits(guideCtx, lay);
    } else if (mode === 'thin') {
      guideCtx.setLineDash([lay.charH * 0.026, lay.charH * 0.05]);
      guideCtx.lineWidth = Math.max(2, lay.charH * 0.008);
      guideCtx.strokeStyle = '#b7c0e0';
      strokeAllDigits(guideCtx, lay);
    }
    guideCtx.setLineDash([]);
    drawStrokeGuide(guideCtx, lay);
  }

  // ---------------------------------------------------------------------
  // Drawing / ink
  // ---------------------------------------------------------------------
  function getPos(e) {
    const rect = inkCanvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top, pressure: e.pressure };
  }

  // Ink is drawn incrementally (one new segment per input event, straight
  // onto the visible canvas) instead of clearing and replaying every point
  // of every stroke on every frame - that full-redraw approach got
  // noticeably laggy as a stroke grew long. Clipping to the number's
  // silhouette is handled by a CSS mask-image (applyInkMask), which the
  // browser composites for free, instead of a per-frame destination-in
  // drawImage of the whole canvas.
  function clearInk() {
    inkCtx.clearRect(0, 0, cssW, cssH);
  }

  function inkLineWidth() {
    return Math.max(14, cssW * 0.035);
  }

  function drawDot(p, color) {
    inkCtx.fillStyle = color;
    inkCtx.beginPath();
    inkCtx.arc(p.x, p.y, inkLineWidth() / 2, 0, Math.PI * 2);
    inkCtx.fill();
  }

  function drawSegment(p0, p1, color) {
    inkCtx.strokeStyle = color;
    inkCtx.lineJoin = 'round';
    inkCtx.lineCap = 'round';
    inkCtx.lineWidth = inkLineWidth();
    inkCtx.beginPath();
    inkCtx.moveTo(p0.x, p0.y);
    inkCtx.lineTo(p1.x, p1.y);
    inkCtx.stroke();
  }

  function applyInkMask(mode) {
    if (mode === 'none') {
      inkCanvas.style.maskImage = 'none';
      inkCanvas.style.webkitMaskImage = 'none';
      return;
    }
    const url = `url(${maskCanvas.toDataURL()})`;
    inkCanvas.style.maskImage = url;
    inkCanvas.style.webkitMaskImage = url;
    inkCanvas.style.maskSize = '100% 100%';
    inkCanvas.style.webkitMaskSize = '100% 100%';
    inkCanvas.style.maskRepeat = 'no-repeat';
    inkCanvas.style.webkitMaskRepeat = 'no-repeat';
  }

  // Coverage checks read the raw (unmasked) ink pixels intersected with
  // the mask, since the visible clipping now happens in CSS rather than
  // in the canvas's own pixel buffer.
  function computeMaskedInkCount() {
    const inkData = inkCtx.getImageData(0, 0, inkCanvas.width, inkCanvas.height).data;
    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
    let count = 0;
    for (let i = 3; i < inkData.length; i += 16) {
      if (inkData[i] > 10 && maskData[i] > 10) count++;
    }
    return count;
  }

  // ---------------------------------------------------------------------
  // Freeform-stage shape check: no font/ML OCR is involved. Instead the
  // child's ink is compared against our own digit-stroke silhouette for
  // this number (the same one drawn as the mask in earlier stages, still
  // rendered off-screen to maskCanvas every round even in this stage).
  // Both shapes are re-sampled into a small canonical grid using their own
  // bounding box (uniform scale, centered) so it doesn't matter where on
  // the blank canvas the child drew or how big - only whether the *shape*
  // lines up with the target digit's shape, via Intersection-over-Union.
  // ---------------------------------------------------------------------
  function findInkBBox(data, width, height) {
    let minX = width, minY = height, maxX = -1, maxY = -1;
    for (let y = 0; y < height; y += 2) {
      const rowBase = y * width;
      for (let x = 0; x < width; x += 2) {
        if (data[(rowBase + x) * 4 + 3] > 10) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    return maxX < 0 ? null : { minX, minY, maxX, maxY };
  }

  const SHAPE_GRID_W = 40;
  const SHAPE_GRID_H = 56;

  function buildCanonicalGrid(data, width, height, bbox) {
    const grid = new Uint8Array(SHAPE_GRID_W * SHAPE_GRID_H);
    const bboxW = Math.max(1, bbox.maxX - bbox.minX);
    const bboxH = Math.max(1, bbox.maxY - bbox.minY);
    const scale = Math.min(SHAPE_GRID_W / bboxW, SHAPE_GRID_H / bboxH) * 0.9;
    const offX = (SHAPE_GRID_W - bboxW * scale) / 2;
    const offY = (SHAPE_GRID_H - bboxH * scale) / 2;
    for (let gy = 0; gy < SHAPE_GRID_H; gy++) {
      for (let gx = 0; gx < SHAPE_GRID_W; gx++) {
        const srcX = Math.round(bbox.minX + (gx - offX) / scale);
        const srcY = Math.round(bbox.minY + (gy - offY) / scale);
        if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
          grid[gy * SHAPE_GRID_W + gx] = data[(srcY * width + srcX) * 4 + 3] > 10 ? 1 : 0;
        }
      }
    }
    return grid;
  }

  function gridIoU(a, b) {
    let inter = 0, union = 0;
    for (let i = 0; i < a.length; i++) {
      if (a[i] || b[i]) union++;
      if (a[i] && b[i]) inter++;
    }
    return union > 0 ? inter / union : 0;
  }

  // Renders one reference silhouette into altMaskCtx: every character uses
  // its plain DIGIT_STROKES form except altCharIndex, which (if that digit
  // has a recognition variant) uses the alternate form instead.
  function renderAltReference(lay, altCharIndex) {
    altMaskCtx.clearRect(0, 0, altMaskCanvas.width, altMaskCanvas.height);
    altMaskCtx.lineCap = 'round';
    altMaskCtx.lineJoin = 'round';
    altMaskCtx.setLineDash([]);
    altMaskCtx.strokeStyle = '#000';
    altMaskCtx.lineWidth = lay.charW * 0.26;
    for (let i = 0; i < lay.n; i++) {
      const ch = lay.text[i];
      const box = charBox(lay, i);
      const useAlt = i === altCharIndex && DIGIT_RECOGNITION_ALTS[ch];
      const strokesForCh = useAlt ? DIGIT_RECOGNITION_ALTS[ch] : DIGIT_STROKES[ch];
      if (!strokesForCh) continue;
      for (const stroke of strokesForCh) {
        altMaskCtx.beginPath();
        tracePathOnCtx(altMaskCtx, stroke, box);
        altMaskCtx.stroke();
      }
    }
  }

  // Returns the best IoU score in [0,1] across the digit's plain form and
  // any known handwriting variants (see DIGIT_RECOGNITION_ALTS), or 0 if
  // there's nothing to compare.
  function computeShapeMatchScore() {
    const w = inkCanvas.width, h = inkCanvas.height;
    const inkData = inkCtx.getImageData(0, 0, w, h).data;
    const inkBBox = findInkBBox(inkData, w, h);
    if (!inkBBox) return 0;
    const inkGrid = buildCanonicalGrid(inkData, w, h, inkBBox);

    const lay = currentGlyphInfo;
    const altCandidates = [null];
    for (let i = 0; i < lay.n; i++) {
      if (DIGIT_RECOGNITION_ALTS[lay.text[i]]) altCandidates.push(i);
    }

    let best = 0;
    for (const altIndex of altCandidates) {
      let refData;
      if (altIndex === null) {
        refData = maskCtx.getImageData(0, 0, w, h).data;
      } else {
        renderAltReference(lay, altIndex);
        refData = altMaskCtx.getImageData(0, 0, w, h).data;
      }
      const refBBox = findInkBBox(refData, w, h);
      if (!refBBox) continue;
      const refGrid = buildCanonicalGrid(refData, w, h, refBBox);
      const score = gridIoU(inkGrid, refGrid);
      if (score > best) best = score;
    }
    return best;
  }

  const SHAPE_MATCH_THRESHOLD = 0.22;

  inkCanvas.addEventListener('pointerdown', (e) => {
    if (activePointerId !== null) return;
    activePointerId = e.pointerId;
    inkCanvas.setPointerCapture(e.pointerId);
    const p = getPos(e);
    strokes.push({ color: currentColor, points: [p] });
    drawDot(p, currentColor);
    e.preventDefault();
  });

  inkCanvas.addEventListener('pointermove', (e) => {
    if (e.pointerId !== activePointerId) return;
    const currentStroke = strokes[strokes.length - 1];
    let events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : null;
    if (!events || events.length === 0) events = [e];
    for (const ev of events) {
      const p = getPos(ev);
      const prev = currentStroke.points[currentStroke.points.length - 1];
      currentStroke.points.push(p);
      drawSegment(prev, p, currentStroke.color);
    }
    e.preventDefault();
  });

  function endStroke(e) {
    if (e.pointerId !== activePointerId) return;
    activePointerId = null;
    checkMidAnnounce();
  }

  // Reads the number a second time once the child is partway through
  // drawing it (checked after each stroke, so it fires once per round).
  function checkMidAnnounce() {
    if (midAnnounced) return;
    const mode = currentStageGuideMode();
    let progressed;
    if (mode === 'none') {
      const totalPoints = strokes.reduce((a, s) => a + s.points.length, 0);
      progressed = totalPoints >= 4;
    } else {
      const inkCount = computeMaskedInkCount();
      progressed = maskOpaqueCount > 0 && inkCount / maskOpaqueCount >= 0.12;
    }
    if (progressed) {
      midAnnounced = true;
      speakNumber(currentNumber);
    }
  }
  inkCanvas.addEventListener('pointerup', endStroke);
  inkCanvas.addEventListener('pointercancel', endStroke);

  document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
  document.addEventListener('gesturestart', (e) => e.preventDefault());

  // ---------------------------------------------------------------------
  // Rounds / stages
  // ---------------------------------------------------------------------
  function renderObjects(n) {
    objectGrid.innerHTML = '';
    const emoji = OBJECT_EMOJIS[Math.floor(Math.random() * OBJECT_EMOJIS.length)];
    const fontSize = '4.8rem';
    for (let i = 0; i < n; i++) {
      const span = document.createElement('span');
      span.textContent = emoji;
      span.style.fontSize = fontSize;
      span.style.animationDelay = (i * 0.04) + 's';
      objectGrid.appendChild(span);
    }
  }

  function updateStageDots() {
    stageDotsEl.innerHTML = '';
    STAGES.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dot-btn';
      btn.title = s.label;
      btn.setAttribute('aria-label', s.label);
      const dot = document.createElement('span');
      dot.className = 'dot' + (i < stageIndex ? ' done' : '') + (i === stageIndex ? ' active' : '');
      dot.textContent = String(i + 1);
      btn.appendChild(dot);
      btn.addEventListener('click', () => selectStage(i));
      stageDotsEl.appendChild(btn);
    });
  }

  function dismissOverlays() {
    allClearOverlay.classList.add('hidden');
    stageClearOverlay.classList.add('hidden');
    resultOverlay.classList.add('hidden');
    resultBar.classList.add('hidden');
    actionButtons.classList.remove('hidden');
  }

  // Lets a stage be picked directly from the header dots instead of only
  // being reachable by finishing the previous one. Jumping to a stage
  // (including the current one) always starts it fresh.
  function selectStage(index) {
    stageIndex = index;
    dismissOverlays();
    startStage();
  }

  function loadRound() {
    strokes = [];
    activePointerId = null;
    midAnnounced = false;
    currentGlyphInfo = drawMask(currentNumber);
    drawGuide(currentNumber, currentStageGuideMode(), currentGlyphInfo);
    applyInkMask(currentStageGuideMode());
    clearInk();
    renderObjects(currentNumber);
    progressLabel.textContent = `${queuePos + 1} / ${numberQueue.length}`;
    speakNumber(currentNumber);
  }

  function startStage() {
    numberQueue = buildQueue(STAGES[stageIndex]);
    queuePos = 0;
    currentNumber = numberQueue[0];
    updateStageDots();
    loadRound();
  }

  function advance() {
    queuePos++;
    if (queuePos >= numberQueue.length) {
      if (stageIndex >= STAGES.length - 1) {
        showAllClear();
      } else {
        showStageClear();
      }
    } else {
      currentNumber = numberQueue[queuePos];
      loadRound();
    }
  }

  function resetAll() {
    stageIndex = 0;
    dismissOverlays();
    startStage();
  }

  // ---------------------------------------------------------------------
  // Completion / praise
  // ---------------------------------------------------------------------
  function showHint(msg, spokenText) {
    hintToast.textContent = msg;
    hintToast.classList.remove('hidden');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => hintToast.classList.add('hidden'), 1600);
    speakHint(spokenText || msg);
  }

  // Reads a hint message aloud (stripping emoji, which some voices would
  // otherwise try to narrate), interrupting anything currently speaking.
  function speakHint(text) {
    try {
      if (!('speechSynthesis' in window)) return;
      const spoken = text.replace(/[\u{1F1E6}-\u{1FAFF}\u{2600}-\u{27BF}️]/gu, '').trim();
      if (!spoken) return;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(makeUtterance(spoken));
    } catch (e) { /* speech synthesis is a nice-to-have; ignore failures */ }
  }

  // ---------------------------------------------------------------------
  // Custom voice recordings (settings screen) - a parent/grandparent can
  // record their own voice for each number 1-10 and one praise comment,
  // stored in IndexedDB (this is a static site with no backend, so
  // recordings live only in this browser/device). Wherever the app would
  // normally speak via TTS, it uses a matching recording instead if one
  // exists.
  // ---------------------------------------------------------------------
  const RECORDING_DB_NAME = 'writenumber-voices';
  const RECORDING_STORE = 'recordings';
  let recordingDB = null;
  const recordingURLs = {}; // id -> object URL, kept in sync with IndexedDB

  function openRecordingDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) { reject(new Error('no indexedDB')); return; }
      const req = indexedDB.open(RECORDING_DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(RECORDING_STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function dbGetAllRecordings() {
    return new Promise((resolve, reject) => {
      const tx = recordingDB.transaction(RECORDING_STORE, 'readonly');
      const store = tx.objectStore(RECORDING_STORE);
      const out = {};
      const req = store.openCursor();
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) { out[cursor.key] = cursor.value; cursor.continue(); } else resolve(out);
      };
      req.onerror = () => reject(req.error);
    });
  }

  function dbPutRecording(id, blob) {
    return new Promise((resolve, reject) => {
      const tx = recordingDB.transaction(RECORDING_STORE, 'readwrite');
      tx.objectStore(RECORDING_STORE).put(blob, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  function dbDeleteRecording(id) {
    return new Promise((resolve, reject) => {
      const tx = recordingDB.transaction(RECORDING_STORE, 'readwrite');
      tx.objectStore(RECORDING_STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function initRecordings() {
    try {
      recordingDB = await openRecordingDB();
      const all = await dbGetAllRecordings();
      for (const id of Object.keys(all)) recordingURLs[id] = URL.createObjectURL(all[id]);
    } catch (e) { /* IndexedDB unavailable - app still works, just without custom voices */ }
  }

  // Whether to use a recorded voice vs. always fall back to TTS ("기계음"),
  // kept separate from whether a recording exists so a saved recording can
  // be switched off without deleting it. Persisted in localStorage since
  // it's just a handful of small flags.
  const VOICE_ENABLED_KEY = 'writenumber-voice-enabled';
  let voiceEnabled = {};
  try { voiceEnabled = JSON.parse(localStorage.getItem(VOICE_ENABLED_KEY) || '{}'); } catch (e) { voiceEnabled = {}; }

  function saveVoiceEnabled() {
    try { localStorage.setItem(VOICE_ENABLED_KEY, JSON.stringify(voiceEnabled)); } catch (e) { /* ignore */ }
  }

  function isUsingCustomVoice(id) {
    return !!recordingURLs[id] && voiceEnabled[id] !== false;
  }

  // Plays a recorded clip and resolves once it finishes (or fails),
  // so callers can chain a fallback or a second clip afterwards.
  function playRecording(id) {
    return new Promise((resolve) => {
      const url = recordingURLs[id];
      if (!url) { resolve(false); return; }
      const audio = new Audio(url);
      audio.addEventListener('ended', () => resolve(true));
      audio.addEventListener('error', () => resolve(false));
      audio.play().then(undefined, () => resolve(false));
    });
  }

  function makeUtterance(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    u.rate = 1.0;
    return u;
  }

  function speakTTS(text) {
    try {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.speak(makeUtterance(text));
    } catch (e) { /* speech synthesis is a nice-to-have; ignore failures */ }
  }

  // Reads just the number - a recorded voice if one exists for it,
  // otherwise TTS - interrupting anything currently being spoken. Used
  // when a round is presented and once more partway through drawing.
  function speakNumber(number) {
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    const id = `num-${number}`;
    if (isUsingCustomVoice(id)) { playRecording(id); return; }
    speakTTS(String(number));
  }

  // Reads the number once more, then the praise comment - a recording for
  // either part if one exists and is enabled, otherwise TTS - back-to-back
  // rather than overlapping.
  async function announcePraise(number) {
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    const numId = `num-${number}`;
    if (isUsingCustomVoice(numId)) await playRecording(numId);
    else speakTTS(String(number));
    if (isUsingCustomVoice('comment')) await playRecording('comment');
    else speakTTS('잘했어요');
  }

  function burstConfetti() {
    const emojis = ['⭐', '🎉', '✨', '🌟'];
    for (let i = 0; i < 12; i++) {
      const span = document.createElement('span');
      span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      Object.assign(span.style, {
        position: 'absolute',
        left: (Math.random() * 90 + 5) + '%',
        top: '42%',
        fontSize: (18 + Math.random() * 22) + 'px',
        pointerEvents: 'none',
        transition: 'transform 1s ease-out, opacity 1s ease-out',
        zIndex: 20
      });
      resultOverlay.appendChild(span);
      requestAnimationFrame(() => {
        span.style.transform = `translateY(${-80 - Math.random() * 120}px) rotate(${Math.random() * 360}deg)`;
        span.style.opacity = '0';
      });
      setTimeout(() => span.remove(), 1100);
    }
  }

  function showResult() {
    // Reuse the exact layout the outline/mask were drawn with, so the
    // "corrected" reveal lines up with them exactly, just filled in.
    const rctx = setupHiDPICanvas(resultCanvas, cssW, cssH);
    rctx.lineCap = 'round';
    rctx.lineJoin = 'round';
    rctx.setLineDash([]);
    rctx.strokeStyle = currentColor;
    rctx.lineWidth = currentGlyphInfo.charW * 0.26;
    strokeAllDigits(rctx, currentGlyphInfo);

    resultOverlay.classList.remove('hidden');
    actionButtons.classList.add('hidden');
    resultBar.classList.remove('hidden');
    burstConfetti();
    announcePraise(currentNumber);
  }

  function retryWithGuide(msg, spokenText) {
    showHint(msg, spokenText);
    strokes = [];
    activePointerId = null;
    clearInk();
    // The first attempt on this stage is guide-free by design, but once
    // it's been missed, show a helper guide for the retry instead of
    // leaving them stuck with no hint at all.
    drawGuide(currentNumber, 'thin', currentGlyphInfo);
  }

  function checkCompletion() {
    const mode = currentStageGuideMode();
    if (mode === 'none') {
      const totalPoints = strokes.reduce((a, s) => a + s.points.length, 0);
      if (totalPoints < 8) {
        retryWithGuide('숫자를 크게 써볼까요? ✏️');
        return;
      }
      const score = computeShapeMatchScore();
      if (score < SHAPE_MATCH_THRESHOLD) {
        retryWithGuide(`${currentNumber}(이)가 아닌 것 같아요. 지우고 다시 써볼까요? ✏️`, `${currentNumber} 모양이 아닌 것 같아요. 지우고 다시 써볼까요?`);
        return;
      }
      showResult();
      return;
    }
    const inkCount = computeMaskedInkCount();
    const coverage = maskOpaqueCount > 0 ? inkCount / maskOpaqueCount : 0;
    if (coverage < 0.22) { showHint('테두리 안쪽을 조금 더 칠해볼까요? 🎨'); return; }
    showResult();
  }

  function showStageClear() {
    stageClearTitle.textContent = STAGES[stageIndex].label + ' 완료! 🎉';
    stageClearOverlay.classList.remove('hidden');
  }

  function showAllClear() {
    allClearOverlay.classList.remove('hidden');
  }

  // ---------------------------------------------------------------------
  // Color picker
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  // Settings panel - recording UI
  // ---------------------------------------------------------------------
  let activeRecorder = null;
  let activeStream = null;

  function pickRecorderMimeType() {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return undefined;
    const candidates = ['audio/mp4', 'audio/webm', 'audio/aac'];
    for (const c of candidates) if (MediaRecorder.isTypeSupported(c)) return c;
    return undefined;
  }

  let stopRequested = false;

  function startRecording(id, onDone, onError) {
    if (activeRecorder) return;
    stopRequested = false;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { onError(); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      if (stopRequested) { stream.getTracks().forEach((t) => t.stop()); onError(); return; }
      activeStream = stream;
      const mimeType = pickRecorderMimeType();
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks = [];
      rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = async () => {
        const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        activeStream = null;
        activeRecorder = null;
        if (recordingURLs[id]) URL.revokeObjectURL(recordingURLs[id]);
        recordingURLs[id] = URL.createObjectURL(blob);
        try { if (recordingDB) await dbPutRecording(id, blob); } catch (e) { /* stays usable in-memory this session */ }
        onDone();
      };
      rec.start();
      activeRecorder = rec;
      if (stopRequested) rec.stop();
    }).catch(() => onError());
  }

  function stopRecording() {
    stopRequested = true;
    if (activeRecorder && activeRecorder.state !== 'inactive') activeRecorder.stop();
    else if (activeStream) { activeStream.getTracks().forEach((t) => t.stop()); activeStream = null; }
  }

  function buildRecordingRow(id, label) {
    const row = document.createElement('div');
    row.className = 'recording-row';

    const labelEl = document.createElement('span');
    labelEl.className = 'recording-label';
    labelEl.textContent = label;

    const statusEl = document.createElement('span');
    statusEl.className = 'recording-status';

    const recordBtn = document.createElement('button');
    recordBtn.className = 'rec-btn rec-record-btn';
    recordBtn.textContent = '🎙️ 누르고 녹음';

    const playBtn = document.createElement('button');
    playBtn.className = 'rec-btn rec-play-btn';
    playBtn.textContent = '▶️ 재생';

    const voiceToggleBtn = document.createElement('button');
    voiceToggleBtn.className = 'rec-btn rec-voice-toggle-btn';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'rec-btn rec-delete-btn';
    deleteBtn.textContent = '🗑️ 삭제';

    function refresh() {
      const has = !!recordingURLs[id];
      const usingCustom = isUsingCustomVoice(id);
      if (!has) {
        statusEl.textContent = '녹음 없음';
        statusEl.className = 'recording-status';
      } else if (usingCustom) {
        statusEl.textContent = '내 목소리 사용 중';
        statusEl.className = 'recording-status using-custom';
      } else {
        statusEl.textContent = '기계음 사용 중';
        statusEl.className = 'recording-status using-machine';
      }
      playBtn.disabled = !has;
      deleteBtn.disabled = !has;
      voiceToggleBtn.disabled = !has;
      voiceToggleBtn.textContent = usingCustom ? '🤖 기계음으로' : '🎙️ 내 목소리로';
    }

    // Record only while the button is held down (push-to-talk style)
    // rather than tap-to-start/tap-to-stop.
    let pressActive = false;
    function beginPress(e) {
      if (pressActive) return;
      pressActive = true;
      e.preventDefault();
      recordBtn.classList.add('recording');
      recordBtn.textContent = '🔴 녹음 중...';
      startRecording(
        id,
        () => {
          recordBtn.classList.remove('recording');
          recordBtn.textContent = '🎙️ 누르고 녹음';
          voiceEnabled[id] = true;
          saveVoiceEnabled();
          refresh();
        },
        () => {
          recordBtn.classList.remove('recording');
          recordBtn.textContent = '🎙️ 누르고 녹음';
          statusEl.textContent = '마이크 권한이 필요해요';
        }
      );
    }
    function endPress() {
      if (!pressActive) return;
      pressActive = false;
      stopRecording();
    }
    recordBtn.addEventListener('pointerdown', beginPress);
    recordBtn.addEventListener('pointerup', endPress);
    recordBtn.addEventListener('pointercancel', endPress);
    recordBtn.addEventListener('pointerleave', endPress);

    playBtn.addEventListener('click', () => { if (recordingURLs[id]) playRecording(id); });

    voiceToggleBtn.addEventListener('click', () => {
      if (!recordingURLs[id]) return;
      voiceEnabled[id] = !isUsingCustomVoice(id);
      saveVoiceEnabled();
      refresh();
    });

    deleteBtn.addEventListener('click', async () => {
      if (recordingURLs[id]) URL.revokeObjectURL(recordingURLs[id]);
      delete recordingURLs[id];
      delete voiceEnabled[id];
      saveVoiceEnabled();
      try { if (recordingDB) await dbDeleteRecording(id); } catch (e) { /* ignore */ }
      refresh();
    });

    row.appendChild(labelEl);
    row.appendChild(statusEl);
    row.appendChild(recordBtn);
    row.appendChild(playBtn);
    row.appendChild(voiceToggleBtn);
    row.appendChild(deleteBtn);
    refresh();
    return row;
  }

  function buildSettingsPanel() {
    recordingListEl.innerHTML = '';
    for (let i = 1; i <= 10; i++) recordingListEl.appendChild(buildRecordingRow(`num-${i}`, String(i)));
    recordingListEl.appendChild(buildRecordingRow('comment', '칭찬 코멘트'));
  }

  function buildColorPicker() {
    COLORS.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'color-swatch' + (i === 0 ? ' selected' : '');
      b.style.background = c;
      b.setAttribute('aria-label', '색상 선택');
      b.addEventListener('click', () => {
        currentColor = c;
        colorPickerEl.querySelectorAll('.color-swatch').forEach((el) => el.classList.remove('selected'));
        b.classList.add('selected');
      });
      colorPickerEl.appendChild(b);
    });
  }

  // ---------------------------------------------------------------------
  // Wiring
  // ---------------------------------------------------------------------
  clearBtn.addEventListener('click', () => { strokes = []; activePointerId = null; clearInk(); });
  doneBtn.addEventListener('click', checkCompletion);
  nextBtn.addEventListener('click', () => {
    resultOverlay.classList.add('hidden');
    resultBar.classList.add('hidden');
    actionButtons.classList.remove('hidden');
    advance();
  });
  stageNextBtn.addEventListener('click', () => { stageClearOverlay.classList.add('hidden'); stageIndex++; startStage(); });
  restartBtn2.addEventListener('click', resetAll);
  restartBtn.addEventListener('click', resetAll);
  settingsBtn.addEventListener('click', () => settingsOverlay.classList.remove('hidden'));
  settingsCloseBtn.addEventListener('click', () => {
    stopRecording();
    settingsOverlay.classList.add('hidden');
  });
  window.addEventListener('resize', debounce(layout, 200));
  // iOS can report stale viewport dimensions right as orientationchange
  // fires, before layout settles - re-measure a moment later too.
  window.addEventListener('orientationchange', () => setTimeout(layout, 300));

  async function init() {
    buildColorPicker();
    updateStageDots();
    await initRecordings();
    buildSettingsPanel();
    layout();
    startStage();
  }

  init();
})();
