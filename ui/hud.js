// HUD renderer — updates DOM elements to match GameHUD.tsx layout

/**
 * Update all HUD elements from game state.
 * @param {object} state - { stage, currentTurn, p1Tokens, p2Tokens, p1Cells, p2Cells, generation, maxGenerations }
 */
function renderHUD(state) {
  const { stage, currentTurn, p1Tokens, p2Tokens, p1Cells, p2Cells, generation, maxGenerations } = state

  // Player token / cell counts
  setEl('hud-p1-count', stage === 'simulation' || stage === 'finished' ? p1Cells : p1Tokens)
  setEl('hud-p2-count', stage === 'simulation' || stage === 'finished' ? p2Cells : p2Tokens)
  setEl('hud-p1-label', stage === 'placement' ? 'tokens' : 'cells')
  setEl('hud-p2-label', stage === 'placement' ? 'tokens' : 'cells')

  // Center status
  let statusText = ''
  if (stage === 'placement') {
    statusText = currentTurn === 'P1' ? 'P1 PLACING' : 'P2 PLACING'
  } else if (stage === 'simulation') {
    statusText = `GEN ${generation} / ${maxGenerations}`
  } else if (stage === 'finished') {
    statusText = 'FINISHED'
  }
  setEl('hud-status', statusText)

  // Active player highlight
  const p1Box = document.getElementById('hud-p1-box')
  const p2Box = document.getElementById('hud-p2-box')
  if (p1Box && p2Box) {
    p1Box.classList.toggle('hud-active', currentTurn === 'P1' && stage === 'placement')
    p2Box.classList.toggle('hud-active', currentTurn === 'P2' && stage === 'placement')
  }
}

function setEl(id, value) {
  const el = document.getElementById(id)
  if (el) el.textContent = value ?? ''
}
