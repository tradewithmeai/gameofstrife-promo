// Conway simulation engine — ported from server/src/engine/gameOfStrifeEngine.ts
// Pure functions, no dependencies. Uses DEFAULT_SUPERPOWER_RULES from superpowers.js.

/**
 * Default game settings for the simulation.
 * Override any field when calling runSimulation().
 */
const DEFAULT_SETTINGS = {
  birthRules:    [3],
  survivalRules: [2, 3],
  enableToroidalBoard: true,
  baseBirthChance:    1,
  baseSurvivalChance: 1,
  superpowerRules: DEFAULT_SUPERPOWER_RULES,
}

/**
 * Create a fresh cell object.
 */
function makeCell(player = null, superpowerType = 0, lives = 1) {
  return { player, alive: player !== null, superpowerType, lives, memory: 0 }
}

/**
 * Deep-clone a board (Cell[][]).
 */
function cloneBoard(board) {
  return board.map(row => row.map(cell => ({ ...cell })))
}

/**
 * Count alive neighbours for cell at (row, col).
 * Supports toroidal (wrapping) boards.
 */
function countNeighbors(board, row, col, size, toroidal) {
  let count = 0
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      let r = row + dr
      let c = col + dc
      if (toroidal) {
        r = (r + size) % size
        c = (c + size) % size
      } else {
        if (r < 0 || r >= size || c < 0 || c >= size) continue
      }
      if (board[r][c].alive) count++
    }
  }
  return count
}

/**
 * Determine if a cell lives or dies next generation.
 * Mirrors server shouldCellLive() exactly.
 */
function shouldCellLive(cell, aliveNeighbors, settings) {
  const rule = (settings.superpowerRules || {})[cell.superpowerType] || DEFAULT_SUPERPOWER_RULES[0]
  const { birthRules, survivalRules } = settings

  if (cell.alive) {
    let survive = survivalRules.includes(aliveNeighbors)
    if (!survive && rule.surviveMinNeighbors >= 0 && aliveNeighbors >= rule.surviveMinNeighbors) survive = true
    if (!survive && rule.surviveMaxNeighbors >= 0 && aliveNeighbors <= rule.surviveMaxNeighbors) survive = true
    if (survive && rule.randomDeathChance > 0 && Math.random() < rule.randomDeathChance) survive = false
    return survive
  } else {
    let born = birthRules.includes(aliveNeighbors)
    if (!born && rule.birthMinNeighbors >= 0 && aliveNeighbors >= rule.birthMinNeighbors) {
      born = rule.birthBonusChance >= 1.0 || Math.random() < rule.birthBonusChance
    }
    return born
  }
}

/**
 * Run one generation of Conway. Returns new board.
 */
function runGeneration(board, settings = {}) {
  const cfg = { ...DEFAULT_SETTINGS, ...settings }
  const size = board.length
  const next = cloneBoard(board)

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = board[r][c]
      const neighbors = countNeighbors(board, r, c, size, cfg.enableToroidalBoard)
      const lives = shouldCellLive(cell, neighbors, cfg)

      if (cell.alive && !lives) {
        next[r][c].alive = false
        next[r][c].player = null
      } else if (!cell.alive && lives) {
        // Birth: inherit player from majority of alive neighbours
        const owner = dominantNeighborPlayer(board, r, c, size, cfg.enableToroidalBoard)
        if (owner !== null) {
          next[r][c].alive = true
          next[r][c].player = owner
          next[r][c].superpowerType = 0  // born cells are normal
        }
      }
    }
  }
  return next
}

/**
 * Return the player (0 or 1) with the most alive neighbours, or null if tied/none.
 */
function dominantNeighborPlayer(board, row, col, size, toroidal) {
  const counts = [0, 0]
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      let r = row + dr, c = col + dc
      if (toroidal) { r = (r + size) % size; c = (c + size) % size }
      else if (r < 0 || r >= size || c < 0 || c >= size) continue
      const n = board[r][c]
      if (n.alive && n.player !== null) counts[n.player]++
    }
  }
  if (counts[0] > counts[1]) return 0
  if (counts[1] > counts[0]) return 1
  return counts[0] > 0 ? 0 : null  // tie → P1 wins (matches server tiebreak)
}

/**
 * Run a full simulation from a placement board.
 * Returns array of board states (frame 0 = initial placement).
 */
function runSimulation(board, settings = {}, maxGenerations = 100) {
  const frames = [cloneBoard(board)]
  let current = cloneBoard(board)

  for (let gen = 0; gen < maxGenerations; gen++) {
    const next = runGeneration(current, settings)
    // Check for stability
    if (boardsEqual(current, next)) break
    frames.push(next)
    current = next
  }
  return frames
}

function boardsEqual(a, b) {
  for (let r = 0; r < a.length; r++)
    for (let c = 0; c < a[r].length; c++)
      if (a[r][c].alive !== b[r][c].alive || a[r][c].player !== b[r][c].player) return false
  return true
}

/**
 * Count cells per player on a board.
 */
function countCells(board) {
  let p1 = 0, p2 = 0
  for (const row of board)
    for (const cell of row)
      if (cell.alive) { if (cell.player === 0) p1++; else p2++ }
  return { p1, p2 }
}
