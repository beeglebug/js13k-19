const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,2,2,2,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1],
  [1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,3,0,0,0,3,0,0,0,1],
  [1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,2,2,0,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1],
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

// const textures = new Image()
// textures.src = 'textures.png'

requestAnimationFrame(loop)

const sprites = []

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

    const [distance, side, wallX] = raycast(x)

    zBuffer.push(distance)

    // Calculate height of line to draw on screen
    let sliceHeight = Math.abs(Math.floor(height / distance))

    // calculate lowest and highest pixel to fill in current stripe
    let drawStart = Math.floor((height - sliceHeight) / 2)

    // x coordinate on the texture
    const textureSize = 16
    const textureX = wallX * (textureSize - 1)

    // ctx.drawImage(textures, textureX, 0, 1, textureSize, x, drawStart, sliceWidth, sliceHeight)

    // base light level (black)
    const light = 0

    // give x and y sides different brightness
    // draw the pixels of the stripe as a vertical line
    ctx.fillStyle = side === 1 ? '#b4b4b4' : '#706e73'
    ctx.fillRect(x, drawStart, sliceWidth, sliceHeight)

    // lighting
    const range = 16
    const clampedDistance = Math.min(distance, range)

    let tint = clampedDistance / range
    if (side === 1) tint += 0.1
    const eased = outQuad(tint)

    // ctx.fillStyle = "rgba(22,23,26, " + eased + ")"
    // ctx.fillRect(x, drawStart, sliceWidth, sliceHeight)
  }

  // SPRITES

  // sort from far to close
  sprites.sort((a, b) => {
    const aDist = ((position.x - a.x) * (position.x - a.x) + (position.y - a.y) * (position.y - a.y))
    const bDist = ((position.x - b.x) * (position.x - b.x) + (position.y - b.y) * (position.y - b.y))
    return aDist - bDist
  })

  sprites.forEach(sprite => {

    // translate sprite position to relative to camera
    const spriteX = sprite.x - position.x
    const spriteY = sprite.y - position.y

    const invDet = 1.0 / (cameraX * rayDirY - rayDirX * cameraY)

    const transformX = invDet * (rayDirY * spriteX - rayDirX * spriteY)
    const transformY = invDet * (-cameraY * spriteX + cameraX * spriteY)

    const spriteScreenX = Math.round((w / 2) * (1 + transformX / transformY))

    // //calculate height of the sprite on screen
    // const spriteHeight = Math.abs(Math.round(h / (transformY)))
    // //calculate lowest and highest pixel to fill in current stripe
    // const drawStartY = -spriteHeight / 2 + h / 2;
    // if(drawStartY < 0) drawStartY = 0;
    // const drawEndY = spriteHeight / 2 + h / 2;
    // if(drawEndY >= h) drawEndY = h - 1;
    //
    // //calculate width of the sprite
    // const spriteWidth = abs( int (h / (transformY)));
    // const drawStartX = -spriteWidth / 2 + spriteScreenX;
    // if(drawStartX < 0) drawStartX = 0;
    // const drawEndX = spriteWidth / 2 + spriteScreenX;
    // if(drawEndX >= w) drawEndX = w - 1;
    //
    // //loop through every vertical stripe of the sprite on screen
    // for(int stripe = drawStartX; stripe < drawEndX; stripe++)
    // {
    //   const texX = int(256 * (stripe - (-spriteWidth / 2 + spriteScreenX)) * texWidth / spriteWidth) / 256;
    //   //the conditions in the if are:
    //   //1) it's in front of camera plane so you don't see things behind you
    //   //2) it's on the screen (left)
    //   //3) it's on the screen (right)
    //   //4) ZBuffer, with perpendicular distance
    //   if(transformY > 0 && stripe > 0 && stripe < w && transformY < ZBuffer[stripe])
    //     for(int y = drawStartY; y < drawEndY; y++) //for every pixel of the current stripe
    //   {
    //     const d = (y) * 256 - h * 128 + spriteHeight * 128; //256 and 128 factors to avoid floats
    //     const texY = ((d * texHeight) / spriteHeight) / 256;
    //     Uint32 color = texture[sprite[spriteOrder[i]].texture][texWidth * texY + texX]; //get current color from the texture
    //     if((color & 0x00FFFFFF) != 0) buffer[y][stripe] = color; //paint pixel if it isn't black, black is the invisible color
    //   }
    // }
  })

  ctx.fillStyle = '#FFF'
  ctx.font = '12px Courier'
  ctx.textBaseline = 'top'
  ctx.fillText(`${position.x.toFixed(2)},${position.y.toFixed(2)}`, 5, 5)
  ctx.fillText(`${playerDirectionX.toFixed(2)},${playerDirectionY.toFixed(2)}`, 5, 20)
  ctx.fillText(parseInt(fps), 5, 35)
}

function raycast (x) {

  let rayLength
  let side

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
    // Check if ray has hit a wall
    if (getMap(mapX, mapY) > 0) break
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

  return [rayLength, side, wallX]
}

function getMap (x, y) {
  const ix = Math.round(x)
  const iy = Math.round(y)
  return map[ix] && map[ix][iy]
}

// TODO mouse rotate
function input (delta) {
  // speed modifiers
  const moveSpeed = delta * 5 // the constant value is in squares/second
  const rotSpeed = delta * 5 // the constant value is in radians/second

  // move forward if no wall in front of you
  if (keyDown(KEY_W)) {
    if(getMap(position.x + playerDirectionX * moveSpeed,position.y) === 0) {
      position.x += playerDirectionX * moveSpeed
    }
    if(getMap(position.x,position.y + playerDirectionY * moveSpeed) === 0) {
      position.y += playerDirectionY * moveSpeed
    }
  }

  // move backwards if no wall behind you
  if (keyDown(KEY_S)) {
    if(getMap(position.x - playerDirectionX * moveSpeed,position.y) === 0) position.x -= playerDirectionX * moveSpeed
    if(getMap(position.x,position.y - playerDirectionY * moveSpeed) === 0) position.y -= playerDirectionY * moveSpeed
  }

  // rotate to the right
  if (keyDown(KEY_D)) {
    // both camera direction and camera plane must be rotated
    let oldDirX = playerDirectionX
    playerDirectionX = playerDirectionX * Math.cos(-rotSpeed) - playerDirectionY * Math.sin(-rotSpeed)
    playerDirectionY = oldDirX * Math.sin(-rotSpeed) + playerDirectionY * Math.cos(-rotSpeed)
    let oldPlaneX = cameraX
    cameraX = cameraX * Math.cos(-rotSpeed) - cameraY * Math.sin(-rotSpeed)
    cameraY = oldPlaneX * Math.sin(-rotSpeed) + cameraY * Math.cos(-rotSpeed)
  }

  // rotate to the left
  if (keyDown(KEY_A)) {
    // both camera direction and camera plane must be rotated
    let oldDirX = playerDirectionX
    playerDirectionX = playerDirectionX * Math.cos(rotSpeed) - playerDirectionY * Math.sin(rotSpeed)
    playerDirectionY = oldDirX * Math.sin(rotSpeed) + playerDirectionY * Math.cos(rotSpeed)
    let oldPlaneX = cameraX
    cameraX = cameraX * Math.cos(rotSpeed) - cameraY * Math.sin(rotSpeed)
    cameraY = oldPlaneX * Math.sin(rotSpeed) + cameraY * Math.cos(rotSpeed)
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
