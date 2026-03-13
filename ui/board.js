// Board renderer — draws Cell[][] onto a canvas using the arcade theme

const BOARD_COLORS = {
  empty:       '#0D001A',
  gridLine:    '#330066',
  P1:          '#A78BFA',
  P2:          '#FF006E',
  glowP1:      'rgba(167, 139, 250, 0.6)',
  glowP2:      'rgba(255, 0, 110, 0.6)',
}

/**
 * Render a full board onto a canvas element.
 * @param {HTMLCanvasElement} canvas
 * @param {Array} board - Cell[][] (2D array of cell objects)
 * @param {object} opts - { showGlow: true, cellGap: 2 }
 */
function renderBoard(canvas, board, opts = {}) {
  const { showGlow = true, cellGap = 2 } = opts
  const ctx = canvas.getContext('2d')
  const size = board.length
  const w = canvas.width
  const h = canvas.height
  const cellW = (w - cellGap * (size + 1)) / size
  const cellH = (h - cellGap * (size + 1)) / size

  // Background
  ctx.fillStyle = BOARD_COLORS.empty
  ctx.fillRect(0, 0, w, h)

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = board[r][c]
      const x = cellGap + c * (cellW + cellGap)
      const y = cellGap + r * (cellH + cellGap)

      if (!cell.alive) {
        // Empty cell — subtle dark rect
        ctx.fillStyle = '#110025'
        ctx.fillRect(x, y, cellW, cellH)
        continue
      }

      const color = cell.player === 0 ? BOARD_COLORS.P1 : BOARD_COLORS.P2
      const glowColor = cell.player === 0 ? BOARD_COLORS.glowP1 : BOARD_COLORS.glowP2

      // Glow effect
      if (showGlow) {
        ctx.shadowColor = glowColor
        ctx.shadowBlur = 8
      }

      ctx.fillStyle = color
      ctx.fillRect(x, y, cellW, cellH)
      ctx.shadowBlur = 0

      // Superpower inset indicator
      const spColor = SUPERPOWER_COLORS[cell.superpowerType]
      if (spColor && cell.superpowerType !== 0) {
        const margin = Math.max(2, cellW * 0.2)
        const iw = cellW - margin * 2
        const ih = cellH - margin * 2
        ctx.fillStyle = spColor
        ctx.shadowColor = spColor
        ctx.shadowBlur = showGlow ? 4 : 0
        ctx.fillRect(x + margin, y + margin, iw, ih)
        ctx.shadowBlur = 0
      }
    }
  }
}

/**
 * Animate through simulation frames at the given speed.
 * Calls onFrame(board, generation) each frame.
 * Returns a cancel function.
 */
function animateSimulation(frames, msPerFrame, onFrame, onComplete) {
  let frameIdx = 0
  let cancelled = false

  function tick() {
    if (cancelled || frameIdx >= frames.length) {
      if (!cancelled && onComplete) onComplete()
      return
    }
    onFrame(frames[frameIdx], frameIdx)
    frameIdx++
    setTimeout(tick, msPerFrame)
  }

  tick()
  return () => { cancelled = true }
}
