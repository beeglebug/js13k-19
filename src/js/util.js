function outQuad(t) {
  return t * (2 - t)
}

function createCanvas (width, height) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = width
  canvas.height = height

  ctx.imageSmoothingEnabled = false

  return [canvas, ctx]
}
