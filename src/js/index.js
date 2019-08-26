/**
available savings:
 - remove heatmap code
 - rename const -> let
*/

function render () {

  lightingCtx.fillStyle = '#ffffff'
  lightingCtx.fillRect(0, 0, width, height)

  fogCtx.clearRect(0,0,width, height)

  drawFloor(ctx, map.floor)
  drawCeiling(ctx, map.ceiling)

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

  drawReticle(ctx)

  drawWeapon(ctx)

  // renderText(ctx, tombText, '#5c5f5d')

  outputCtx.drawImage(canvas, 0, 0, width * 2, height * 2)

  drawDebugText(outputCtx)
  drawMiniMap(outputCtx, map)
}

// start it high so initial click doesn't fire
let shootCoolDown = 500
const SHOOT_DELAY = 200

function shoot () {
  const offset = 0.25
  const x = player.x + player.direction.x * offset
  const y = player.y + player.direction.y * offset
  const direction = copy(player.direction)
  const speed = 10
  sprites.push({
    type: TYPE_PROJECTILE,
    source: player,
    x,
    y,
    z: 0,
    radius: 0.1,
    scale: 0.3,
    index: 2,
    speed,
    direction,
    velocity: {
      x: direction.x * speed,
      y: direction.y * speed,
    },
  })

  soundShoot()
  shootCoolDown += SHOOT_DELAY
}

requestAnimationFrame(loop)

function loop () {
  requestAnimationFrame(loop)
  // timing for input and FPS counter
  oldTime = time
  time = performance.now()
  let delta = (time - oldTime) / 1000 // time the last frame took in seconds
  fps = 1 / delta

  if (!ready) return

  handleInput(delta)

  update (player, delta)

  handleWeaponSway(time / 1000)

  // // drag towards
  // if (weapon.y !== weapon.restingY || weapon.x !== weapon.restingX) {
  //   const dx = Math.sign(weapon.x - weapon.restingX)
  //   const dy = Math.sign(weapon.y - weapon.restingY)
  //   const speed = 1
  //   weapon.x -= dx * speed
  //   weapon.y -= dy * speed
  // }

  sprites.forEach(sprite => update (sprite, delta))

  render()

  if (shootCoolDown > 0) {
    shootCoolDown -= delta * 1000
    if (shootCoolDown < 0) shootCoolDown = 0
  }
}

function update (entity, delta) {
  if (!entity.velocity) return
  entity.x += entity.velocity.x * delta
  entity.y += entity.velocity.y * delta
  if (entity.radius) {
    handleCollision(entity)
  }
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

  tiles.forEach(({ x, y }) => {
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

  sprites.forEach(sprite => {
    if (sprite === entity) return
    if (!sprite.radius) return
    if (sprite.type === TYPE_PROJECTILE && sprite.source === entity) return // ignore own projectiles
    const collision = collideCircleCircle(entity, sprite)
    if (collision) {
      emit('collide_entity_entity', entity, sprite, collision)
    }
  })

}

on('collide_entity_entity', (entity1, entity2, collision) => {
  entity1.x += collision.normal.x * collision.depth
  entity1.y += collision.normal.y * collision.depth
})

on('collide_entity_wall', (entity, wall, collision) => {

  // handle mtd
  entity.x += collision.normal.x * collision.depth
  entity.y += collision.normal.y * collision.depth

  // TODO handle different projectiles
  if (entity.type === TYPE_PROJECTILE) {
    entity.velocity.x = 0
    entity.velocity.y = 0

    // stop further collision
    entity.radius = 0

    // change sprite
    entity.index += 1

    soundImpact()
    setTimeout(() => kill(entity), 200)
  }
})

function kill (entity) {
  sprites = sprites.filter(sprite => sprite !== entity)
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
