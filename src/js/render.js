function renderFloor (ctx, fill) {
  ctx.fillStyle = fill
  ctx.fillRect(0, height / 2, width, height / 2)
}

function renderCeiling (ctx, fill) {
  ctx.fillStyle = fill
  ctx.fillRect(0, 0, width, height / 2)
}

const MINI_MAP_TILE_SIZE = 3

function renderMiniMap (ctx, map) {

  const ox = width * 2 - (map.width * MINI_MAP_TILE_SIZE) - 10
  const oy = 10

  ctx.save()
  ctx.translate(ox, oy)

  const colorsByTileType = {
    '.': '#6c6c6c',
    '-': '#ffffff',
    '~': '#bbdac0',
    '=': '#555555',
    '#': '#33cec2',
  }

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const tile = getMap(map, x, y)
      if (tile === null) continue
      ctx.fillStyle = colorsByTileType[tile.type] || '#FF00FF'
      ctx.fillRect(x * MINI_MAP_TILE_SIZE, y * MINI_MAP_TILE_SIZE, MINI_MAP_TILE_SIZE, MINI_MAP_TILE_SIZE)
    }
  }

  renderInfluenceMap(ctx, influenceMap)

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

function renderEntity (ctx, entity) {

  const { index, z, transformY, screenX, screenWidth, screenHeight } = entity

  // not in front of the camera
  if (transformY <= 0) return

  const zOffset = height / transformY * z

  // calculate lowest and highest pixel to fill in current stripe
  let drawStartY = (-screenHeight / 2 + height / 2) - zOffset
  let drawEndY = (screenHeight / 2 + height / 2) - zOffset

  let drawStartX = Math.round(-screenWidth / 2 + screenX)
  if (drawStartX < 0) drawStartX = 0

  let drawEndX = screenWidth / 2 + screenX
  if (drawEndX >= width) drawEndX = width

  // loop through every vertical stripe of the sprite on screen
  for (let stripe = drawStartX; stripe < drawEndX; stripe++) {
    const textureLocalX = Math.floor(((stripe - (-screenWidth / 2 + screenX)) * 16) / screenWidth)
    const textureX = textureLocalX + index * 16
    const textureY = 0
    const buffer = zBuffer[stripe]

    if (
      stripe >= 0 &&
      stripe < width && // somewhere on screen
      (buffer === null || buffer > transformY)
    ) {
      // TODO lighting based on distance
      ctx.drawImage(entity.sprite, textureX, textureY, 1, 16, stripe, drawStartY, 1, drawEndY - drawStartY)
    }
  }
}

function renderInfluenceMap (ctx, map) {

  if (!map) return

  const sorted = flat(map.data).filter(Boolean).map(cell => cell.weight).sort((a,b) => a - b)

  const min = sorted[0]
  const max = sorted[sorted.length - 1]

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const tile = map.data[y][x]
      if (tile === null) continue
      const weight = remap(tile.weight, min, max, 0, 1)
      const hue = (1 - weight) * 240
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
      ctx.fillRect(x * MINI_MAP_TILE_SIZE, y * MINI_MAP_TILE_SIZE, MINI_MAP_TILE_SIZE, MINI_MAP_TILE_SIZE)
    }
  }
}

function renderDebugText (ctx) {
  ctx.fillStyle = '#FFF'
  ctx.font = '12px Courier'
  ctx.textBaseline = 'top'
  ctx.fillText(`pos: ${player.x.toFixed(2)},${player.y.toFixed(2)}`, 5, 5)
  ctx.fillText(`dir: ${player.direction.x.toFixed(2)},${player.direction.y.toFixed(2)}`, 5, 20)
  ctx.fillText(`fps: ${parseInt(fps)}`, 5, 35)
  ctx.fillText(`sprites: ${map.entities.length}`, 5, 50)
  ctx.fillText(`mouseMove: ${mouseMove.x},${mouseMove.y}`, 5, 65)
}

// TODO full overlay at of bottom screen
function renderHUD (ctx) {

  // reticule
  ctx.fillStyle = '#FFFFFF'
  const cx = width / 2
  const cy = height / 2
  ctx.fillRect(cx - 1, cy, 3, 1)
  ctx.fillRect(cx, cy - 1, 1, 3)

  // health and mana

  const barWidth = 40

  ctx.fillStyle = '#ba1826'
  ctx.fillRect(5, 160, barWidth, 5)

  ctx.fillStyle = '#102746'
  ctx.fillRect(5, 170, barWidth, 5)

  const currentBarWidth = remap(player.mana, 0, 100, 0, barWidth)

  ctx.fillStyle = '#2474ba'
  ctx.fillRect(5, 170, currentBarWidth, 5)
}

function renderWeapon (ctx) {
  ctx.drawImage(imgSprites, 96, 0, 16, 16, Math.floor(weapon.x), Math.floor(weapon.y), 16 * 8, 16 * 8)
  if (shootCoolDown) {
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(Math.floor(weapon.x + 24), Math.floor(weapon.y + 40), 16, 16)
  }
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
