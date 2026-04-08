// ─── Retro 80s Broadcast Overlay System ──────────────────────────────────────
// Manages outer (outside phone) overlay elements triggered by SCENE_CONFIG.
//
// To use in config/scene.js overlays:
//   {
//     at: 'simulation_start',   // named moment or ms
//     position: 'outer',        // routes to this system instead of in-phone
//     style: 'starburst',       // 'bubble' | 'starburst' | 'ticker'
//     text: 'FIGHT!',
//     color: '#FFFF00',         // fill color for text / starburst bg
//     size: 'lg',               // 'sm'(12px) | 'md'(18px) | 'lg'(26px) | 'xl'(34px)
//     placement: 'left',        // 'left'|'right'|'top'|'center'|'bottom-left'|'bottom-right'
//     angle: -5,                // degrees tilt (default random ±6)
//     anim: 'wham',             // 'wham'|'slide-left'|'slide-right' (default 'wham')
//     duration: 2500,           // ms to display (0 = manual hide)
//   }
//
// Corner Conway gliders and drifting background cells are also initialised here.

;(function () {

  // ── Config ──────────────────────────────────────────────────────────────────

  const FONT_SIZES = { sm: '12px', md: '18px', lg: '26px', xl: '34px' }
  const COLORS = ['#FFFF00', '#00FFFF', '#FF006E', '#39FF14', '#FF6600', '#A78BFA']

  // Placement → CSS positioning for outer overlays (relative to viewport)
  const PLACEMENTS = {
    'left':         { left: '3%',  top: '50%', transform: 'translateY(-50%)' },
    'right':        { right: '3%', top: '50%', transform: 'translateY(-50%)' },
    'top':          { top: '18%',  left: '50%', transform: 'translateX(-50%)' },
    'center':       { top: '50%',  left: '50%', transform: 'translate(-50%,-50%)' },
    'bottom-left':  { bottom: '12%', left: '3%' },
    'bottom-right': { bottom: '12%', right: '3%' },
  }

  let stage = null
  let activeBubbles = {}     // name → DOM element
  let hideTimers    = {}     // name → timer id

  // ── Init ────────────────────────────────────────────────────────────────────

  function init() {
    stage = document.getElementById('retro-overlay-stage')
    if (!stage) return

    initCornerGliders()
    initDriftingCells()
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  // Called by gameplay.html's fireOverlayMoment() for outer overlays
  window.fireRetroOverlay = function (name) {
    if (!stage) return
    const cfg = window.SCENE_CONFIG
    if (!cfg || !cfg.overlays) return

    const entries = cfg.overlays.filter(o => o.at === name && o.position === 'outer')
    entries.forEach(entry => _fireEntry(name + '_' + Math.random(), entry))
  }

  // For absolute-ms outer overlays called directly from timeline
  window.fireRetroOverlayEntry = function (entry) {
    if (!stage) return
    _fireEntry('abs_' + entry.at, entry)
  }

  window.hideRetroOverlay = function (key) {
    _hideBubble(key)
  }

  // ── Entry dispatcher ─────────────────────────────────────────────────────────

  function _fireEntry(key, entry) {
    if (entry.text === null || entry.text === undefined) {
      _hideBubble(key)
      return
    }

    if (entry.style === 'ticker') {
      _showTicker(key, entry)
    } else {
      _showBubble(key, entry)
    }

    if (entry.duration > 0) {
      if (hideTimers[key]) clearTimeout(hideTimers[key])
      hideTimers[key] = setTimeout(() => _hideBubble(key), entry.duration)
    }
  }

  // ── Bubble / Starburst ───────────────────────────────────────────────────────

  function _showBubble(key, entry) {
    _hideBubble(key, true)   // instant remove previous with same key

    const color   = entry.color || COLORS[Math.floor(Math.random() * COLORS.length)]
    const size    = FONT_SIZES[entry.size || 'lg']
    const angle   = entry.angle !== undefined ? entry.angle : (Math.random() * 12 - 6).toFixed(1)
    const anim    = entry.anim  || 'wham'
    const where   = PLACEMENTS[entry.placement || 'left'] || PLACEMENTS['left']
    const isStarburst = entry.style === 'starburst'

    const wrap = document.createElement('div')
    wrap.className = `retro-bubble anim-${anim}`
    wrap.style.setProperty('--r', `${angle}deg`)
    wrap.dataset.key = key

    // Position
    Object.entries(where).forEach(([k, v]) => { wrap.style[k] = v })

    // Starburst background shape
    if (isStarburst) {
      const burst = document.createElement('div')
      burst.className = 'retro-starburst-bg'
      burst.style.background = color
      burst.style.opacity = '0.9'
      wrap.appendChild(burst)
    }

    // Text span
    const lines = (entry.text || '').split('\n')
    lines.forEach((line, i) => {
      const span = document.createElement('span')
      span.className = 'retro-bubble-text'
      span.textContent = line
      span.style.color = color
      span.style.fontSize = size
      span.style.display = 'block'
      if (!isStarburst && i === 0) {
        // Bubble style: add a thin bg box for readability
        span.style.background = 'rgba(0,0,0,0.55)'
        span.style.padding = '4px 10px'
        span.style.marginBottom = '2px'
      }
      wrap.appendChild(span)
    })

    stage.appendChild(wrap)
    activeBubbles[key] = wrap
  }

  function _hideBubble(key, instant) {
    if (hideTimers[key]) { clearTimeout(hideTimers[key]); delete hideTimers[key] }
    const el = activeBubbles[key]
    if (!el) return

    if (instant) {
      el.remove()
      delete activeBubbles[key]
      return
    }

    el.classList.remove('anim-wham', 'anim-slide-left', 'anim-slide-right')
    el.classList.add('anim-exit')
    el.addEventListener('animationend', () => {
      el.remove()
      delete activeBubbles[key]
    }, { once: true })
  }

  // ── Ticker tape ──────────────────────────────────────────────────────────────

  let activeTicker = null

  function _showTicker(key, entry) {
    if (activeTicker) { activeTicker.remove(); activeTicker = null }

    const bgColor   = entry.color || '#FFFF00'
    const textColor = _contrastColor(bgColor)

    const wrap = document.createElement('div')
    wrap.className = 'retro-ticker'
    wrap.style.background = bgColor
    wrap.style.borderTopColor = '#000'
    wrap.style.borderBottomColor = '#000'

    const inner = document.createElement('span')
    inner.className = 'retro-ticker-inner'
    inner.style.color = textColor
    // Repeat text so it tiles across the full scroll
    inner.textContent = ('★  ' + (entry.text || '') + '  ').repeat(6)

    wrap.appendChild(inner)
    stage.appendChild(wrap)
    activeTicker = wrap
    activeBubbles[key] = wrap
  }

  function _contrastColor(hex) {
    // Quick luminance check — return black or white
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? '#000000' : '#FFFFFF'
  }

  // ── Corner Conway gliders ─────────────────────────────────────────────────────

  const CELL_PX   = 7    // pixel size of each cell
  const GRID_SIZE = 14   // cells per side
  const CANVAS_PX = CELL_PX * GRID_SIZE

  // Classic glider (will travel across the grid)
  const GLIDER = [
    [0,1,0],
    [0,0,1],
    [1,1,1],
  ]

  // Lightweight spaceship (LWSS)
  const LWSS = [
    [0,1,1,0,0],
    [1,1,1,1,0],
    [1,1,0,1,1],
    [0,0,1,1,0],
  ]

  function _makeCornerGrid(pattern, offsetR, offsetC) {
    const g = Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(false))
    pattern.forEach((row, r) => {
      row.forEach((v, c) => {
        const gr = (r + offsetR + GRID_SIZE) % GRID_SIZE
        const gc = (c + offsetC + GRID_SIZE) % GRID_SIZE
        if (v) g[gr][gc] = true
      })
    })
    return g
  }

  function _stepGrid(g) {
    const next = Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(false))
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        let n = 0
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue
            const nr = (r + dr + GRID_SIZE) % GRID_SIZE
            const nc = (c + dc + GRID_SIZE) % GRID_SIZE
            if (g[nr][nc]) n++
          }
        }
        if (g[r][c]) next[r][c] = n === 2 || n === 3
        else         next[r][c] = n === 3
      }
    }
    return next
  }

  function _drawGrid(ctx, grid, color) {
    ctx.clearRect(0, 0, CANVAS_PX, CANVAS_PX)
    ctx.fillStyle = color
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c]) {
          ctx.fillRect(c * CELL_PX + 1, r * CELL_PX + 1, CELL_PX - 2, CELL_PX - 2)
        }
      }
    }
  }

  function _startCorner(className, color, pattern, offsetR, offsetC) {
    const canvas = document.createElement('canvas')
    canvas.className = `corner-canvas ${className}`
    canvas.width  = CANVAS_PX
    canvas.height = CANVAS_PX
    document.body.appendChild(canvas)

    const ctx = canvas.getContext('2d')
    let grid = _makeCornerGrid(pattern, offsetR, offsetC)

    setInterval(() => {
      grid = _stepGrid(grid)
      _drawGrid(ctx, grid, color)
    }, 260)

    _drawGrid(ctx, grid, color)
  }

  function initCornerGliders() {
    _startCorner('top-left',     '#A78BFA', GLIDER,  2, 2)
    _startCorner('top-right',    '#FF006E', GLIDER,  2, 8)
    _startCorner('bottom-left',  '#FF006E', LWSS,    6, 1)
    _startCorner('bottom-right', '#A78BFA', LWSS,    6, 7)
  }

  // ── Drifting background cells ────────────────────────────────────────────────

  function initDriftingCells() {
    const CELL_COUNT = 18
    const colors = ['#A78BFA', '#FF006E', '#FFFF00', '#00FFFF']
    const sizes  = [4, 6, 8, 5]

    for (let i = 0; i < CELL_COUNT; i++) {
      setTimeout(() => _spawnDriftCell(colors, sizes), i * 600)
    }
  }

  function _spawnDriftCell(colors, sizes) {
    const el   = document.createElement('div')
    el.className = 'bg-cell'

    const size  = sizes[Math.floor(Math.random() * sizes.length)]
    const color = colors[Math.floor(Math.random() * colors.length)]
    const left  = Math.random() * 100
    const dur   = 12 + Math.random() * 16
    const delay = Math.random() * -20

    el.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${left}vw; bottom: 0;
      background: ${color};
      opacity: 0;
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
    `

    document.body.appendChild(el)

    // Re-randomise position after each cycle
    el.addEventListener('animationiteration', () => {
      el.style.left = Math.random() * 100 + 'vw'
    })
  }

  // ── Bootstrap ───────────────────────────────────────────────────────────────
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

})()
