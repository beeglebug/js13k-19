/**
available savings:
 - remove heatmap code
 - rename const -> let
*/

function render () {
  if (state === STATE_TITLE) renderTitle()
  if (state === STATE_PLAY) renderPlay()

  outputCtx.drawImage(canvas, 0, 0, width * 2, height * 2)

  // renderDebugText(outputCtx)

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

    interactionTarget = getInteractionTarget(map.entities)

    if (shootCoolDown > 0) {
      shootCoolDown -= delta * 1000
      if (shootCoolDown < 0) shootCoolDown = 0
    }
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

function handleCollision (entity) {

  const x = Math.floor(entity.x)
  const y = Math.floor(entity.y)

  // level bounds
  if (entity.x - entity.radius < 0) entity.x = entity.radius
  if (entity.x + entity.radius > map.width) entity.x = map.width - entity.radius

  if (entity.y - entity.radius < 0) entity.y = entity.radius
  if (entity.y + entity.radius > map.height) entity.y = map.height - entity.radius

  const tiles = [{ x, y }, ...getNeighbours(map, x, y, true)]

  tiles.filter(Boolean).forEach(({ x, y }) => {
    const tile = getMap(map, x, y)
    if (isEmpty(tile)) return
    const collision = collideCircleRect(
      entity,
      {
        x: tile.type === 4 ? x + 0.35 : x,
        y: tile.type === 3 ? y + 0.35 : y,
        width: tile.type === 4 ? 0.3 : 1,
        height: tile.type === 3 ? 0.3 : 1,
      },
    )
    if (collision) {
      emit('collide_entity_wall', entity, tile, collision)
    }
  })

  map.entities.forEach(otherEntity => {
    if (otherEntity === entity) return
    if (!otherEntity.radius) return
    if (entity instanceof Bullet && otherEntity.collectible) return //bullets cant hit collectibles
    if (otherEntity instanceof Bullet && otherEntity.source === entity) return // ignore own projectiles
    const collision = collideCircleCircle(entity, otherEntity)
    if (collision) {
      emit('collide_entity_entity', entity, otherEntity, collision)
    }
  })

}

// TODO handle interactive tiles (map changing)
function interact () {
  if (interactionTarget) {
    emit(interactionTarget.onInteract, interactionTarget)
  }
}
