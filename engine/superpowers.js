// Superpower definitions — ported from server/src/engine/gameOfStrifeTypes.ts and utils/colors.ts
// This file is maintained manually; update if game rules change significantly.

const SUPERPOWER_NAMES = {
  0: 'Normal',
  1: 'Tank',
  2: 'Spreader',
  3: 'Survivor',
  4: 'Ghost',
  5: 'Replicator',
  6: 'Destroyer',
  7: 'Hybrid',
}

// Arcade theme colors (neon — best for video)
const SUPERPOWER_COLORS = {
  0: null,          // Normal — no inset
  1: '#FFFFFF',     // Tank — white
  2: '#00F5FF',     // Spreader — cyan
  3: '#FFFF00',     // Survivor — yellow
  4: '#FF10F0',     // Ghost — magenta
  5: '#FF6600',     // Replicator — orange
  6: '#FF0000',     // Destroyer — red
  7: '#B026FF',     // Hybrid — purple
}

const DEFAULT_SUPERPOWER_RULES = {
  0: { surviveMinNeighbors: -1, surviveMaxNeighbors: -1, randomDeathChance: 0,    birthMinNeighbors: -1, birthBonusChance: 1.0 },
  1: { surviveMinNeighbors:  1, surviveMaxNeighbors: -1, randomDeathChance: 0,    birthMinNeighbors: -1, birthBonusChance: 1.0 },
  2: { surviveMinNeighbors: -1, surviveMaxNeighbors: -1, randomDeathChance: 0,    birthMinNeighbors:  2, birthBonusChance: 1.0 },
  3: { surviveMinNeighbors:  6, surviveMaxNeighbors:  1, randomDeathChance: 0,    birthMinNeighbors: -1, birthBonusChance: 1.0 },
  4: { surviveMinNeighbors: -1, surviveMaxNeighbors: -1, randomDeathChance: 0.05, birthMinNeighbors:  1, birthBonusChance: 0.1 },
  5: { surviveMinNeighbors: -1, surviveMaxNeighbors: -1, randomDeathChance: 0,    birthMinNeighbors:  2, birthBonusChance: 0.3 },
  6: { surviveMinNeighbors:  1, surviveMaxNeighbors: -1, randomDeathChance: 0,    birthMinNeighbors: -1, birthBonusChance: 1.0 },
  7: { surviveMinNeighbors:  1, surviveMaxNeighbors:  1, randomDeathChance: 0,    birthMinNeighbors:  2, birthBonusChance: 1.0 },
}
