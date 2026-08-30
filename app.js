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

  // Per-digit stroke-direction arrow hints. Coordinates are fractions
  // (0..1) of that character's own glyph box: x -> left..right, y -> top..bottom.
  // Each segment is drawn as an arrow; {cx,cy} makes it a curve.
  const ARROW_SPECS = {
    '0': [
      { x1: 0.5, y1: 0.08, x2: 0.85, y2: 0.5, cx: 0.98, cy: 0.2 },
      { x1: 0.85, y1: 0.5, x2: 0.5, y2: 0.92, cx: 0.98, cy: 0.8 }
    ],
    '1': [
      { x1: 0.5, y1: 0.15, x2: 0.5, y2: 0.85 }
    ],
    '2': [
      { x1: 0.15, y1: 0.28, x2: 0.85, y2: 0.32, cx: 0.5, cy: 0.02 },
      { x1: 0.85, y1: 0.32, x2: 0.15, y2: 0.85, cx: 0.6, cy: 0.55 },
      { x1: 0.15, y1: 0.85, x2: 0.9, y2: 0.88 }
    ],
    '3': [
      { x1: 0.2, y1: 0.15, x2: 0.5, y2: 0.48, cx: 0.95, cy: 0.15 },
      { x1: 0.5, y1: 0.48, x2: 0.2, y2: 0.85, cx: 0.95, cy: 0.85 }
    ],
    '4': [
      { x1: 0.25, y1: 0.1, x2: 0.1, y2: 0.62 },
      { x1: 0.1, y1: 0.62, x2: 0.88, y2: 0.62 },
      { x1: 0.72, y1: 0.08, x2: 0.72, y2: 0.92 }
    ],
    '5': [
      { x1: 0.25, y1: 0.12, x2: 0.75, y2: 0.12 },
      { x1: 0.25, y1: 0.12, x2: 0.25, y2: 0.45 },
      { x1: 0.25, y1: 0.45, x2: 0.3, y2: 0.88, cx: 0.95, cy: 0.72 }
    ],
    '6': [
      { x1: 0.72, y1: 0.1, x2: 0.2, y2: 0.58, cx: 0.1, cy: 0.15 },
      { x1: 0.2, y1: 0.58, x2: 0.65, y2: 0.85, cx: 0.1, cy: 0.95 },
      { x1: 0.65, y1: 0.85, x2: 0.25, y2: 0.63, cx: 0.8, cy: 0.68 }
    ],
    '7': [
      { x1: 0.15, y1: 0.13, x2: 0.85, y2: 0.13 },
      { x1: 0.85, y1: 0.13, x2: 0.3, y2: 0.9 }
    ],
    '8': [
      { x1: 0.5, y1: 0.48, x2: 0.72, y2: 0.15, cx: 0.85, cy: 0.1 },
      { x1: 0.72, y1: 0.15, x2: 0.5, y2: 0.48, cx: 0.3, cy: 0.1 },
      { x1: 0.5, y1: 0.48, x2: 0.72, y2: 0.85, cx: 0.9, cy: 0.55 },
      { x1: 0.72, y1: 0.85, x2: 0.5, y2: 0.48, cx: 0.35, cy: 0.95 }
    ],
    '9': [
      { x1: 0.65, y1: 0.4, x2: 0.35, y2: 0.15, cx: 0.25, cy: 0.08 },
      { x1: 0.35, y1: 0.15, x2: 0.65, y2: 0.38, cx: 0.78, cy: 0.1 },
      { x1: 0.6, y1: 0.4, x2: 0.55, y2: 0.9 }
    ]
  };

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

  function getFont(size) {
    return `900 ${Math.round(size)}px system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif`;
  }

  function setupHiDPICanvas(canvas, wCss, hCss) {
    canvas.width = Math.max(1, Math.round(wCss * dpr));
    canvas.height = Math.max(1, Math.round(hCss * dpr));
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  function measureGlyph(ctx, text, size) {
    ctx.font = getFont(size);
    const m = ctx.measureText(text);
    let ascent = m.actualBoundingBoxAscent;
    let descent = m.actualBoundingBoxDescent;
    if (!isFinite(ascent)) ascent = size * 0.72;
    if (!isFinite(descent)) descent = size * 0.02;
    return { width: m.width, ascent, descent, height: ascent + descent };
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
  // ---------------------------------------------------------------------
  // Digit "1" is drawn as a plain vertical bar (no top flag, no bottom foot)
  // instead of the font glyph, per the simplified shape requested.
  function drawOneBar(ctx, cursorX, top, height, advanceWidth, size, mode) {
    const barWidth = size * 0.2;
    const cx = cursorX + advanceWidth / 2;
    const topY = top + height * 0.03;
    const botY = top + height * 0.99;
    if (mode === 'fill') {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = barWidth;
      ctx.beginPath();
      ctx.moveTo(cx, topY);
      ctx.lineTo(cx, botY);
      ctx.stroke();
      ctx.restore();
    } else if (mode === 'stroke') {
      const half = barWidth / 2;
      ctx.beginPath();
      ctx.rect(cx - half, topY, barWidth, botY - topY);
      ctx.stroke();
    }
  }

  // Draws `text` character by character so digit "1" can use drawOneBar
  // while every other digit uses the normal font glyph. mode 'fill' uses
  // ctx.fillStyle/fillText, mode 'stroke' uses ctx.strokeStyle/strokeText
  // (dash pattern, line width etc. must already be set on ctx by the caller).
  function drawGlyphString(ctx, text, glyphX, glyphY, metrics, size, mode) {
    const top = glyphY - metrics.ascent;
    const height = metrics.height;
    let cursor = glyphX;
    for (const ch of text) {
      const w = ctx.measureText(ch).width;
      if (ch === '1') {
        drawOneBar(ctx, cursor, top, height, w, size, mode);
      } else if (mode === 'fill') {
        ctx.fillText(ch, cursor, glyphY);
      } else if (mode === 'stroke') {
        ctx.strokeText(ch, cursor, glyphY);
      }
      cursor += w;
    }
  }

  function drawMask(number) {
    const text = String(number);
    let size = cssH * 0.72;
    maskCtx.clearRect(0, 0, cssW, cssH);
    let m = measureGlyph(maskCtx, text, size);
    const maxWidth = cssW * 0.8;
    if (m.width > maxWidth) {
      size = size * (maxWidth / m.width);
      m = measureGlyph(maskCtx, text, size);
    }
    const x = cssW / 2 - m.width / 2;
    const y = cssH / 2 + m.height / 2 - m.descent;
    maskCtx.fillStyle = '#000';
    maskCtx.textBaseline = 'alphabetic';
    maskCtx.font = getFont(size);
    drawGlyphString(maskCtx, text, x, y, m, size, 'fill');
    maskOpaqueCount = sampleAlphaCount(maskCtx, maskCanvas);
    return { size, x, y, metrics: m };
  }

  function drawArrow(ctx, x1, y1, x2, y2, cx, cy, headSize) {
    ctx.save();
    ctx.strokeStyle = '#5b6fd8';
    ctx.fillStyle = '#5b6fd8';
    ctx.setLineDash([]);
    ctx.lineWidth = Math.max(2, headSize * 0.35);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    let angle;
    if (cx !== undefined) {
      ctx.quadraticCurveTo(cx, cy, x2, y2);
      angle = Math.atan2(y2 - cy, x2 - cx);
    } else {
      ctx.lineTo(x2, y2);
      angle = Math.atan2(y2 - y1, x2 - x1);
    }
    ctx.stroke();
    ctx.translate(x2, y2);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-headSize, headSize * 0.55);
    ctx.lineTo(-headSize, -headSize * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawArrowsForNumber(ctx, number, glyphX, glyphY, glyphInfo, size) {
    const text = String(number);
    const top = glyphY - glyphInfo.metrics.ascent;
    const boxH = glyphInfo.metrics.height;
    let cursorX = glyphX;
    for (const ch of text) {
      const w = ctx.measureText(ch).width;
      const spec = ARROW_SPECS[ch] || [];
      for (const seg of spec) {
        const x1 = cursorX + seg.x1 * w, y1 = top + seg.y1 * boxH;
        const x2 = cursorX + seg.x2 * w, y2 = top + seg.y2 * boxH;
        let cx, cy;
        if (seg.cx !== undefined) { cx = cursorX + seg.cx * w; cy = top + seg.cy * boxH; }
        drawArrow(ctx, x1, y1, x2, y2, cx, cy, Math.max(10, size * 0.045));
      }
      cursorX += w;
    }
  }

  function drawGuide(number, mode, glyphInfo) {
    guideCtx.clearRect(0, 0, cssW, cssH);
    if (mode === 'none') return;
    const text = String(number);
    const { size, x, y } = glyphInfo;
    guideCtx.font = getFont(size);
    guideCtx.textBaseline = 'alphabetic';
    guideCtx.lineJoin = 'round';
    guideCtx.lineCap = 'round';

    if (mode === 'thick') {
      guideCtx.fillStyle = 'rgba(79,109,245,0.10)';
      drawGlyphString(guideCtx, text, x, y, glyphInfo.metrics, size, 'fill');
      guideCtx.setLineDash([size * 0.05, size * 0.045]);
      guideCtx.lineWidth = Math.max(4, size * 0.02);
      guideCtx.strokeStyle = '#9aa8e8';
      drawGlyphString(guideCtx, text, x, y, glyphInfo.metrics, size, 'stroke');
    } else if (mode === 'thin') {
      guideCtx.setLineDash([size * 0.026, size * 0.05]);
      guideCtx.lineWidth = Math.max(2, size * 0.008);
      guideCtx.strokeStyle = '#b7c0e0';
      drawGlyphString(guideCtx, text, x, y, glyphInfo.metrics, size, 'stroke');
    }
    guideCtx.setLineDash([]);
    drawArrowsForNumber(guideCtx, number, x, y, glyphInfo, size);
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
    const glyphInfo = drawMask(currentNumber);
    drawGuide(currentNumber, currentStageGuideMode(), glyphInfo);
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
    const rw = cssW * 0.62, rh = cssH * 0.6;
    const rctx = setupHiDPICanvas(resultCanvas, rw, rh);
    const text = String(currentNumber);
    let size = rh * 0.75;
    let m = measureGlyph(rctx, text, size);
    const maxWidth = rw * 0.85;
    if (m.width > maxWidth) {
      size = size * (maxWidth / m.width);
      m = measureGlyph(rctx, text, size);
    }
    const x = rw / 2 - m.width / 2;
    const y = rh / 2 + m.height / 2 - m.descent;
    rctx.fillStyle = currentColor;
    rctx.textBaseline = 'alphabetic';
    rctx.font = getFont(size);
    drawGlyphString(rctx, text, x, y, m, size, 'fill');

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
