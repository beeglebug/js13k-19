function renderSky (ctx, fill) {
  ctx.fillStyle = fill
  ctx.fillRect(0, 0, width, height / 2)
}

const MINI_MAP_TILE_SIZE = 3

function renderMiniMap (ctx) {

  miniMapCtx.clearRect(0, 0, width, height)

  miniMapCtx.globalCompositeOperation = 'source-over'
  miniMapCtx.drawImage(fowCanvas, 0, 0)
  miniMapCtx.globalCompositeOperation = 'source-in'
  miniMapCtx.drawImage(mapCanvas, 0, 0)
  miniMapCtx.globalCompositeOperation = 'source-over'

  drawCircle(miniMapCtx, player.x * MINI_MAP_TILE_SIZE, player.y * MINI_MAP_TILE_SIZE, 2, '#ff0011')

  miniMapCtx.strokeStyle = '#ff0011'
  miniMapCtx.beginPath()
  miniMapCtx.moveTo(player.x * MINI_MAP_TILE_SIZE, player.y * MINI_MAP_TILE_SIZE)
  miniMapCtx.lineTo((player.x + player.direction.x * 2) * MINI_MAP_TILE_SIZE, (player.y + player.direction.y * 2) * MINI_MAP_TILE_SIZE)
  miniMapCtx.stroke()

  const ox = Math.floor(width - ((map.width * MINI_MAP_TILE_SIZE) / 2))
  const oy = Math.floor(height - ((map.height * MINI_MAP_TILE_SIZE) / 2))

  renderInfluenceMap(miniMapCtx, influenceMap)

  ctx.drawImage(miniMapCanvas, ox, oy)
}

function renderMap (ctx) {

  const colorsByTileType = {
    '.': '#6c6c6c',
    '-': '#ffffff',
    '~': '#ffffff',
    '=': '#555555',
    '#': '#33cec2',
    'D': '#07080c',
    'd': '#07080c',
  }

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const tile = getMap(map, x, y)
      if (tile === null) continue
      ctx.fillStyle = colorsByTileType[tile.type] || '#FF00FF'
      ctx.fillRect(x * MINI_MAP_TILE_SIZE, y * MINI_MAP_TILE_SIZE, MINI_MAP_TILE_SIZE, MINI_MAP_TILE_SIZE)
    }
  }
}

function renderEntity (ctx, entity) {

  const { sprite, z, transformY, screenX, screenWidth, screenHeight } = entity

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
    const textureX = textureLocalX
    const textureY = 0
    const buffer = zBuffer[stripe]

    if (
      stripe >= 0 &&
      stripe < width && // somewhere on screen
      (buffer === null || buffer > transformY)
    ) {
      // TODO lighting based on distance
      ctx.drawImage(sprite, textureX, textureY, 1, 16, stripe, drawStartY, 1, drawEndY - drawStartY)
    }
  }
}

function renderInfluenceMap (ctx, map) {

  if (!map) return

  const sorted = flat(map.data)
    .filter(Boolean)
    .filter(cell => cell.weight !== Infinity)
    .map(cell => cell.weight)
    .sort((a,b) => a - b)

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

  renderText(ctx, 'health', 5, 160)

  ctx.fillStyle = '#57161c'
  ctx.fillRect(5, 170, barWidth, 5)

  const currentHealthWidth = remap(player.health, 0, player.maxHealth, 0, barWidth)

  ctx.fillStyle = '#ba1826'
  ctx.fillRect(5, 170, currentHealthWidth, 5)

  renderText(ctx, 'mana', 60, 160)

  ctx.fillStyle = '#102746'
  ctx.fillRect(60, 170, barWidth, 5)

  const currentManaWidth = remap(player.mana, 0, player.maxMana, 0, barWidth)

  ctx.fillStyle = '#2474ba'
  ctx.fillRect(60, 170, currentManaWidth, 5)
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
