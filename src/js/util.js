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
