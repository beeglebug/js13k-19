function drawFloor () {

  const gradient = ctx.createLinearGradient(0, height / 2, 0, height)

  gradient.addColorStop(0, '#413d43')
  gradient.addColorStop(0.2, '#373433')
  gradient.addColorStop(1, '#373433')

  ctx.fillStyle = gradient
  ctx.fillRect(0, height / 2, width, height / 2)
}

function drawCeiling () {

  const gradient = ctx.createLinearGradient(0, 0, 0, height / 2)

  gradient.addColorStop(0, '#7c9dbd')
  gradient.addColorStop(1, '#a3b1bd')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height / 2)
}
