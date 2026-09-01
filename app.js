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
      { cmd: 'Q', cx: 92, cy: 6, x: 92, y: 70 },
      { cmd: 'Q', cx: 92, cy: 134, x: 50, y: 134 },
      { cmd: 'Q', cx: 8, cy: 134, x: 8, y: 70 },
      { cmd: 'Q', cx: 8, cy: 6, x: 50, y: 6 }
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
      { cmd: 'Q', cx: 80, cy: 68, x: 80, y: 102 },
      { cmd: 'Q', cx: 80, cy: 134, x: 50, y: 134 },
      { cmd: 'Q', cx: 20, cy: 134, x: 20, y: 102 },
      { cmd: 'Q', cx: 20, cy: 68, x: 50, y: 68 }
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
  let renderScheduled = false;
  let cssW = 0, cssH = 0;
  let currentGlyphInfo = null;
  let guideCtx = null, inkCtx = null;
  let maskCanvas = null, maskCtx = null, maskOpaqueCount = 0;
  let hintTimer = null;

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

  function scheduleRender() {
    if (renderScheduled) return;
    renderScheduled = true;
    requestAnimationFrame(() => { renderScheduled = false; renderInk(); });
  }

  function renderInk() {
    inkCtx.clearRect(0, 0, cssW, cssH);
    inkCtx.lineJoin = 'round';
    inkCtx.lineCap = 'round';
    const baseWidth = Math.max(14, cssW * 0.035);
    for (const s of strokes) {
      if (!s.points.length) continue;
      inkCtx.strokeStyle = s.color;
      inkCtx.fillStyle = s.color;
      if (s.points.length === 1) {
        const p = s.points[0];
        inkCtx.beginPath();
        inkCtx.arc(p.x, p.y, baseWidth / 2, 0, Math.PI * 2);
        inkCtx.fill();
        continue;
      }
      inkCtx.lineWidth = baseWidth;
      inkCtx.beginPath();
      inkCtx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) inkCtx.lineTo(s.points[i].x, s.points[i].y);
      inkCtx.stroke();
    }
    if (currentStageGuideMode() !== 'none' && maskCanvas) {
      inkCtx.globalCompositeOperation = 'destination-in';
      inkCtx.drawImage(maskCanvas, 0, 0, maskCanvas.width, maskCanvas.height, 0, 0, cssW, cssH);
      inkCtx.globalCompositeOperation = 'source-over';
    }
  }

  inkCanvas.addEventListener('pointerdown', (e) => {
    if (activePointerId !== null) return;
    activePointerId = e.pointerId;
    inkCanvas.setPointerCapture(e.pointerId);
    strokes.push({ color: currentColor, points: [getPos(e)] });
    scheduleRender();
    e.preventDefault();
  });

  inkCanvas.addEventListener('pointermove', (e) => {
    if (e.pointerId !== activePointerId) return;
    strokes[strokes.length - 1].points.push(getPos(e));
    scheduleRender();
    e.preventDefault();
  });

  function endStroke(e) {
    if (e.pointerId !== activePointerId) return;
    activePointerId = null;
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
      const d = document.createElement('div');
      d.className = 'dot' + (i < stageIndex ? ' done' : '') + (i === stageIndex ? ' active' : '');
      stageDotsEl.appendChild(d);
    });
  }

  function loadRound() {
    strokes = [];
    activePointerId = null;
    currentGlyphInfo = drawMask(currentNumber);
    drawGuide(currentNumber, currentStageGuideMode(), currentGlyphInfo);
    renderInk();
    renderObjects(currentNumber);
    progressLabel.textContent = `${queuePos + 1} / ${numberQueue.length}`;
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
    allClearOverlay.classList.add('hidden');
    stageClearOverlay.classList.add('hidden');
    resultOverlay.classList.add('hidden');
    resultBar.classList.add('hidden');
    actionButtons.classList.remove('hidden');
    startStage();
  }

  // ---------------------------------------------------------------------
  // Completion / praise
  // ---------------------------------------------------------------------
  function showHint(msg) {
    hintToast.textContent = msg;
    hintToast.classList.remove('hidden');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => hintToast.classList.add('hidden'), 1600);
  }

  function speakPraise() {
    try {
      if (!('speechSynthesis' in window)) return;
      const u = new SpeechSynthesisUtterance('잘했어요');
      u.lang = 'ko-KR';
      u.rate = 1.0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (e) { /* speech synthesis is a nice-to-have; ignore failures */ }
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
    speakPraise();
  }

  function checkCompletion() {
    const mode = currentStageGuideMode();
    if (mode === 'none') {
      const totalPoints = strokes.reduce((a, s) => a + s.points.length, 0);
      if (totalPoints < 8) { showHint('숫자를 크게 써볼까요? ✏️'); return; }
      showResult();
      return;
    }
    const inkCount = sampleAlphaCount(inkCtx, inkCanvas);
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
  clearBtn.addEventListener('click', () => { strokes = []; activePointerId = null; renderInk(); });
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
  window.addEventListener('resize', debounce(layout, 200));

  function init() {
    buildColorPicker();
    updateStageDots();
    layout();
    startStage();
  }

  init();
})();
