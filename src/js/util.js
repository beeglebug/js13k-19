function outQuad(t) {
  return t * (2 - t)
}

function clamp (num, min, max) {
  return Math.min(Math.max(num, min), max)
}

function remap (val, min, max, a, b) {
  if (max - min === 0) return a
  return a + (((val - min) * (b-a)) / (max - min))
}

function createCanvas (width, height) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

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

// get player data for quick replace
function debugSave () {
  const data = 'const player = ' + JSON.stringify(player, null, '  ').replace(/\"/g, '')
  console.log(data)
}
