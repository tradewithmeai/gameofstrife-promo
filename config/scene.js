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
  type: 'full_game',

  // ── Game settings ───────────────────────────────────────────────────────────
  settings: {
    boardSize: 10,
    tokensPerPlayer: 15,

    enabledSuperpowers: [],           // no superpowers
    superpowerPlacementMode: 'random',

    conwayRules: {
      birthRules:    [3],
      survivalRules: [2, 3],
    },

    superpowerRules: null,
    enableToroidalBoard: true,
    maxGenerations: 100,
    generationDelayMs: 180,
  },

  // ── Placement sequence ──────────────────────────────────────────────────────
  // 15 tokens each. P1 builds in the top-left quadrant, P2 in the bottom-right.
  // All spType 0 (normal). Moves alternate P1 / P2.
  placement: [
    ['P1', 0, 0],  ['P2', 9, 9],
    ['P1', 0, 2],  ['P2', 9, 7],
    ['P1', 1, 1],  ['P2', 8, 8],
    ['P1', 2, 0],  ['P2', 7, 9],
    ['P1', 1, 3],  ['P2', 8, 6],
    ['P1', 2, 2],  ['P2', 7, 7],
    ['P1', 3, 1],  ['P2', 6, 8],
    ['P1', 0, 4],  ['P2', 9, 5],
    ['P1', 2, 4],  ['P2', 7, 5],
    ['P1', 3, 3],  ['P2', 6, 6],
    ['P1', 4, 0],  ['P2', 5, 9],
    ['P1', 4, 2],  ['P2', 5, 7],
    ['P1', 1, 5],  ['P2', 8, 4],
    ['P1', 3, 5],  ['P2', 6, 4],
    ['P1', 0, 6],  ['P2', 9, 3],
  ],

  // ── SP assignment phase ─────────────────────────────────────────────────────
  spAssignments: [],

  // ── Direct board state ──────────────────────────────────────────────────────
  boardState: null,

  // ── Clip control ────────────────────────────────────────────────────────────
  stopAfterGeneration: null,   // run to completion

  // ── Text overlays ───────────────────────────────────────────────────────────
  // IN-PHONE (default) — appears over the board inside the phone:
  //   at: named moment or ms | text: string or null (hides) | sub: subtitle | duration: ms
  //
  // OUTER RETRO (add position:'outer') — big 80s text outside the phone:
  //   style:     'bubble' | 'starburst' | 'ticker'
  //   color:     text/shape fill color (default: random bright)
  //   size:      'sm' | 'md' | 'lg' | 'xl'
  //   placement: 'left' | 'right' | 'top' | 'center' | 'bottom-left' | 'bottom-right'
  //   angle:     degrees tilt (default: random ±6°)
  //   anim:      'wham' | 'slide-left' | 'slide-right'
  overlays: [
    { at: 'start', text: 'GAME OF\nSTRIFE', sub: "Conway's Game of Life — PvP", duration: 2000 },
    { at: 2500,    text: null },

    // ── Outer retro overlays (uncomment to enable) ─────────────────────────
    // { at: 'simulation_start', position: 'outer', style: 'starburst',
    //   text: 'FIGHT!', color: '#FFFF00', size: 'xl', placement: 'right', anim: 'wham', duration: 2000 },
    // { at: 'result', position: 'outer', style: 'bubble',
    //   text: 'GAME\nOVER', color: '#FF006E', size: 'lg', placement: 'left', anim: 'slide-left', duration: 4000 },
    // { at: 'placement_done', position: 'outer', style: 'ticker',
    //   text: 'TOKENS PLACED ★ SIMULATION STARTING ★ WHO WILL SURVIVE?', color: '#00FFFF', duration: 5000 },
  ],

  // ── Result card ─────────────────────────────────────────────────────────────
  showResult: true,

  // ── Timing ──────────────────────────────────────────────────────────────────
  introDelayMs:       500,
  placementDelayMs:   550,
  p2PlacementDelayMs: 380,
  spAssignDelayMs:    500,
}
