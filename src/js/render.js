function drawFloor (fill) {
  ctx.fillStyle = fill
  ctx.fillRect(0, height / 2, width, height / 2)
}

function drawCeiling (fill) {
  ctx.fillStyle = fill
  ctx.fillRect(0, 0, width, height / 2)
}

const MINI_MAP_TILE_SIZE = 5

function drawMiniMap (map, ctx) {

  const ox = width - (map.width * MINI_MAP_TILE_SIZE) - 10
  const oy = 10

  ctx.save()
  ctx.translate(ox, oy)
  ctx.globalAlpha = 0.5

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, map.width * MINI_MAP_TILE_SIZE, map.height * MINI_MAP_TILE_SIZE)

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
      ctx.fillRect(x * MINI_MAP_TILE_SIZE, y * MINI_MAP_TILE_SIZE, MINI_MAP_TILE_SIZE, MINI_MAP_TILE_SIZE)
    }
  }

  ctx.fillStyle = '#ff0000'
  ctx.beginPath()
  ctx.arc(player.x * MINI_MAP_TILE_SIZE, player.y * MINI_MAP_TILE_SIZE, player.radius * MINI_MAP_TILE_SIZE, 0, Math.PI * 2)
  ctx.fill()
  ctx.closePath()

  ctx.strokeStyle = '#ff0000'
  ctx.beginPath()
  ctx.moveTo(player.x * MINI_MAP_TILE_SIZE, player.y * MINI_MAP_TILE_SIZE)
  ctx.lineTo((player.x + player.direction.x * 2) * MINI_MAP_TILE_SIZE, (player.y + player.direction.y * 2) * MINI_MAP_TILE_SIZE)
  ctx.stroke()
  ctx.closePath()

  sprites.forEach(sprite => {
    ctx.fillStyle = '#007eff'
    ctx.beginPath()
    ctx.arc(sprite.x * MINI_MAP_TILE_SIZE, sprite.y * MINI_MAP_TILE_SIZE, player.radius * MINI_MAP_TILE_SIZE, 0, Math.PI * 2)
    ctx.fill()
    ctx.closePath()
  })

  ctx.restore()
}

function renderSprite (sprite) {

  // translate sprite player to relative to camera
  const spriteX = sprite.x - player.x
  const spriteY = sprite.y - player.y

  const invDet = 1 / (camera.x * player.direction.y - player.direction.x * camera.y)

  const transformX = invDet * (player.direction.y * spriteX - player.direction.x * spriteY) * -1
  const transformY = invDet * (-camera.y * spriteX + camera.x * spriteY)

  const spriteScreenX = Math.round((width / 2) * (1 + transformX / transformY))

  // calculate size of sprite on screen
  const spriteWidth = Math.abs(height / transformY) * sprite.scale
  const spriteHeight = Math.abs(Math.round(height / transformY)) * sprite.scale

  const z = sprite.z / transformY * 360 // no idea why 360 but it works

  // calculate lowest and highest pixel to fill in current stripe
  let drawStartY = (-spriteHeight / 2 + height / 2) - z
  let drawEndY = (spriteHeight / 2 + height / 2) - z

  let drawStartX = Math.round(-spriteWidth / 2 + spriteScreenX)
  if (drawStartX < 0) drawStartX = 0

  let drawEndX = spriteWidth / 2 + spriteScreenX
  if (drawEndX >= width) drawEndX = width

  // loop through every vertical stripe of the sprite on screen
  for (let stripe = drawStartX; stripe < drawEndX; stripe++) {
    const textureSize = 16

    const textureX = Math.floor(((stripe - (-spriteWidth / 2 + spriteScreenX)) * textureSize) / spriteWidth + sprite.index * textureSize)
    const textureY = 0
    const buffer = zBuffer[stripe]

    if (
      transformY > 0 && // in front of the camera
      stripe >= 0 &&
      stripe < width && // somewhere on screen
      (buffer === null || buffer > transformY)
    ) {
      // TODO lighting based on distance
      ctx.drawImage(imgSprites, textureX, textureY, 1, 16, stripe, drawStartY, 1, drawEndY - drawStartY)
    }
  }


}

function drawInfluenceMap (ctx, map) {

  if (!map) return

  ctx.save()

  const { height, width, data } = map

  ctx.font = '8px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const sorted = flat(data).sort((a,b) => a - b)
  const min = sorted[0]
  const max = sorted[sorted.length - 1]

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = data[y][x]
      ctx.globalAlpha = 0.5
      if (tile === null) {
        ctx.fillStyle = '#ffffff'
      } else {
        const value = remap(tile, min, max, 0, 1)
        const hue = (1 - value) * 240
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
      }
      ctx.fillRect(x * MINI_MAP_TILE_SIZE, y * MINI_MAP_TILE_SIZE, MINI_MAP_TILE_SIZE, MINI_MAP_TILE_SIZE)
      ctx.globalAlpha = 1
      if (tile !== null) {
        ctx.fillStyle = '#ffffff'
        ctx.fillText(
          tile,
          (x * MINI_MAP_TILE_SIZE) + MINI_MAP_TILE_SIZE / 2,
          (y * MINI_MAP_TILE_SIZE) + MINI_MAP_TILE_SIZE / 2
        )
      }
    }
  }

  ctx.restore()
}
