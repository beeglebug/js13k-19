const EMPTY_TILE = ' '
const FLOOR_TILE = '.'

const STATE_TITLE = 0
const STATE_PAUSE = 1
const STATE_PLAY = 2
const STATE_DEAD = 3

const imgTextures = new Image()
imgTextures.src = 'textures.png'

const imgFont = new Image()
imgFont.src = 'font.png'

const imgSprites = new Image()
imgSprites.src = 'sprites.png'

const sprites = []
const whiteSprites = []
const redSprites = []

const player = new Player()

let state = STATE_TITLE
// entity under the cursor and close to the player
let interactionTarget = null
let influenceMap

let showMiniMap = false

const sharedRng = new RNG()

const fov = 66

// camera plane
const camera = { x: 0, y: 0 }

let time = 0 // time of current frame
let oldTime = 0 // time of previous frame
let fps = 0

const width = 320
const height = 180

const [canvas, ctx] = createCanvas(width, height)
const [lightingCanvas, lightingCtx] = createCanvas(width, height)
const [fogCanvas, fogCtx] = createCanvas(width, height)
const [floorCanvas, floorCtx] = createCanvas(width, height)
const [mapCanvas, mapCtx] = createCanvas(width, height)
const [fowCanvas, fowCtx] = createCanvas(width, height)
const [miniMapCanvas, miniMapCtx] = createCanvas(width, height)
const [outputCanvas, outputCtx] = createCanvas(width * 2, height * 2)

document.getElementById('container').appendChild(outputCanvas)

// outputCanvas.after(lightingCanvas)
// outputCanvas.after(fogCanvas)
// outputCanvas.after(floorCanvas)
// outputCanvas.after(mapCanvas)
// outputCanvas.after(fowCanvas)
// outputCanvas.after(miniMapCanvas)
// outputCanvas.after(whiteSprites)

let zBuffer = []

const handlePointerLockChange = () => {
  if (document.pointerLockElement === outputCanvas) {
    state = STATE_PLAY
    outputCanvas.classList.add('active')
  } else {
    state = STATE_PAUSE
    outputCanvas.classList.remove('active')
  }
}

let ready = false
let textureImageData
let floorImageData = new ImageData(width, height)

imgTextures.addEventListener('load', () => {
  textureImageData = getImageData(imgTextures)
})

imgSprites.addEventListener('load', () => {
  // TODO smaller than 16px sprites
  for (let x = 0; x < imgSprites.width; x += 16) {
    const [canvas, ctx] = createCanvas(16, 16)
    ctx.drawImage(imgSprites, x, 0, 16, 16, 0, 0, 16, 16)
    sprites.push(canvas)
    whiteSprites.push(tint(canvas, '#FFFFFF'))
    redSprites.push(tint(canvas, '#FF0000'))
  }
})

outputCanvas.addEventListener('mousedown', (e) => {
  outputCanvas.requestPointerLock()

  if (!ready) {
    audioContext = new window.AudioContext()

    // starting map

    // loadMap(overworld, 5.5, 13.5, 0, -1)
    loadMap(createTestMap(), 5.5, 13.5, 0, -1)
    // loadMap(generateDungeon(new RNG(123)), 6, 8, 0, -1)

    state = STATE_PLAY

    ready = true
  }
})
document.addEventListener('pointerlockchange', handlePointerLockChange)

bindKeyboard(document)

const overworld = generateOverworld()

requestAnimationFrame(loop)

