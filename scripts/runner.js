// Timeline runner — schedules scripted demo actions
// Usage:
//   const timeline = runner([
//     { at: 0,     fn: showTitle, args: ['Game of Strife'] },
//     { at: 2000,  fn: placeToken, args: ['P1', 33] },
//     { at: 10000, fn: startSimulation },
//   ])
//   timeline.play()
//   timeline.pause()
//   timeline.reset()

function runner(steps) {
  let timers = []
  let startedAt = null
  let elapsed = 0
  let playing = false

  function play() {
    if (playing) return
    playing = true
    const offset = elapsed
    startedAt = Date.now()

    steps.forEach(step => {
      const delay = step.at - offset
      if (delay < 0) return  // already past this step
      const t = setTimeout(() => {
        step.fn(...(step.args || []))
      }, delay)
      timers.push(t)
    })
  }

  function pause() {
    if (!playing) return
    playing = false
    elapsed += Date.now() - startedAt
    timers.forEach(clearTimeout)
    timers = []
  }

  function reset() {
    pause()
    elapsed = 0
    playing = false
  }

  return { play, pause, reset }
}
