function render () {

  lightingCtx.fillStyle = '#ffffff'
  lightingCtx.fillRect(0, 0, width, height)

  fogCtx.clearRect(0,0,width, height)

  drawFloor(ctx, map.floor)
  drawCeiling(ctx, map.ceiling)

  const sliceWidth = 1

  zBuffer = []

  // adjust camera plane based on current player direction
  perp(player.direction, camera)

  camera.x *= (fov / 100) * 1.33
  camera.y *= (fov / 100) * 1.33

  // iterate over every column of screen pixels
  for (let x = 0; x < width; x += sliceWidth) {

    // RAYCASTING ======================================================================================================

    const [rayLength, euclideanRayLength, side, wallX, tile] = raycast(x)
    if (!tile) {
      zBuffer.push(null)
      continue
    }

    zBuffer.push(rayLength)

    // WALLS ======================================================================================================

    // calculate height of line to draw on screen
    let sliceHeight = Math.abs(Math.floor(height / rayLength))

    // calculate lowest and highest pixel to fill in current stripe
    let drawStart = Math.floor((height - sliceHeight) / 2)

    const textureSize = 16
    const textureIndex = textureIndexByTileType[tile.type]
    const textureX = Math.floor(wallX * textureSize + textureIndex * textureSize)

    ctx.drawImage(imgTextures, textureX, 0, 1, textureSize, x, drawStart, sliceWidth, sliceHeight)

    // LIGHTING ========================================================================================================

    // give horizontal and vertical sides different brightness
    if (side === 1) {
      lightingCtx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      lightingCtx.fillRect(x, drawStart, sliceWidth, sliceHeight)
    }

    if (map.fog) {
      const min = 5
      const max = map.fogDistance || 30

      const clamped = clamp(euclideanRayLength, min, max)
      const normalised = remap(clamped, min, max, 0, 1)
      const eased = outQuad(normalised)

      const [r, g, b] = hexToRgb(map.fog)
      fogCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${eased})`
      fogCtx.fillRect(x, drawStart, sliceWidth, sliceHeight)
    }
  }

  // APPLY LIGHTING ====================================================================================================

  ctx.globalCompositeOperation = 'multiply'
  ctx.drawImage(lightingCanvas, 0, 0)

  ctx.globalCompositeOperation = 'source-over'
  ctx.drawImage(fogCanvas, 0, 0)


  // SPRITES ===========================================================================================================

  // sort from far to close
  sprites.sort((a, b) => {
    const aDist = distance(player, a)
    const bDist = distance(player, b)
    return bDist - aDist
  })

  sprites.forEach(sprite => {
    renderSprite(ctx, sprite)
  })

  // DEBUG TEXT

  ctx.fillStyle = '#FFF'
  ctx.font = '12px Courier'
  ctx.textBaseline = 'top'
  ctx.fillText(`pos: ${player.x.toFixed(2)},${player.y.toFixed(2)}`, 5, 5)
  ctx.fillText(`dir: ${player.direction.x.toFixed(2)},${player.direction.y.toFixed(2)}`, 5, 20)
  ctx.fillText(`fps: ${parseInt(fps)}`, 5, 35)

  drawMiniMap(ctx, map)
}

function input (delta) {

  if (!inputEnabled) return

  const dirPerp = perp(player.direction)

  dirPerp.x *= -1
  dirPerp.y *= -1

  if (keyDown(KEY_W)) {
    player.x += player.direction.x * moveSpeed * delta
    player.y += player.direction.y * moveSpeed * delta
  }

  if (keyDown(KEY_S)) {
    player.x -= player.direction.x * moveSpeed * delta
    player.y -= player.direction.y * moveSpeed * delta
  }

  const mouseSensitivity = 0.5
  const rotation = mouseMove.x * delta * mouseSensitivity

  if (mouseMove.x !== 0) {
    rotate(player.direction, rotation)
  }

  // strafe to the left
  if (keyDown(KEY_A)) {
    player.x -= dirPerp.x * moveSpeed * delta
    player.y -= dirPerp.y * moveSpeed * delta
  }

  // strafe to the right
  if (keyDown(KEY_D)) {
    player.x += dirPerp.x * moveSpeed * delta
    player.y += dirPerp.y * moveSpeed * delta
  }
}

requestAnimationFrame(loop)

function loop () {
  requestAnimationFrame(loop)
  // timing for input and FPS counter
  oldTime = time
  time = performance.now()
  // time the last frame took in seconds
  let delta = (time - oldTime) / 1000
  fps = 1 / delta

  if (!ready) return

  input(delta)

  // COLLISION
  const x = Math.floor(player.x)
  const y = Math.floor(player.y)

  // level bounds
  if (player.x - player.radius < 0) player.x = player.radius
  if (player.x + player.radius > map.width) player.x = map.width - player.radius

  if (player.y - player.radius < 0) player.y = player.radius
  if (player.y + player.radius > map.height) player.y = map.height - player.radius

  const tiles = [{ x, y }, ...getNeighbours(map, x, y, true)]

  tiles.forEach(({x, y}) => {
    const tile = getMap(map, x, y)
    if (isEmpty(tile)) return
    const collision = collideCircleRect(
      player,
      {
        x: tile.type === 4 ? x + 0.35 : x,
        y : tile.type === 3 ? y + 0.35 : y,
        width: tile.type === 4 ? 0.3 : 1,
        height: tile.type === 3 ? 0.3 : 1,
      },
    )
    if (collision) {
      player.x += collision.x
      player.y += collision.y
    }
  })

  render()
}

function interact () {

  // TODO always be storing this center one to use for reticle etc
  const [, euclideanRayLength, , , tile] = raycast(width / 2)

  if (euclideanRayLength < 1 && tile.type === '#') {
    changeMap()
  }
}

// TODO replace with proper connections
function changeMap () {
  if (map === map1) {
    loadMap(map2, 2.5, 2.5, 0, -1)
  } else if (map === map2) {
    loadMap(map1, 3.5, 4.5, 0, 1)
  }
}
