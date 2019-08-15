const map = [
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 3, 0, 3, 0, 3, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 2, 2, 0, 2, 2, 0, 0, 0, 0, 3, 0, 3, 0, 3, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 4, 0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 4, 0, 0, 0, 0, 5, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 4, 0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 4, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]

// start position
const position = {
  x: 22,
  y: 12,
}

const playerDirection = {
  x: -1,
  y: 0,
}

const fov = 66

// camera plane
const camera = {
  x: 0,
  y: (fov / 100) * 1.33,
}

let time = 0 // time of current frame
let oldTime = 0 // time of previous frame

const width = 640
const height = 360

const canvas = document.getElementById('output')
const ctx = canvas.getContext('2d')

let fps = 0

canvas.width = width
canvas.height = height

ctx.imageSmoothingEnabled = false

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

requestAnimationFrame(loop)

const sprites = [{ x: 18, y: 12, z: 0, index: 0 }, { x: 13, y: 15, z: 0, index: 0 }]

function render() {
  let gradient

  // floor
  gradient = ctx.createLinearGradient(0, height / 2, 0, height)
  gradient.addColorStop(0, '#413d43')
  gradient.addColorStop(0.2, '#373433')
  gradient.addColorStop(1, '#373433')
  ctx.fillStyle = gradient
  ctx.fillRect(0, height / 2, width, height / 2)

  // ceiling
  gradient = ctx.createLinearGradient(0, 0, 0, height / 2)
  gradient.addColorStop(0, '#7c9dbd')
  gradient.addColorStop(1, '#a3b1bd')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height / 2)

  const sliceWidth = 1

  const zBuffer = []

  // iterate over every column of screen pixels
  for (let x = 0; x < width; x += sliceWidth) {
    // RAYCASTING ======================================================================================================

    let rayLength
    let side
    let collision = false

    // calculate ray position and direction

    // -1 is left edge, 1 is right edge
    let nx = (2 * x) / width - 1

    let rayX = position.x
    let rayY = position.y

    let rayDirX = playerDirection.x + camera.x * nx
    let rayDirY = playerDirection.y + camera.y * nx

    // which map cell are we in
    let mapX = Math.floor(rayX)
    let mapY = Math.floor(rayY)

    let deltaX = Math.abs(1 / rayDirX)
    let deltaY = Math.abs(1 / rayDirY)

    // calculate increments for DDA
    let stepX
    let stepY

    let distanceX
    let distanceY

    if (rayDirX < 0) {
      stepX = -1
      distanceX = (rayX - mapX) * deltaX
    } else {
      stepX = 1
      distanceX = (mapX + 1 - rayX) * deltaX
    }

    if (rayDirY < 0) {
      stepY = -1
      distanceY = (rayY - mapY) * deltaY
    } else {
      stepY = 1
      distanceY = (mapY + 1 - rayY) * deltaY
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
      if (mapX < 0 || mapX >= map[0].length || mapY < 0 || mapY >= map.length) break
      // Check if ray has hit a wall
      if (getMap(mapX, mapY) > 0) {
        collision = true
        break
      }
    }

    if (!collision) {
      zBuffer.push(null)
      continue
    }

    // Calculate distance projected on camera direction (Euclidean distance will give fisheye effect!)
    if (side === 0) {
      rayLength = (mapX - rayX + (1 - stepX) / 2) / rayDirX
    } else {
      rayLength = (mapY - rayY + (1 - stepY) / 2) / rayDirY
    }

    // where exactly the wall was hit
    let wallX
    if (side === 0) {
      wallX = rayY + rayLength * rayDirY
    } else {
      wallX = rayX + rayLength * rayDirX
    }
    // we only need to know the 0-1 range
    wallX -= Math.floor(wallX)

    // // flip if the wall is opposite
    if (side === 0 && rayDirX > 0) wallX = 1 - wallX
    if (side === 1 && rayDirY < 0) wallX = 1 - wallX

    // TODO rename to avoid waste
    const distance = rayLength

    zBuffer.push(distance)

    // DRAW WALLS ======================================================================================================

    // Calculate height of line to draw on screen
    let sliceHeight = Math.abs(Math.floor(height / distance))

    // calculate lowest and highest pixel to fill in current stripe
    let drawStart = Math.floor((height - sliceHeight) / 2)

    // x coordinate on the texture
    const textureSize = 16
    const textureX = wallX * (textureSize - 1)

    ctx.drawImage(imgTextures, textureX, 0, 1, textureSize, x, drawStart, sliceWidth, sliceHeight)

    // LIGHTING ========================================================================================================

    // give horizontal and vertical sides different brightness
    if (side === 1) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(x, drawStart, sliceWidth, sliceHeight)
    }

    // const range = 16
    // const clampedDistance = Math.min(distance, range)
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
    const aDist = distance(position, a)
    const bDist = distance(position, b)
    return bDist - aDist
  })

  sprites.forEach(sprite => {
    // translate sprite position to relative to camera
    const spriteX = sprite.x - position.x
    const spriteY = sprite.y - position.y

    const invDet = 1 / (camera.x * playerDirection.y - playerDirection.x * camera.y)

    const transformX = invDet * (playerDirection.y * spriteX - playerDirection.x * spriteY)
    const transformY = invDet * (-camera.y * spriteX + camera.x * spriteY)

    const spriteScreenX = Math.round((width / 2) * (1 + transformX / transformY))

    // calculate height of the sprite on screen
    const spriteHeight = Math.abs(Math.round(height / transformY))

    // calculate lowest and highest pixel to fill in current stripe
    let drawStartY = -spriteHeight / 2 + height / 2
    let drawEndY = spriteHeight / 2 + height / 2

    // calculate width of the sprite
    const spriteWidth = Math.abs(height / transformY)

    let drawStartX = Math.floor(-spriteWidth / 2 + spriteScreenX)
    if (drawStartX < 0) drawStartX = 0

    let drawEndX = spriteWidth / 2 + spriteScreenX
    if (drawEndX >= width) drawEndX = width

    // loop through every vertical stripe of the sprite on screen
    for (let stripe = drawStartX; stripe < drawEndX; stripe++) {
      const textureSize = 16

      const textureX =
        ((stripe - (-spriteWidth / 2 + spriteScreenX)) * textureSize) / spriteWidth + sprite.index * textureSize
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
  ctx.fillStyle = '#FFF'
  ctx.font = '12px Courier'
  ctx.textBaseline = 'top'
  ctx.fillText(`pos: ${position.x.toFixed(2)},${position.y.toFixed(2)}`, 5, 5)
  ctx.fillText(`dir: ${playerDirection.x.toFixed(2)},${playerDirection.y.toFixed(2)}`, 5, 20)
  ctx.fillText(`mouse: ${mouseMove.x.toFixed(2)},${mouseMove.y.toFixed(2)}`, 5, 35)
  ctx.fillText(`fps: ${parseInt(fps)}`, 5, 50)
  //endRemoveIf
}

function getMap(x, y) {
  const ix = Math.round(x)
  const iy = Math.round(y)
  return map[ix] && map[ix][iy]
}

// TODO mouse rotation
function input(delta) {
  if (!inputEnabled) return

  const moveSpeed = delta * 3 // tiles per second
  const dirPerp = perp(playerDirection)

  // TODO proper collision

  if (keyDown(KEY_W)) {
    position.x += playerDirection.x * moveSpeed
    position.y += playerDirection.y * moveSpeed
  }

  if (keyDown(KEY_S)) {
    position.x -= playerDirection.x * moveSpeed
    position.y -= playerDirection.y * moveSpeed
  }

  const mouseSensitivity = 0.5
  const rotation = mouseMove.x * delta * mouseSensitivity

  if (mouseMove.x !== 0) {
    rotate(playerDirection, -rotation)
    rotate(camera, -rotation)
  }

  // strafe to the right
  if (keyDown(KEY_D)) {
    position.x += dirPerp.x * moveSpeed
    position.y += dirPerp.y * moveSpeed
  }

  // strafe to the left
  if (keyDown(KEY_A)) {
    position.x -= dirPerp.x * moveSpeed
    position.y -= dirPerp.y * moveSpeed
  }
}

function loop() {
  requestAnimationFrame(loop)
  // timing for input and FPS counter
  oldTime = time
  time = performance.now()
  let delta = (time - oldTime) / 1000.0 // delta is the time this frame has taken, in seconds
  fps = 1 / delta
  input(delta)

  // COLLISION

  // TEST heading towards player
  // sprites.forEach(sprite => {
  //   let dx = position.x - sprite.x
  //   let dy = position.y - sprite.y
  //   const m = Math.sqrt((dx * dx) + (dy * dy))
  //   dx /= m
  //   dy /= m
  //   const speed = 0.01
  //   sprite.x += dx * speed
  //   sprite.y += dy * speed
  // })

  render()
}
