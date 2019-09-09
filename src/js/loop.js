/**
available savings:
 - remove heatmap code
 - rename const -> let
 - 800b of epitaph code
 - fix terser properties
*/

function render () {
  if (state === STATE_TITLE) renderTitle()
  if (state === STATE_PAUSE) renderPause()
  if (state === STATE_DEAD) renderDead()
  if (state === STATE_PLAY) renderPlay()

  if (state === STATE_PLAY) {
    // renderAiDebug(outputCtx)
    renderFogOfWar(fowCtx)
    if (showMiniMap) {
      renderMiniMap(ctx, map)
    }
  }

  outputCtx.drawImage(canvas, 0, 0, width * upscale, height * upscale)

  // renderDebugText(outputCtx)
}

function renderAiDebug (ctx) {

  miniMapCtx.clearRect(0, 0, width, height)
  miniMapCtx.drawImage(mapCanvas, 0, 0)

  drawCircle(miniMapCtx, player.x * MINI_MAP_TILE_SIZE, player.y * MINI_MAP_TILE_SIZE, 1.5, '#ff0011')

  miniMapCtx.strokeStyle = '#ff0011'
  drawLine(
    miniMapCtx,
    player.x * MINI_MAP_TILE_SIZE,
    player.y * MINI_MAP_TILE_SIZE,
    (player.x + player.direction.x * 2) * MINI_MAP_TILE_SIZE,
    (player.y + player.direction.y * 2) * MINI_MAP_TILE_SIZE
  )

  map.entities.forEach(entity => {
    drawCircle(miniMapCtx, entity.x, entity.y, 1.5, '#ff9f00')
    miniMapCtx.strokeStyle = '#ff9f00'
    drawLine(
      miniMapCtx,
      entity.x * MINI_MAP_TILE_SIZE,
      entity.y * MINI_MAP_TILE_SIZE,
      (entity.x + entity.direction.x * 2) * MINI_MAP_TILE_SIZE,
      (entity.y + entity.direction.y * 2) * MINI_MAP_TILE_SIZE
    )
    if (entity.target) {
      drawCircle(miniMapCtx, entity.target.x * MINI_MAP_TILE_SIZE, entity.target.y * MINI_MAP_TILE_SIZE, 1.5, '#baffad')
    }
  })

  miniMapCtx.restore()

  const ox = Math.floor(width - map.width / 2)
  const oy = Math.floor(height - map.height / 2)

  ctx.drawImage(miniMapCanvas, ox, oy)
}

function renderFogOfWar (ctx) {
  drawCircle(ctx, player.x * MINI_MAP_TILE_SIZE, player.y * MINI_MAP_TILE_SIZE, 20, '#ffffff')
}

function drawLine (ctx, fromX, fromY, toX, toY) {
  ctx.beginPath()
  ctx.moveTo(fromX, fromY)
  ctx.lineTo(toX, toY)
  ctx.stroke()
}

function drawCircle (ctx, x, y, radius, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.closePath()
}

function renderDead () {
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, width, height)
  ctx.save()
  ctx.scale(2, 2)
  ctx.translate(-width/4, -height/4)
  renderCenteredText(ctx, redFont, 'YOU DIED', (height / 2) - 5)
  ctx.restore()
}

function renderPause () {
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, width, height)
  renderCenteredText(ctx, whiteFont, 'paused', 70)
  renderCenteredText(ctx, whiteFont, 'click to resume', 90)
}

function renderTitle () {
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, width, height)
  renderCenteredText(ctx, redFont, 'TITLE GOES HERE', 50)
  renderCenteredText(ctx, whiteFont, 'click to start', 85)
  renderCenteredText(ctx, whiteFont, 'Controls', 120)
  // padded to center the colon
  renderCenteredText(ctx, whiteFont, '   WASD : move    ', 130)
  renderCenteredText(ctx, whiteFont, '      E : interact', 140)
  renderCenteredText(ctx, whiteFont, '  CLICK : shoot   ', 150)
  renderCenteredText(ctx, whiteFont, '      M : map     ', 160)
}

let debug = false

