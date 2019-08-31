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
  renderText(ctx, 'click to play')
}

function renderPlay () {

  lightingCtx.fillStyle = '#ffffff'
  lightingCtx.fillRect(0, 0, width, height)

  fogCtx.clearRect(0,0,width, height)

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
  }

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
