function drawFloor (ctx, fill) {
  ctx.fillStyle = fill
  ctx.fillRect(0, height / 2, width, height / 2)
}

function drawCeiling (ctx, fill) {
  ctx.fillStyle = fill
  ctx.fillRect(0, 0, width, height / 2)
}

const MINI_MAP_TILE_SIZE = 3

function drawMiniMap (ctx, map) {

  const ox = width * 2 - (map.width * MINI_MAP_TILE_SIZE) - 10
  const oy = 10

  ctx.save()
  ctx.translate(ox, oy)

  drawInfluenceMap(ctx, influenceMap)

  const colorsByTileType = {
    '-': '#ffffff',
    '=': '#555555',
    '#': '#33cec2',
  }

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const tile = getMap(map, x, y)
      if (isEmpty(tile)) continue
      ctx.fillStyle = colorsByTileType[tile.type] || '#FF00FF'
      ctx.fillRect(x * MINI_MAP_TILE_SIZE, y * MINI_MAP_TILE_SIZE, MINI_MAP_TILE_SIZE, MINI_MAP_TILE_SIZE)
    }
  }

  ctx.translate(0.5, 0.5)

  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(player.x * MINI_MAP_TILE_SIZE, player.y * MINI_MAP_TILE_SIZE, player.radius * MINI_MAP_TILE_SIZE, 0, Math.PI * 2)
  ctx.fill()
  ctx.closePath()

  ctx.strokeStyle = '#ff0e00'
  ctx.beginPath()
  ctx.moveTo(player.x * MINI_MAP_TILE_SIZE, player.y * MINI_MAP_TILE_SIZE)
  ctx.lineTo((player.x + player.direction.x * 2) * MINI_MAP_TILE_SIZE, (player.y + player.direction.y * 2) * MINI_MAP_TILE_SIZE)
  ctx.stroke()
  ctx.closePath()

  // sprites.forEach(sprite => {
  //   ctx.fillStyle = '#007eff'
  //   ctx.beginPath()
  //   ctx.arc(sprite.x * MINI_MAP_TILE_SIZE, sprite.y * MINI_MAP_TILE_SIZE, player.radius * MINI_MAP_TILE_SIZE, 0, Math.PI * 2)
  //   ctx.fill()
  //   ctx.closePath()
  // })

  ctx.restore()
}

function renderSprite (ctx, sprite) {

  // translate sprite player to relative to camera
  const spriteX = sprite.x - player.x
  const spriteY = sprite.y - player.y

  const invDet = 1 / (camera.x * player.direction.y - player.direction.x * camera.y)

  const transformX = invDet * (player.direction.y * spriteX - player.direction.x * spriteY) * -1
  const transformY = invDet * (-camera.y * spriteX + camera.x * spriteY)

  // not in front of the camera
  if (transformY <= 0) return

  const spriteScreenX = Math.round((width / 2) * (1 + transformX / transformY))

  // calculate size of sprite on screen
  const spriteWidth = Math.abs(Math.round(height / transformY)) * sprite.scale
  const spriteHeight = Math.abs(Math.round(height / transformY)) * sprite.scale

  const z = height / transformY * sprite.z

  // calculate lowest and highest pixel to fill in current stripe
  let drawStartY = (-spriteHeight / 2 + height / 2) - z
  let drawEndY = (spriteHeight / 2 + height / 2) - z

  let drawStartX = Math.round(-spriteWidth / 2 + spriteScreenX)
  if (drawStartX < 0) drawStartX = 0

  let drawEndX = spriteWidth / 2 + spriteScreenX
  if (drawEndX >= width) drawEndX = width

  // TODO try and draw the entire sprite in one drawImage

  // loop through every vertical stripe of the sprite on screen
  for (let stripe = drawStartX; stripe < drawEndX; stripe++) {
    const textureLocalX = Math.floor(((stripe - (-spriteWidth / 2 + spriteScreenX)) * 16) / spriteWidth)
    const textureX = textureLocalX + sprite.index * 16
    const textureY = 0
    const buffer = zBuffer[stripe]

    if (
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

  const sorted = flat(map.data).filter(Boolean).map(cell => cell.weight).sort((a,b) => a - b)

  const min = sorted[0]
  const max = sorted[sorted.length - 1]

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const tile = map.data[y][x]
      if (tile === null) {
        ctx.fillStyle = '#ffffff'
      } else {
        const weight = remap(tile.weight, min, max, 0, 1)
        const hue = (1 - weight) * 240
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
      }
      ctx.fillRect(x * MINI_MAP_TILE_SIZE, y * MINI_MAP_TILE_SIZE, MINI_MAP_TILE_SIZE, MINI_MAP_TILE_SIZE)
    }
  }
}

function drawDebugText (ctx) {
  ctx.fillStyle = '#FFF'
  ctx.font = '12px Courier'
  ctx.textBaseline = 'top'
  ctx.fillText(`pos: ${player.x.toFixed(2)},${player.y.toFixed(2)}`, 5, 5)
  ctx.fillText(`dir: ${player.direction.x.toFixed(2)},${player.direction.y.toFixed(2)}`, 5, 20)
  ctx.fillText(`fps: ${parseInt(fps)}`, 5, 35)
  ctx.fillText(`sprites: ${sprites.length}`, 5, 50)
  ctx.fillText(`mouseMove: ${mouseMove.x},${mouseMove.y}`, 5, 65)
}

function drawReticle (ctx) {
  ctx.fillStyle = '#FFFFFF'
  const cx = width / 2
  const cy = height / 2
  ctx.fillRect(cx - 1, cy, 3, 1)
  ctx.fillRect(cx, cy - 1, 1, 3)
}

function drawWeapon (ctx) {

  ctx.drawImage(imgSprites, 96, 0, 16, 16, weapon.x, weapon.y, 16 * 8, 16 * 8)
}

function renderGraph (ctx, graph) {

  const size = 20


  ctx.save()
  ctx.translate(100, 100)

  ctx.strokeStyle = '#ffffff'
  ctx.strokeWidth = 2
  ctx.lineCap = 'square'

  for (let y = 0; y < graph.height; y++) {

    for (let x = 0; x < graph.width; x++) {

      const node = graph.data[y][x]

      const xs = x * size
      const ys = y * size

      if (node.entrance) {
        ctx.fillStyle = '#20495a'
      } else if (node.exit) {
        ctx.fillStyle = '#81560f'
      } else {
        ctx.fillStyle = '#3e3e3e'
      }
      ctx.fillRect(x * size, y * size, size, size)

      ctx.translate(0.5, 0.5)

      if (node.top) {
        ctx.beginPath()
        ctx.moveTo(xs, ys)
        ctx.lineTo(xs + size, ys)
        ctx.stroke()
      }

      if (node.left) {
        ctx.beginPath()
        ctx.moveTo(xs, ys)
        ctx.lineTo(xs, ys + size)
        ctx.stroke()
      }

      if (node.bottom) {
        ctx.beginPath()
        ctx.moveTo(xs, ys + size)
        ctx.lineTo(xs + size, ys + size)
        ctx.stroke()
      }

      if (node.right) {
        ctx.beginPath()
        ctx.moveTo(xs + size, ys)
        ctx.lineTo(xs + size, ys + size)
        ctx.stroke()
      }

      ctx.translate(-0.5, -0.5)

      ctx.fillStyle = '#FFFFFF'
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      ctx.fillText(node.weight, xs + size / 2, ys + size / 2)
    }
  }

  ctx.restore()
}
