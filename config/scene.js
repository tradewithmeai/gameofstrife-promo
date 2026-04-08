// ─── SCENE CONFIG ─────────────────────────────────────────────────────────────
// This is the single file Claude Code edits to produce any demo scenario.
// After editing, refresh scenes/gameplay.html in the browser and press PLAY.
//
// ── SCENE TYPES ──
//   'full_game'   — placement → [sp_assignment phase] → simulation → result card
//   'short_clip'  — same, but simulation stops at stopAfterGeneration
//   'still_image' — skips animation entirely; fast-computes final state and freezes
//
// ── SUPERPOWER TYPES ──
//   0 = Normal    (no special rule)
//   1 = Tank      (survives with just 1 neighbor)
//   2 = Spreader  (births with only 2 neighbors)
//   3 = Survivor  (survives alone or in crowds)
//   4 = Ghost     (rare births, random death)
//   5 = Replicator (probabilistic births with 2+ neighbors)
//   6 = Destroyer  (survives with just 1 neighbor)
//   7 = Hybrid     (combined Tank + Spreader traits)

const SCENE_CONFIG = {

  // ── Scene type ──────────────────────────────────────────────────────────────
  // 'full_game' | 'short_clip' | 'still_image'
  type: 'full_game',

  // ── Game settings ───────────────────────────────────────────────────────────
  // These mirror the options in the mobile app's dev settings.
  settings: {
    boardSize: 9,          // grid dimensions (5–15)
    tokensPerPlayer: 15,   // tokens each player places

    // Which superpower types can appear in this game (1–7).
    // Only matters for 'manual' spPlacementMode or if you want to restrict the SP legend.
    enabledSuperpowers: [1, 2, 3, 6],

    // 'random'  — SP types specified directly in the placement array (or default to 0)
    // 'manual'  — all placements are normal (spType 0); SPs assigned in spAssignments below
    superpowerPlacementMode: 'random',

    // Conway birth/survival rules
    conwayRules: {
      birthRules:    [3],       // neighbor counts that birth a new cell
      survivalRules: [2, 3],    // neighbor counts that keep a cell alive
    },

    // Override specific superpower rules. null = use all defaults from superpowers.js.
    // Example: { 1: { surviveMinNeighbors: 2, surviveMaxNeighbors: -1, randomDeathChance: 0, birthMinNeighbors: -1, birthBonusChance: 1.0 } }
    superpowerRules: null,

    enableToroidalBoard: true,  // edges wrap around (true matches server default)
    maxGenerations: 100,        // maximum simulation generations
    generationDelayMs: 200,     // ms per simulation frame (lower = faster animation)
  },

  // ── Placement sequence ──────────────────────────────────────────────────────
  // Each entry: [player, row, col, spType?]
  //   player:  'P1' or 'P2'
  //   row/col: 0-indexed grid coordinates (0,0 = top-left)
  //   spType:  optional — 0=Normal, 1=Tank, 2=Spreader, 3=Survivor, 4=Ghost,
  //                       5=Replicator, 6=Destroyer, 7=Hybrid (default: 0)
  //
  // For superpowerPlacementMode:'manual', leave out spType entirely — assign below.
  // Moves alternate P1/P2 by convention but any order is supported.
  placement: [
    ['P1', 1, 1],       ['P2', 7, 7],
    ['P1', 1, 3],       ['P2', 7, 5],
    ['P1', 2, 2],       ['P2', 6, 6],
    ['P1', 3, 1],       ['P2', 5, 7],
    ['P1', 1, 5],       ['P2', 7, 3],
    ['P1', 3, 4],       ['P2', 5, 4],
    ['P1', 4, 2],       ['P2', 4, 6],
    ['P1', 2, 4, 1],    ['P2', 6, 4, 2],   // Tank vs Spreader
    ['P1', 0, 4],       ['P2', 8, 4],
    ['P1', 4, 0],       ['P2', 4, 8],
    ['P1', 3, 3, 2],    ['P2', 5, 5, 1],   // Spreader vs Tank
    ['P1', 0, 2],       ['P2', 8, 6],
    ['P1', 2, 0],       ['P2', 6, 8],
    ['P1', 0, 6],       ['P2', 8, 2],
    ['P1', 4, 4],       ['P2', 4, 3],      // center clash
  ],

  // ── SP assignment phase ─────────────────────────────────────────────────────
  // Only used when superpowerPlacementMode is 'manual'.
  // Each entry: [player, row, col, spType]
  // The cell at (row, col) must already be owned by that player from the placement phase.
  spAssignments: [
    // ['P1', 2, 4, 1],   // assign Tank to P1's cell at row 2, col 4
    // ['P2', 6, 4, 2],   // assign Spreader to P2's cell at row 6, col 4
  ],

  // ── Direct board state ──────────────────────────────────────────────────────
  // For still_image scenes: optionally provide a complete board to render directly,
  // skipping placement and simulation entirely.
  // Format: Cell[][] where Cell = { player: 0|1|null, alive: bool, superpowerType: 0-7, lives: 1, memory: 0 }
  // null = compute from placement sequence + simulation
  boardState: null,

  // ── Clip control ────────────────────────────────────────────────────────────
  // Stop simulation after this many generations and freeze/show result.
  // null = run until board stabilises or maxGenerations is reached.
  // Use with type:'short_clip' or type:'still_image' to capture a specific moment.
  stopAfterGeneration: null,

  // ── Text overlays ───────────────────────────────────────────────────────────
  // Each entry fires at a named moment or absolute ms from scene start.
  // at:       'start' | 'placement_done' | 'sp_assignment_done' | 'simulation_start' | 'result'
  //           OR a number (ms from scene start, for overlays during placement)
  // text:     Main text to display. Use \n for line breaks. null = hide overlay.
  // sub:      Optional subtitle (smaller text below main).
  // duration: How long to show (ms). 0 = stays until explicitly hidden by another overlay entry.
  overlays: [
    { at: 'start', text: 'GAME OF\nSTRIFE', sub: "Conway's Game of Life — PvP", duration: 2000 },
    { at: 2500,    text: null },   // hide overlay before placement starts
  ],

  // ── Result card ─────────────────────────────────────────────────────────────
  // Show the scores + winner card after simulation ends.
  showResult: true,

  // ── Timing ──────────────────────────────────────────────────────────────────
  introDelayMs:       500,    // ms before first overlay/placement after pressing PLAY
  placementDelayMs:   600,    // ms between each P1 placement
  p2PlacementDelayMs: 400,    // ms between each P2 placement (faster = more responsive feel)
  spAssignDelayMs:    500,    // ms between each SP assignment
}
