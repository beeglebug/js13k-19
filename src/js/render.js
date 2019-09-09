function renderSky (ctx, fill) {
  ctx.fillStyle = fill
  ctx.fillRect(0, 0, width, height / 2)
}

const MINI_MAP_TILE_SIZE = 2

function renderMiniMap (ctx) {

  miniMapCtx.clearRect(0, 0, miniMapWidth, miniMapHeight)

  miniMapCtx.globalCompositeOperation = 'source-over'
  miniMapCtx.drawImage(fowCanvas, 0, 0)
  miniMapCtx.globalCompositeOperation = 'source-in'
  miniMapCtx.drawImage(mapCanvas, 0, 0)
  miniMapCtx.globalCompositeOperation = 'source-over'

  const px = Math.floor(player.x) * MINI_MAP_TILE_SIZE
  const py = Math.floor(player.y) * MINI_MAP_TILE_SIZE

  miniMapCtx.fillStyle = '#ff0011'
  miniMapCtx.fillRect(
    px, py,
    MINI_MAP_TILE_SIZE,
    MINI_MAP_TILE_SIZE)

  // miniMapCtx.strokeStyle = '#ff0011'
  // drawLine(
  //   miniMapCtx,
  //   px,
  //   py,
  //   (player.x + player.direction.x * 2) * MINI_MAP_TILE_SIZE,
  //   (player.y + player.direction.y * 2) * MINI_MAP_TILE_SIZE
  // )

  // renderInfluenceMap(miniMapCtx, influenceMap)
  // renderGraph(miniMapCtx, map)

  ctx.save()
  ctx.translate(
    (width / 2) - miniMapWidth / 2,
    (height / 2) - miniMapHeight / 2
  )
  ctx.globalAlpha = 0.5
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, miniMapWidth, miniMapHeight)
  ctx.drawImage(miniMapCanvas, 0, 0)
  ctx.restore()
}

function renderMap (ctx) {

  // TODO switch?
  const colorsByTileType = {
    '.': '#6c6c6c',
    '-': '#ffffff',
    '~': '#ffffff',
    'X': '#ffffff',
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
    const textureX = Math.floor(((stripe - (-screenWidth / 2 + screenX)) * 16) / screenWidth)
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
  if (map) ctx.fillText(`sprites: ${map.entities.length}`, 5, 50)

}

const hudHeight = 13

// TODO full overlay at of bottom screen
function renderHUD (ctx) {

  ctx.fillStyle = '#777777'
  ctx.fillRect(0, height - hudHeight, width, hudHeight)

  // reticule
  if (!showMiniMap) {
    ctx.fillStyle = '#FFFFFF'
    const cx = width / 2
    const cy = height / 2
    ctx.fillRect(cx - 1, cy, 3, 1)
    ctx.fillRect(cx, cy - 1, 1, 3)
  }

  // health and mana

  ctx.save()
  ctx.translate(0, height - hudHeight)

  const barWidth = 50

  ctx.fillStyle = '#5c5c5c'
  ctx.fillRect(2, 2, 86, 9)

  renderText(ctx, whiteFont, 'health', 6, 4)

  ctx.fillStyle = '#57161c'
  ctx.fillRect(34, 4, barWidth, 5)

  const currentHealthWidth = remap(player.health, 0, player.maxHealth, 0, barWidth)

  ctx.fillStyle = '#ba1826'
  ctx.fillRect(34, 4, currentHealthWidth, 5)

  ctx.fillStyle = '#5c5c5c'
  ctx.fillRect(92, 2, 80, 9)

  renderText(ctx, whiteFont, 'mana', 96, 4)

  ctx.fillStyle = '#102746'
  ctx.fillRect(118, 4, barWidth, 5)

  const currentManaWidth = remap(player.mana, 0, player.maxMana, 0, barWidth)

  ctx.fillStyle = '#2474ba'
  ctx.fillRect(118, 4, currentManaWidth, 5)

  ctx.fillStyle = '#5c5c5c'
  ctx.fillRect(294, 2, 24, 9)
  ctx.drawImage(greySprites[11], 298, -6)

  if (player.hasKey) {
    ctx.drawImage(sprites[11], 298, -6)
  }

  ctx.fillStyle = '#5c5c5c'
  ctx.fillRect(176, 2, 114, 9)
  renderText(ctx, whiteFont, map.name, 180, 4)

  ctx.restore()
}

function renderWeapon (ctx) {
  ctx.drawImage(imgSprites, 96, 0, 16, 16, Math.floor(onScreenWeapon.x), Math.floor(onScreenWeapon.y), 16 * 8, 16 * 8)
  // TODO muzzle flash
}

function renderGraph (ctx, map) {

  const size = map.cellSize * MINI_MAP_TILE_SIZE

  ctx.save()

  ctx.strokeStyle = '#ffffff'
  ctx.strokeWidth = 2
  ctx.lineCap = 'square'

  for (let y = 0; y < map.maze.height; y++) {

    for (let x = 0; x < map.maze.width; x++) {

      const node = map.maze.data[y][x]

      const xs = x * size
      const ys = y * size

      if (node.entrance) {
        ctx.fillStyle = 'rgba(0,45,104,0.6)'
        ctx.fillRect(x * size, y * size, size, size)
      } else if (node.secret) {
        ctx.fillStyle = 'rgba(7,122,0,0.6)'
        ctx.fillRect(x * size, y * size, size, size)
      } else if (node.exit) {
        ctx.fillStyle = 'rgba(129,22,23,0.6)'
        ctx.fillRect(x * size, y * size, size, size)
      } else if (node.key) {
        ctx.fillStyle = 'rgba(129,86,15,0.6)'
        ctx.fillRect(x * size, y * size, size, size)
      }

      // ctx.translate(0.5, 0.5)
      //
      // if (node.top) drawLine(ctx, xs, ys, xs + size, ys)
      // if (node.left) drawLine(ctx, xs, ys, xs, ys + size)
      // if (node.bottom) drawLine(ctx, xs, ys + size, xs + size, ys + size)
      // if (node.right) drawLine(ctx, xs + size, ys, xs + size, ys + size)
      //
      // ctx.translate(-0.5, -0.5)

      ctx.fillStyle = '#FFFFFF'
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      ctx.fillText(node.weight, xs + size / 2, ys + size / 2)
    }
  }

  ctx.restore()
}
