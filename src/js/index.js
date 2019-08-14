const map = [
  [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [0,0,0,0,0,0,2,2,2,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1],
  [0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,3,0,0,0,3,0,0,0,1],
  [0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [0,0,0,0,0,0,2,2,0,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,4,0,0,0,0,5,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,4,0,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
]

// start position
const position = {
  x: 22,
  y: 12
}

let playerDirectionX = -1
let playerDirectionY = 0

const fov = 66

// camera plane
let cameraX = 0
let cameraY = (fov / 100) * 1.33

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

bindKeyboard(document)

const imgTextures = new Image()
imgTextures.src = 'textures.png'

const imgSprites = new Image()
imgSprites.src = 'sprites.png'

requestAnimationFrame(loop)

const sprites = [
  { x: 18, y: 12, z: 0, index: 0 },
  { x: 18, y: 14, z: 0, index: 1 },
]

function render () {

  let gradient

  // floor
  // gradient = ctx.createLinearGradient(0, height / 2, 0, height);
  // gradient.addColorStop(0, '#16171a');
  // gradient.addColorStop(1, '#4a5559');
  // ctx.fillStyle = gradient
  ctx.fillStyle = '#2d2f34'
  ctx.fillRect(0, height / 2, width, height / 2);

  // ceiling
  // gradient = ctx.createLinearGradient(0, 0, 0, height / 2);
  // gradient.addColorStop(1, '#16171a');
  // gradient.addColorStop(0, '#2d313b');
  // ctx.fillStyle = gradient
  ctx.fillStyle = '#27292d'
  ctx.fillRect(0, 0, width, height / 2);

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
    let nx = 2 * x / width - 1

    let rayX = position.x
    let rayY = position.y

    let rayDirX = playerDirectionX + cameraX * nx
    let rayDirY = playerDirectionY + cameraY * nx

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
      if (
        mapX < 0 ||
        mapX >= map[0].length ||
        mapY < 0 ||
        mapY >= map.length
      ) break
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

    // base light level (black)
    const light = 0

    // give x and y sides different brightness
    // draw the pixels of the stripe as a vertical line
    // ctx.fillStyle = side === 1 ? '#b4b4b4' : '#706e73'
    // ctx.fillRect(x, drawStart, sliceWidth, sliceHeight)

    // lighting
    const range = 16
    const clampedDistance = Math.min(distance, range)

    let tint = clampedDistance / range
    if (side === 1) tint += 0.1
    const eased = outQuad(tint)

    // ctx.fillStyle = "rgba(22,23,26, " + eased + ")"
    // ctx.fillRect(x, drawStart, sliceWidth, sliceHeight)
  }

  // SPRITES ===========================================================================================================

  // sort from far to close
  sprites.sort((a, b) => {
    const aDist = ((position.x - a.x) * (position.x - a.x) + (position.y - a.y) * (position.y - a.y))
    const bDist = ((position.x - b.x) * (position.x - b.x) + (position.y - b.y) * (position.y - b.y))
    return bDist - aDist
  })

  sprites.forEach(sprite => {

    // translate sprite position to relative to camera
    const spriteX = sprite.x - position.x
    const spriteY = sprite.y - position.y

    const invDet = 1.0 / (cameraX * playerDirectionY - playerDirectionX * cameraY)

    const transformX = invDet * (playerDirectionY * spriteX - playerDirectionX * spriteY)
    const transformY = invDet * (-cameraY * spriteX + cameraX * spriteY)

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

      const textureX = ((stripe - (-spriteWidth / 2 + spriteScreenX)) * textureSize / spriteWidth) + (sprite.index * textureSize)
      const textureY = 0

      if (
        transformY > 0 && // in front of the camera
        stripe >= 0 && stripe < width && // somewhere on screen
        transformY < zBuffer[stripe]
      ) {
        // TODO lighting based on distance
        ctx.drawImage(imgSprites, textureX, textureY, 1, 16, stripe, drawStartY, 1, drawEndY - drawStartY)
      }
    }
  })

  ctx.fillStyle = '#FFF'
  ctx.font = '12px Courier'
  ctx.textBaseline = 'top'
  ctx.fillText(`pos: ${position.x.toFixed(2)},${position.y.toFixed(2)}`, 5, 5)
  ctx.fillText(`dir: ${playerDirectionX.toFixed(2)},${playerDirectionY.toFixed(2)}`, 5, 20)
  ctx.fillText(`fps: ${parseInt(fps)}`, 5, 35)
}


function getMap (x, y) {
  const ix = Math.round(x)
  const iy = Math.round(y)
  return map[ix] && map[ix][iy]
}

// TODO mouse rotation
function input (delta) {

  const moveSpeed = delta * 3 // tiles per second
  const turnSpeed = delta * 3 // radians per second

  // TODO proper collision

  if (keyDown(KEY_W)) {
    position.x += playerDirectionX * moveSpeed
    position.y += playerDirectionY * moveSpeed
  }

  if (keyDown(KEY_S)) {
    position.x -= playerDirectionX * moveSpeed
    position.y -= playerDirectionY * moveSpeed
  }

  // rotate to the right
  if (keyDown(KEY_D)) {
    // both camera direction and camera plane must be rotated
    let oldDirX = playerDirectionX
    playerDirectionX = playerDirectionX * Math.cos(-turnSpeed) - playerDirectionY * Math.sin(-turnSpeed)
    playerDirectionY = oldDirX * Math.sin(-turnSpeed) + playerDirectionY * Math.cos(-turnSpeed)

    // TODO calculate this every frame in render, not input (based on playerDirection)
    let oldPlaneX = cameraX
    cameraX = cameraX * Math.cos(-turnSpeed) - cameraY * Math.sin(-turnSpeed)
    cameraY = oldPlaneX * Math.sin(-turnSpeed) + cameraY * Math.cos(-turnSpeed)
  }

  // rotate to the left
  if (keyDown(KEY_A)) {
    // both camera direction and camera plane must be rotated
    let oldDirX = playerDirectionX
    playerDirectionX = playerDirectionX * Math.cos(turnSpeed) - playerDirectionY * Math.sin(turnSpeed)
    playerDirectionY = oldDirX * Math.sin(turnSpeed) + playerDirectionY * Math.cos(turnSpeed)
    let oldPlaneX = cameraX
    cameraX = cameraX * Math.cos(turnSpeed) - cameraY * Math.sin(turnSpeed)
    cameraY = oldPlaneX * Math.sin(turnSpeed) + cameraY * Math.cos(turnSpeed)
  }
}

function loop () {
  requestAnimationFrame(loop)
  render()

  // timing for input and FPS counter
  oldTime = time
  time = performance.now()
  let delta = (time - oldTime) / 1000.0 // delta is the time this frame has taken, in seconds
  fps = 1/delta
  input(delta)
}
