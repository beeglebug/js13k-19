const EMPTY_TILE = ' '
const FLOOR_TILE = '.'

const STATE_TITLE = 0
const STATE_PAUSE = 1
const STATE_PLAY = 2
const STATE_DEAD = 3

let prevState = null
let state = STATE_TITLE

const setState = newState => {
  prevState = state
  state = newState
}

const imgTextures = new Image()
imgTextures.src = 'textures.png'

const whiteFont = new Image()
whiteFont.src = 'font.png'

const imgSprites = new Image()
imgSprites.src = 'sprites.png'

let sprites = []
let whiteSprites = []
let redSprites = []
let redFont

whiteFont.addEventListener('load', () => {
  redFont = tint(whiteFont, '#FF0000')
})

const player = new Player()
let map

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

let audioContext

let miniMapWidth = 0
let miniMapHeight = 0

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

let booted = false
let textureImageData
let floorImageData = new ImageData(width, height)

let imgToLoad = 3
const imgLoaded = () => {
  imgToLoad--
  if (imgToLoad <= 0) boot()
}

imgTextures.addEventListener('load', () => {
  textureImageData = getImageData(imgTextures)
  imgLoaded()
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
  imgLoaded()
})

whiteFont.addEventListener('load', imgLoaded)

outputCanvas.addEventListener('mousedown', e => {

  if (state !== STATE_PLAY) e.stopPropagation()

  if (!hasPointerLock()) outputCanvas.requestPointerLock()

  if (state === STATE_PAUSE) return setState(prevState)
  if (state === STATE_DEAD) return setState(STATE_TITLE)

  if (state === STATE_TITLE) {
    reset()
    return setState(STATE_PLAY)
  }
})

function reset () {
  audioContext = new window.AudioContext()
  player.health = player.maxHealth
  player.mana = player.maxMana
  // loadMap(overworld, 5.5, 5.5, 0, -1)
  loadMap(createTestMap())
  // loadMap(generateDungeon(new RNG()), 6, 8, 0, -1)
}

function boot () {
  requestAnimationFrame(loop)
}

const hasPointerLock = () => document.pointerLockElement === outputCanvas

document.addEventListener('pointerlockchange', () => {
  if (hasPointerLock()) {
    outputCanvas.classList.add('active')
  } else {
    setState(STATE_PAUSE)
    outputCanvas.classList.remove('active')
  }
})

bindInput(document)

const overworld = generateOverworld()

