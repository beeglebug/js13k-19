
// start player
const player = {
  x: 1.5,
  y: 5.5,
  radius: 0.4,
  direction: {
    x: 0.7,
    y: -0.7,
  }
}

const moveSpeed = 4

const fov = 66

// camera plane
const camera = { x: 0, y: 0 }

let time = 0 // time of current frame
let oldTime = 0 // time of previous frame
let fps = 0

const width = 640
const height = 360

const [canvas, ctx] = createCanvas(width, height)
const [lightingCanvas, lightingCtx] = createCanvas(width, height)

document.getElementById('container').appendChild(canvas)

canvas.after(lightingCanvas)

let inputEnabled = false

const handlePointerLockChange = () => {
  if (document.pointerLockElement === canvas) {
    inputEnabled = true
    canvas.classList.add('active')
  } else {
    inputEnabled = false
    canvas.classList.remove('active')
  }
}

canvas.addEventListener('click', () => canvas.requestPointerLock())
document.addEventListener('pointerlockchange', handlePointerLockChange)

bindKeyboard(document)

const imgTextures = new Image()
imgTextures.src = 'textures.png'

const imgSprites = new Image()
imgSprites.src = 'sprites.png'

const sprites = [
  { x: 9.5, y: 8.5, index: 0 },
]

