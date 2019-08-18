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


function drawMiniMap (map, ctx) {

  let size = 5
  const ox = width - (map.width * size) - 10
  const oy = 10

  ctx.save()
  ctx.translate(ox, oy)
  ctx.globalAlpha = 0.5

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, map.width * size, map.height * size)

  const colorsByTileId = {
    '-': '#333333',
    '=': '#555555',
    '#': '#33cec2',
  }

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const tile = getMap(map, x, y)
      if (tile === null) continue
      ctx.fillStyle = colorsByTileId[tile] || '#FF00FF'
      ctx.fillRect(x * size, y * size, size, size)
    }
  }

  ctx.fillStyle = '#ff0000'
  ctx.beginPath()
  ctx.arc(player.x * size, player.y * size, player.radius * size, 0, Math.PI * 2)
  ctx.fill()
  ctx.closePath()

  ctx.strokeStyle = '#ff0000'
  ctx.beginPath()
  ctx.moveTo(player.x * size, player.y * size)
  ctx.lineTo((player.x + player.direction.x * 2) * size, (player.y + player.direction.y * 2) * size)
  ctx.stroke()
  ctx.closePath()

  sprites.forEach(sprite => {
    ctx.fillStyle = '#007eff'
    ctx.beginPath()
    ctx.arc(sprite.x * size, sprite.y * size, player.radius * size, 0, Math.PI * 2)
    ctx.fill()
    ctx.closePath()
  })

  ctx.restore()
}
