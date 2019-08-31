/**
available savings:
 - remove heatmap code
 - rename const -> let
*/

function render () {
  if (state === STATE_TITLE) renderTitle()
  if (state === STATE_PLAY) renderPlay()

  outputCtx.drawImage(canvas, 0, 0, width * 2, height * 2)

  if (state === STATE_PLAY) renderDebugText(outputCtx)

  showMiniMap && renderMiniMap(outputCtx, map)
}

function renderTitle () {
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, width, height)
  renderText(ctx, 'click to play')
}

function renderPlay () {

  lightingCtx.fillStyle = '#ffffff'
  lightingCtx.fillRect(0, 0, width, height)

  fogCtx.clearRect(0,0,width, height)

  // reset
  floorImageData = new ImageData(width, height)

  renderFloor(ctx, map.floor)
  renderCeiling(ctx, map.ceiling)

  zBuffer = []

  // adjust camera plane based on current player direction
  perp(player.direction, camera)

  // scale to correct fov
  multiply(camera, (fov / 100) * 1.33)

  // iterate over every column of screen pixels
  for (let x = 0; x < width; x += 1) {

    // RAYCASTING ======================================================================================================

    const [ray, rayLength, euclideanRayLength, side, mapX, mapY, wallX, tile] = raycast(x)

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

    const textureSize = 16
    const textureIndex = textureIndexByTileType[tile.type]
    const textureX = Math.floor(wallX * textureSize + textureIndex * textureSize)

    ctx.drawImage(imgTextures, textureX, 0, 1, textureSize, x, drawStart, 1, sliceHeight)

    // LIGHTING ========================================================================================================

    // give horizontal and vertical sides different brightness
    if (side === 1) {
      lightingCtx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      lightingCtx.fillRect(x, drawStart, 1, sliceHeight)
    }

    if (map.fog) {
      const min = 5
      const max = map.fogDistance || 30

      const clamped = clamp(euclideanRayLength, min, max)
      const normalised = remap(clamped, min, max, 0, 1)
      const eased = outQuad(normalised)

      const [r, g, b] = hexToRgb(map.fog)
      fogCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${eased})`
      fogCtx.fillRect(x, drawStart, 1, sliceHeight)
    }

    // FLOOR CASTING ===================================================================================================

    // x, y position of the floor texel at the bottom of the wall
    let floorXWall
    let floorYWall

    // 4 different wall directions possible
    if (side === 0 && ray.direction.x > 0) {
      floorXWall = mapX
      floorYWall = mapY + wallX
    } else if (side === 0 && ray.direction.x < 0) {
      floorXWall = mapX + 1
      floorYWall = mapY + 1 - wallX
    } else if (side === 1 && ray.direction.y > 0) {
      floorXWall = mapX + 1 - wallX
      floorYWall = mapY
    } else {
      floorXWall = mapX + wallX
      floorYWall = mapY + 1
    }

    // draw the floor from drawEnd to the bottom of the screen
    for (let y = drawEnd; y < height; y++) {

      let currentDist = height / (2 * y - height)

      let weight = currentDist / rayLength

      let currentFloorX = weight * floorXWall + (1 - weight) * ray.x
      let currentFloorY = weight * floorYWall + (1 - weight) * ray.y

      // TODO get from map
      const textureIndex = 5
      let floorTexX = Math.floor(currentFloorX * textureSize) % textureSize + (textureSize * textureIndex)
      let floorTexY = Math.floor(currentFloorY * textureSize) % textureSize

      const sourceIndex = ((imgTextures.width * floorTexY) + floorTexX) * 4
      const destIndex = (width * y + x) * 4

      floorImageData.data[destIndex] = textureImageData.data[sourceIndex]
      floorImageData.data[destIndex + 1] = textureImageData.data[sourceIndex + 1]
      floorImageData.data[destIndex + 2] = textureImageData.data[sourceIndex + 2]
      floorImageData.data[destIndex + 3] = 255
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

  renderHUD(ctx)
  renderWeapon(ctx)


  if (interactionTarget && interactionTarget.tooltip) {
    renderText(ctx, interactionTarget.tooltip, '#222423')
  }
}

function loop () {
  requestAnimationFrame(loop)
  const delta = tick()

  if (state === STATE_TITLE) {

  }


  if (state === STATE_PLAY) {

    handleInput(delta)

    player.update(delta)

    handleWeaponSway(time / 1000)

    // sort from far to close
    map.entities.sort((a, b) => {
      const aDist = distance(player, a)
      const bDist = distance(player, b)
      return bDist - aDist
    })

    map.entities.forEach(entity => {
      entity.update(delta)
      entity.project()
    })

    collideEntities(map.entities)

    interactionTarget = getInteractionTarget(map.entities)

    if (shootCoolDown > 0) {
      shootCoolDown -= delta * 1000
      if (shootCoolDown < 0) shootCoolDown = 0
    }

    // remove dead entities
    map.entities = map.entities.filter(e => e.alive)
  }

  render()
}

function getInteractionTarget (entities) {
  return entities.find(entity => {
    if (!entity.onInteract || entity.transformY <= 0 || entity.transformY > 1) return
    const cursorX = width / 2
    const halfWidth = entity.screenWidth / 2
    return cursorX > entity.screenX - halfWidth && cursorX < entity.screenX + halfWidth
  })
}

// TODO handle interactive tiles (map changing)
function interact () {
  if (interactionTarget) {
    emit(interactionTarget.onInteract, interactionTarget)
  }
}
