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

  // DEBUG TEXT

  ctx.fillStyle = '#FFF'
  ctx.font = '12px Courier'
  ctx.textBaseline = 'top'
  ctx.fillText(`pos: ${player.x.toFixed(2)},${player.y.toFixed(2)}`, 5, 5)
  ctx.fillText(`dir: ${player.direction.x.toFixed(2)},${player.direction.y.toFixed(2)}`, 5, 20)
  ctx.fillText(`fps: ${parseInt(fps)}`, 5, 35)
  ctx.fillText(`sprites: ${sprites.length}`, 5, 50)

  drawMiniMap(ctx, map)
}

// start it high so initial click doesn't fire
let shootCoolDown = 500

function shoot () {
  const offset = 0.2
  const x = player.x + player.direction.x * offset
  const y = player.y + player.direction.y * offset
  const direction = copy(player.direction)
  const speed = 8
  sprites.push({
    type: TYPE_PROJECTILE,
    x,
    y,
    z: 0,
    radius: 0.1,
    scale: 0.5,
    index: 2,
    speed,
    direction,
    velocity: {
      x: direction.x * speed,
      y: direction.y * speed,
    },
  })

  shootCoolDown += 200
}

function input (delta) {

  if (!inputEnabled) return

  const dirPerp = perp(player.direction)

  dirPerp.x *= -1
  dirPerp.y *= -1

  player.velocity.x = 0
  player.velocity.y = 0

  if (keyDown(KEY_W)) {
    player.velocity.x += player.direction.x
    player.velocity.y += player.direction.y
  }

  if (keyDown(KEY_S)) {
    player.velocity.x -= player.direction.x
    player.velocity.y -= player.direction.y
  }

  const mouseSensitivity = 0.5
  const rotation = mouseMove.x * delta * mouseSensitivity

  if (mouseMove.x !== 0) {
    rotate(player.direction, rotation)
  }

  // strafe to the left
  if (keyDown(KEY_A)) {
    player.velocity.x -= dirPerp.x
    player.velocity.y -= dirPerp.y
  }

  // strafe to the right
  if (keyDown(KEY_D)) {
    player.velocity.x += dirPerp.x
    player.velocity.y += dirPerp.y
  }

  normalize(player.velocity)
  multiply(player.velocity, player.speed)

  if (mouseDown(MOUSE_LEFT)) {
    if (shootCoolDown === 0) {
      shoot()
    }
  }
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

  input(delta)

  update (player, delta)

  sprites.forEach(sprite => update (sprite, delta))

  if (shootCoolDown > 0) {
    shootCoolDown -= delta * 1000
    if (shootCoolDown < 0) shootCoolDown = 0
  }

  render()
}

function update (entity, delta) {
  if (!entity.velocity) return
  entity.x += entity.velocity.x * delta
  entity.y += entity.velocity.y * delta
  handleCollision(entity)
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
      entity.x += collision.x
      entity.y += collision.y
      emit('collide_entity_wall', entity, tile)
    }
  })
}

on('collide_entity_wall', (entity, wall) => {
  if (entity.type === TYPE_PROJECTILE) {
    kill(entity)
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
