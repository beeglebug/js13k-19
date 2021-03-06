/**
available savings:
 - remove heatmap code
 - rename const -> let
 - fix terser properties
*/

function render () {

  renderPlay()

  if (state === STATE_TITLE) {
    renderTitle()
  }

  if (state === STATE_WIN) {
    renderWin()
  }

  if (state === STATE_DEAD) {
    renderDead()
  }

  if (state === STATE_PAUSE) {
    renderPause()
  }

  if (state === STATE_PLAY) {

    renderWeapon(ctx)
    renderHUD(ctx)

    if (interactionTarget && interactionTarget.tooltip) {
      renderTextBox(ctx, interactionTarget.tooltip, '#222423')
    }

    // renderAiDebug(outputCtx)
    renderFogOfWar(fowCtx)
    if (showMiniMap) {
      renderMiniMap(ctx, map)
    }
  }

  mouseSensitivityAdjusted && renderText(ctx, whiteFont, `mouse sensitivity: ${16 - mouseSensitivity - 1} / 15`, 4, 4)

  outputCtx.drawImage(canvas, 0, 0, width * upscale, height * upscale)

  // renderDebugText(outputCtx)
}

function renderFogOfWar (ctx) {
  drawCircle(ctx, player.x * MINI_MAP_TILE_SIZE, player.y * MINI_MAP_TILE_SIZE, 20, '#ffffff')
}

function drawCircle (ctx, x, y, radius, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.closePath()
}

function renderDead () {
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(50, 20, 220, 160)
  ctx.save()
  ctx.scale(5, 5)
  renderText(ctx, deadFont, 'YOU DIED', 17, 7)
  ctx.restore()
  mouseEnabled && renderCenteredText(ctx, whiteFont, 'click to return to title', 80)
  renderStats(76, 100)
}

function renderPause () {
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(60, 20, 200, 160)
  ctx.save()
  ctx.scale(5, 5)
  renderText(ctx, whiteFont, 'PAUSED', 21, 8)
  ctx.restore()
  mouseEnabled && renderCenteredText(ctx, whiteFont, 'click to resume', 80)
  renderControls(85, 100)
}

function renderTitle () {
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(60, 20, 200, 160)
  ctx.save()
  ctx.scale(5, 5)
  renderText(ctx, titleFont, 'ENTOMBED', 17, 7)
  ctx.restore()
  mouseEnabled && renderCenteredText(ctx, whiteFont, 'click to start', 80)
  renderControls(85, 100)
}

function renderControls (x, y) {
  renderMultiLineText(ctx, [
    'ARROWS / WASD : move',
    'E : interact',
    'left mouse : shoot',
    'right mouse : melee',
    'M : show map',
    'ESC : pause',
    '-/+ : adjust mouse sensitivity'
  ], x, y)
}

function renderWin () {
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(30, 15, 260, 170)
  ctx.save()
  ctx.scale(5, 5)
  renderText(ctx, titleFont, 'YOU ESCAPED', 11, 6)
  ctx.restore()
  mouseEnabled && renderCenteredText(ctx, whiteFont, 'click to restart', 75)
  renderStats(56, 100)
  renderAchievements(150, 100)
}

function renderStats (x, y) {
  renderText(ctx, whiteFont, 'stats', x, y)
  renderMultiLineText(ctx, Object.entries(stats).map(([key, value]) => `${key.split(/(?=[A-Z])/).join(' ')} : ${value}`), x, y + 14)
}

function renderAchievements(x, y) {
  renderText(ctx, whiteFont, 'achievements', x, y)
  Object.entries(achievements).forEach(([key, done], ix) => {
    const text = done ? `${key} - ${achievementDescriptions[key]}` : `${key} - ???`
    if (!done) ctx.globalAlpha = 0.4
    renderText(ctx, whiteFont, text, x, y + 14 + ix * 10)
    ctx.globalAlpha = 1
  })
}

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
    if (!map.sky && side === 1) {
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

      const textureIndex = map.floor
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
    interactionTarget.onInteract(interactionTarget)
  }
}

function loop () {
  requestAnimationFrame(loop)
  const delta = tick()

  TweenManager.update(delta)

  map.entities.forEach(entity => {
    if (state === STATE_PLAY) entity.update(delta)
    entity.project()
  })

  if (state === STATE_TITLE || state === STATE_WIN) {
    rotate(player.direction, 0.002)
  }

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

    collideEntities(map.entities)

    interactionTarget = getInteractionTarget(map.entities)

    // remove dead entities
    map.entities = map.entities.filter(e => e.alive)
  }

  render()
}
