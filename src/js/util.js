function outQuad (t) {
  return t * (2 - t)
}

function clamp (num, min, max) {
  return Math.min(Math.max(num, min), max)
}

function remap (val, min, max, a, b) {
  if (max - min === 0) return a
  return a + (((val - min) * (b-a)) / (max - min))
}

function lerp (a, b, n) {
  return (1 - n) * a + n * b
}

function createCanvas (width, height) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { alpha: false })

  canvas.width = width
  canvas.height = height

  ctx.imageSmoothingEnabled = false

  return [canvas, ctx]
}

function hexToRgb (hex) {
  const num = hex.replace('#', '')
  const r = parseInt(num.substring(0,2), 16)
  const g = parseInt(num.substring(2,4), 16)
  const b = parseInt(num.substring(4,6), 16)
  return [r, g, b]
}

function flat (arr2d) {
  return [].concat(...arr2d)
}

// get player data for quick replace
function debugSave () {
  const data = `${player.x.toFixed(2)}, ${player.y.toFixed(2)}, ${player.direction.x.toFixed(2)}, ${player.direction.y.toFixed(2)}`
  console.log(data)
}

function tick () {
  // timing for input and FPS counter
  oldTime = time
  time = performance.now()
  let delta = (time - oldTime) / 1000 // time the last frame took in seconds
  fps = 1 / delta
  return delta
}

function zPos (scale) { return 0 - (1 - scale) / 2 }
