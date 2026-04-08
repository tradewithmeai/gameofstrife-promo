// HUD renderer — updates DOM elements to match GameHUD.tsx layout

/**
 * Update all HUD elements from game state.
 * @param {object} state - { stage, currentTurn, p1Tokens, p2Tokens, p1Cells, p2Cells, generation, maxGenerations }
 */
function renderHUD(state) {
  const { stage, currentTurn, p1Tokens, p2Tokens, p1Cells, p2Cells, generation, maxGenerations } = state

  // Player token / cell counts
  const showCells = stage === 'simulation' || stage === 'finished'
  setEl('hud-p1-count', showCells ? p1Cells : p1Tokens)
  setEl('hud-p2-count', showCells ? p2Cells : p2Tokens)

  // Center status
  let statusText = ''
  if (stage === 'placement') {
    statusText = currentTurn === 'P1' ? 'P1 PLACING' : 'P2 PLACING'
  } else if (stage === 'sp_assignment') {
    statusText = currentTurn ? `${currentTurn} ASSIGNING` : 'SP PHASE'
  } else if (stage === 'simulation') {
    statusText = `GEN ${generation} / ${maxGenerations}`
  } else if (stage === 'finished') {
    statusText = 'FINISHED'
  }
  setEl('hud-status', statusText)

  // Count labels vary by stage
  const inPlacement = stage === 'placement' || stage === 'sp_assignment'
  setEl('hud-p1-label', inPlacement ? 'tokens' : 'cells')
  setEl('hud-p2-label', inPlacement ? 'tokens' : 'cells')

  // Active player highlight
  const p1Box = document.getElementById('hud-p1-box')
  const p2Box = document.getElementById('hud-p2-box')
  if (p1Box && p2Box) {
    const placing = stage === 'placement' || stage === 'sp_assignment'
    p1Box.classList.toggle('hud-active', currentTurn === 'P1' && placing)
    p2Box.classList.toggle('hud-active', currentTurn === 'P2' && placing)
  }
}

function setEl(id, value) {
  const el = document.getElementById(id)
  if (el) el.textContent = value ?? ''
}