function renderPlay () {

  lightingCtx.fillStyle = '#ffffff'
  lightingCtx.fillRect(0, 0, width, height)

  fogCtx.clearRect(0,0,width, height)

  // reset
  floorImageData = new ImageData(width, height)

  map.sky && renderSky(ctx, map.sky)

  zBuffer = []

  // adjust camera plane based on current player direction
  perp(player.direction, camera)

  // scale to correct fov
  multiply(camera, (fov / 100) * 1.33)

  // iterate over every column of screen pixels
  for (let x = 0; x < width; x += 1) {

    // RAYCASTING ======================================================================================================

    const ray = rayFromPlayer(x)
    const [tile, rayLength, euclideanRayLength, side, wallX] = raycast(ray)

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
    let drawEnd = drawStart + sliceHeight

    if (tile.flashing) {

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(x, drawStart, 1, sliceHeight)

    } else {

      const textureIndex = textureIndexByTileType[tile.type]

      let offset = 0
      if (tile.offset) {
        if (side === 0 && ray.direction.x > 0) offset = tile.offset
        if (side === 0 && ray.direction.x < 0) offset = -tile.offset
        if (side === 1 && ray.direction.y > 0) offset = tile.offset
        if (side === 1 && ray.direction.y < 0) offset = -tile.offset
      }

      let textureX = Math.floor((wallX + textureIndex + offset) * textureSize)

      ctx.drawImage(imgTextures, textureX, 0, 1, textureSize, x, drawStart, 1, sliceHeight)
    }

    // LIGHTING ========================================================================================================

    // give horizontal and vertical sides different brightness
    if (side === 1) {
      lightingCtx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      lightingCtx.fillRect(x, drawStart, 1, sliceHeight)
    }

    let eased = 1
    if (map.fog) {
      const min = 5
      const max = map.fogDistance || 30

      const clamped = clamp(euclideanRayLength, min, max)
      const normalised = remap(clamped, min, max, 0, 1)
      eased = outQuad(normalised)

      const [r, g, b] = map.fog
      fogCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${eased})`
      fogCtx.fillRect(x, drawStart, 1, sliceHeight)
    }

    // FLOOR CASTING ===================================================================================================

    // x, y position of the floor texel at the bottom of the wall
    let floorXWall
    let floorYWall

    // TODO maybe improve?
    let offsetX = 0
    let offsetY = 0
    if (isVerticalDoor(tile)) offsetX = 0.5
    if (isHorizontalDoor(tile)) offsetY = 0.5

    // 4 different wall directions possible
    if (side === 0) {
      if (ray.direction.x > 0) {
        floorXWall = tile.x + offsetX
        floorYWall = tile.y + wallX + offsetY
      } else {
        floorXWall = tile.x + 1 - offsetX
        floorYWall = tile.y + 1 - wallX + offsetY
      }
    } else {
      if (ray.direction.y > 0) {
        floorXWall = tile.x + 1 - wallX + offsetX
        floorYWall = tile.y + offsetY
      } else {
        floorXWall = tile.x + wallX + offsetX
        floorYWall = tile.y + 1 - offsetY
      }
    }

    // draw the floor from drawEnd to the bottom of the screen
    for (let y = drawEnd; y < height; y++) {

      let currentDist = height / (2 * y - height)

      let weight = currentDist / rayLength

      let currentFloorX = (weight * floorXWall + (1 - weight) * ray.x)
      let currentFloorY = (weight * floorYWall + (1 - weight) * ray.y)

      // TODO get from map
      const textureIndex = 5
      let floorTexX = Math.floor(currentFloorX * textureSize) % textureSize + (textureSize * textureIndex)
      let floorTexY = Math.floor(currentFloorY * textureSize) % textureSize

      const sourceIndex = ((imgTextures.width * floorTexY) + floorTexX) * 4

      // TODO lighting

      const destFloorIndex = (width * y + x) * 4
      copyPixel(textureImageData, sourceIndex, floorImageData, destFloorIndex)

      if (!map.sky) {
        const flipY = height - y - 1
        const destCeilIndex = (width * flipY + x) * 4
        copyPixel(textureImageData, sourceIndex, floorImageData, destCeilIndex)
      }
    }
  }

  floorCtx.clearRect(0, 0, width, height)
  floorCtx.putImageData(floorImageData, 0, 0)
  ctx.drawImage(floorCanvas, 0, 0)

  // APPLY LIGHTING ====================================================================================================

  ctx.globalCompositeOperation = 'multiply'
  ctx.drawImage(lightingCanvas, 0, 0)

  ctx.globalCompositeOperation = 'source-over'
  ctx.drawImage(fogCanvas, 0, 0)


  // ENTITIES (SPRITES) ================================================================================================

  map.entities.forEach(entity => {
    renderEntity(ctx, entity)
  })

  renderWeapon(ctx)
  renderHUD(ctx)

  if (interactionTarget && interactionTarget.tooltip) {
    renderTextBox(ctx, interactionTarget.tooltip, '#222423')
  }
}

function copyPixel (sourceData, sourceIndex, destData, destIndex) {
  destData.data[destIndex] = sourceData.data[sourceIndex]
  destData.data[destIndex + 1] = sourceData.data[sourceIndex + 1]
  destData.data[destIndex + 2] = sourceData.data[sourceIndex + 2]
  destData.data[destIndex + 3] = 255
}

function getInteractionTarget (entities) {

  const interactionDistance = 1.5

  const entity = entities.find(entity => {
    if (!entity.onInteract || entity.transformY <= 0 || entity.transformY > interactionDistance) return
    const cursorX = width / 2
    const halfWidth = entity.screenWidth / 2
    return cursorX > entity.screenX - halfWidth && cursorX < entity.screenX + halfWidth
  })

  if (entity) return entity

  const [tile,rayLength] = raycast(rayFromPlayer(160))

  if (rayLength < interactionDistance && (isDoor(tile))) {
    return tile
  }
}

// TODO handle interactive tiles (map changing)
function interact () {
  if (interactionTarget) {
    emit(interactionTarget.onInteract, interactionTarget)
  }
}

function loop () {
  requestAnimationFrame(loop)
  const delta = tick()

  TweenManager.update(delta)

  if (state === STATE_PLAY) {

    handleInput(delta)

    player.update(delta)

    const mapX = Math.floor(player.x)
    const mapY = Math.floor(player.y)

    if (mapX !== player.mapX || mapY !== player.mapY) {
      influenceMap = createInfluenceMap(map)
      populateInfluenceMap(influenceMap, { x: mapX, y: mapY })
    }

    player.mapX = mapX
    player.mapY = mapY

    handleWeaponSway(time / 1000)

    // sort from far to close
    map.entities.sort(byDistanceToPlayer).reverse()

    map.entities.forEach(entity => {
      entity.update(delta)
      entity.project()
    })

    collideEntities(map.entities)

    interactionTarget = getInteractionTarget(map.entities)

    // remove dead entities
    map.entities = map.entities.filter(e => e.alive)
  }

  render()
}