function render () {

  lightingCtx.fillStyle = '#ffffff'
  lightingCtx.fillRect(0, 0, width, height)

  drawFloor()
  drawCeiling()

  const sliceWidth = 1

  const zBuffer = []

  // adjust camera plane based on current player direction
  perp(player.direction, camera)

  camera.x *= (fov / 100) * 1.33
  camera.y *= (fov / 100) * 1.33

  // iterate over every column of screen pixels
  for (let x = 0; x < width; x += sliceWidth) {

    // RAYCASTING ======================================================================================================

    let rayLength
    let side
    let collision = false

    // calculate ray player and direction

    // -1 is left edge, 1 is right edge
    let nx = (2 * x) / width - 1

    const ray = {
      x: player.x,
      y: player.y,
      direction: {
        x: player.direction.x + camera.x * -nx,
        y: player.direction.y + camera.y * -nx
      }
    }

    // which map cell are we in
    let mapX = Math.floor(ray.x)
    let mapY = Math.floor(ray.y)

    let deltaX = Math.abs(1 / ray.direction.x)
    let deltaY = Math.abs(1 / ray.direction.y)

    // calculate increments for DDA
    let stepX
    let stepY

    let distanceX
    let distanceY

    // id of the tile we last touched
    let tile

    if (ray.direction.x < 0) {
      stepX = -1
      distanceX = (ray.x - mapX) * deltaX
    } else {
      stepX = 1
      distanceX = (mapX + 1 - ray.x) * deltaX
    }

    if (ray.direction.y < 0) {
      stepY = -1
      distanceY = (ray.y - mapY) * deltaY
    } else {
      stepY = 1
      distanceY = (mapY + 1 - ray.y) * deltaY
    }

    // DDA
    while (true) {

      if (distanceX < distanceY) {
        distanceX += deltaX
        mapX += stepX
        side = 0
      } else {
        distanceY += deltaY
        mapY += stepY
        side = 1
      }

      // handle out of bounds to avoid infinite loop
      if (mapX < 0 || mapX >= mapWidth || mapY < 0 || mapY >= mapHeight) break

      // Check if ray has hit a wall
      tile = getMap(mapX, mapY)

      // thin walls
      // TODO optimise and make more generic
      if (tile === 3) {
        // half way down the block
        const start = { x: mapX, y: mapY + 0.5 }
        const end = { x: mapX + 1, y: mapY + 0.5 }
        const intersects = rayLineSegmentIntersection(ray, start, end)
        if (!intersects) continue
        // the ray length is where we intersected
        rayLength = intersects
        side = 1
        collision = true
        break
      } else if (tile === 4) {
        // half way down the block
        const start = { x: mapX + 0.5, y: mapY }
        const end = { x: mapX + 0.5, y: mapY + 1 }
        const intersects = rayLineSegmentIntersection(ray, start, end)
        if (!intersects) continue
        // the ray length is where we intersected
        rayLength = intersects
        side = 0
        collision = true
        break
      } else if (tile !== null) {
        collision = true
        break
      }
    }

    if (!collision) {
      zBuffer.push(null)
      continue
    }

    if (rayLength === undefined) {
      // Calculate distance projected on camera direction (Euclidean distance will give fisheye effect!)
      if (side === 0) {
        rayLength = (mapX - ray.x + (1 - stepX) / 2) / ray.direction.x
      } else {
        rayLength = (mapY - ray.y + (1 - stepY) / 2) / ray.direction.y
      }
    }

    // where exactly the wall was hit
    let wallX
    if (side === 0) {
      wallX = ray.y + rayLength * ray.direction.y
    } else {
      wallX = ray.x + rayLength * ray.direction.x
    }
    // we only need to know the 0-1 range
    wallX -= Math.floor(wallX)

    // // flip if the wall is opposite
    if (side === 0 && ray.direction.x > 0) wallX = 1 - wallX
    if (side === 1 && ray.direction.y < 0) wallX = 1 - wallX

    zBuffer.push(rayLength)

    // DRAW WALLS ======================================================================================================

    // Calculate height of line to draw on screen
    let sliceHeight = Math.abs(Math.floor(height / rayLength))

    // calculate lowest and highest pixel to fill in current stripe
    let drawStart = Math.floor((height - sliceHeight) / 2)

    // TODO second row of sprites (or just do single row?)
    const textureSize = 16
    const textureIndex = textureIndexByTileId[tile]
    const textureX = wallX * (textureSize - 1) + textureIndex * textureSize

    ctx.drawImage(imgTextures, textureX, 0, 1, textureSize, x, drawStart, sliceWidth, sliceHeight)

    // LIGHTING ========================================================================================================

    // give horizontal and vertical sides different brightness
    if (side === 1) {
      lightingCtx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      lightingCtx.fillRect(x, drawStart, sliceWidth, sliceHeight)
    }

    // const range = 16
    // const clampedDistance = Math.min(rayLength, range)
    //
    // let tint = clampedDistance / range
    // if (side === 1) tint += 0.1
    // const eased = outQuad(tint)
    //
    // ctx.fillStyle = "rgba(22,23,26, " + eased + ")"
    // ctx.fillRect(x, drawStart, sliceWidth, sliceHeight)
  }

  // SPRITES ===========================================================================================================

  // sort from far to close
  sprites.sort((a, b) => {
    const aDist = distance(player, a)
    const bDist = distance(player, b)
    return bDist - aDist
  })

  sprites.forEach(sprite => {
    // translate sprite player to relative to camera
    const spriteX = sprite.x - player.x
    const spriteY = sprite.y - player.y

    const invDet = 1 / (camera.x * player.direction.y - player.direction.x * camera.y)

    const transformX = invDet * (player.direction.y * spriteX - player.direction.x * spriteY) * -1
    const transformY = invDet * (-camera.y * spriteX + camera.x * spriteY)

    const spriteScreenX = Math.round((width / 2) * (1 + transformX / transformY))

    // calculate height of the sprite on screen
    const spriteHeight = Math.abs(Math.round(height / transformY))

    // calculate lowest and highest pixel to fill in current stripe
    let drawStartY = -spriteHeight / 2 + height / 2
    let drawEndY = spriteHeight / 2 + height / 2

    // calculate width of the sprite
    const spriteWidth = Math.abs(height / transformY)

    let drawStartX = Math.round(-spriteWidth / 2 + spriteScreenX)
    if (drawStartX < 0) drawStartX = 0

    let drawEndX = spriteWidth / 2 + spriteScreenX
    if (drawEndX >= width) drawEndX = width

    // loop through every vertical stripe of the sprite on screen
    for (let stripe = drawStartX; stripe < drawEndX; stripe++) {
      const textureSize = 16

      const textureX = ((stripe - (-spriteWidth / 2 + spriteScreenX)) * textureSize) / spriteWidth + sprite.index * textureSize
      const textureY = 0
      const buffer = zBuffer[stripe]

      if (
        transformY > 0 && // in front of the camera
        stripe >= 0 &&
        stripe < width && // somewhere on screen
        (buffer === null || buffer > transformY)
      ) {
        // TODO lighting based on distance
        ctx.drawImage(imgSprites, textureX, textureY, 1, 16, stripe, drawStartY, 1, drawEndY - drawStartY)
      }
    }
  })

  //removeIf(production)

  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.drawImage(lightingCanvas, 0, 0)
  ctx.restore()

  // DEBUG TEXT

  ctx.fillStyle = '#FFF'
  ctx.font = '12px Courier'
  ctx.textBaseline = 'top'
  ctx.fillText(`pos: ${player.x.toFixed(2)},${player.y.toFixed(2)}`, 5, 5)
  ctx.fillText(`dir: ${player.direction.x.toFixed(2)},${player.direction.y.toFixed(2)}`, 5, 20)
  ctx.fillText(`mouse: ${mouseMove.x.toFixed(2)},${mouseMove.y.toFixed(2)}`, 5, 35)
  ctx.fillText(`fps: ${parseInt(fps)}`, 5, 50)

  // MINIMAP

  let size = 5
  const ox = width - (mapWidth * size) - 10
  const oy = 10

  ctx.save()
  ctx.translate(ox, oy)
  ctx.globalAlpha = 0.5

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, mapWidth * size, mapHeight * size)

  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      const tile = map[y][x]
      if (tile === null) continue
      const colorsByTileId = {
        '-': '#333333',
        '#': '#33cec2',
      }
      ctx.fillStyle = colorsByTileId[tile]
      ctx.fillRect(x * size, y * size, size, size)
    }
  }

  ctx.fillStyle = '#ff0000'
  ctx.beginPath()
  ctx.arc(player.x * size, player.y * size, player.radius * size, 0, Math.PI * 2)
  ctx.fill()
  ctx.closePath()

  ctx.strokeStyle = '#ff0000'
  ctx.beginPath()
  ctx.moveTo(player.x * size, player.y * size)
  ctx.lineTo((player.x + player.direction.x * 2) * size, (player.y + player.direction.y * 2) * size)
  ctx.stroke()
  ctx.closePath()

  sprites.forEach(sprite => {
    ctx.fillStyle = '#007eff'
    ctx.beginPath()
    ctx.arc(sprite.x * size, sprite.y * size, player.radius * size, 0, Math.PI * 2)
    ctx.fill()
    ctx.closePath()
  })

  ctx.restore()
  //endRemoveIf
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
  // timing for input and FPS counter
  oldTime = time
  time = performance.now()
  // time the last frame took in seconds
  let delta = (time - oldTime) / 1000
  fps = 1 / delta

  input(delta)

  // COLLISION
  const tx = Math.floor(player.x)
  const ty = Math.floor(player.y)

  // level bounds
  if (player.x - player.radius < 0) player.x = player.radius
  if (player.x + player.radius > mapWidth) player.x = mapWidth - player.radius

  if (player.y - player.radius < 0) player.y = player.radius
  if (player.y + player.radius > mapHeight) player.y = mapHeight - player.radius

  const tiles = [[tx, ty], ...getSurrounding(tx, ty)]

  tiles.forEach(([x, y]) => {
      const tile = getMap(x, y)
      if (!tile) return

      const collision = collideCircleRect(
        player,
        {
          x: tile === 4 ? x + 0.35 : x,
          y : tile === 3 ? y + 0.35 : y,
          width: tile === 4 ? 0.3 : 1,
          height: tile === 3 ? 0.3 : 1,
        },
      )

      if (collision) {
        player.x += collision.x
        player.y += collision.y
      }
    })

  // walk towards player
  // sprites.forEach(sprite => {
  //   let dx = player.x - sprite.x
  //   let dy = player.y - sprite.y
  //   const m = Math.sqrt((dx * dx) + (dy * dy))
  //   dx /= m
  //   dy /= m
  //   const speed = 0.01
  //   sprite.x += dx * speed
  //   sprite.y += dy * speed
  // })

  render()

  requestAnimationFrame(loop)
}
