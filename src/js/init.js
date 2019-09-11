const EMPTY_TILE = ' '
const FLOOR_TILE = '.'

const STATE_TITLE = 0
const STATE_PAUSE = 1
const STATE_PLAY = 2
const STATE_DEAD = 3
const STATE_WIN = 4

const HORIZONTAL = 0
const VERTICAL = 1

let prevState = null
let state = STATE_TITLE

const setState = newState => {
  prevState = state
  state = newState
}

let sprites = []
let whiteSprites = []
let redSprites = []
let greySprites = []
let deadFont
let titleFont

const img = new Image()
img.src = 'assets.png'

let whiteFont
let imgSprites
let imgTextures

img.addEventListener('load', () => {

  let [whiteFontCanvas, whiteFontCtx] = createCanvas(132, 5)
  let [imgSpritesCanvas, imgSpritesCtx] = createCanvas(224, 16)
  let [imgTexturesCanvas, imgTexturesCtx] = createCanvas(128, 16)

  whiteFontCtx.drawImage(img, 0, 32, 132, 5, 0, 0, 132, 5)
  imgSpritesCtx.drawImage(img, 0, 0, 224, 16, 0, 0, 224, 16)
  imgTexturesCtx.drawImage(img, 0, 16, 128, 16, 0, 0, 128, 16)

  whiteFont = whiteFontCanvas
  imgSprites = imgSpritesCanvas
  imgTextures = imgTexturesCanvas

  deadFont = tint(whiteFont, '#FF0000')
  titleFont = tint(whiteFont, '#ffa200')

  textureImageData = getImageData(imgTextures)

  for (let x = 0; x < imgSprites.width; x += 16) {
    const [canvas, ctx] = createCanvas(16, 16)
    ctx.drawImage(imgSprites, x, 0, 16, 16, 0, 0, 16, 16)
    sprites.push(canvas)
    whiteSprites.push(tint(canvas, '#FFFFFF'))
    redSprites.push(tint(canvas, '#FF0000'))
    greySprites.push(tint(canvas, '#4a4a4a'))
  }

  boot()
})

const hudHeight = 13

const player = new Player()
const titleMap = generateTitleMap()

let map

// entity under the cursor and close to the player
let interactionTarget = null
let influenceMap

let showMiniMap = false

const sharedRng = new RNG()

const textureSize = 16
const fov = 66

// camera plane
const camera = { x: 0, y: 0 }

let time = 0 // time of current frame
let oldTime = 0 // time of previous frame
let fps = 0

const width = 320
const height = 200
const upscale = 3

let audioContext
let startTime

const [canvas, ctx] = createCanvas(width, height)
const [lightingCanvas, lightingCtx] = createCanvas(width, height)
const [fogCanvas, fogCtx] = createCanvas(width, height)
const [floorCanvas, floorCtx] = createCanvas(width, height)
const [mapCanvas, mapCtx] = createCanvas(width, height)
const [fowCanvas, fowCtx] = createCanvas(width, height)
const [miniMapCanvas, miniMapCtx] = createCanvas(width, height)
const [outputCanvas, outputCtx] = createCanvas(width * upscale, height * upscale)

document.getElementById('container').appendChild(outputCanvas)

let zBuffer = []
let textureImageData
let floorImageData = new ImageData(width, height)

outputCanvas.addEventListener('mousedown', e => {

  if (state !== STATE_PLAY) e.stopPropagation()

  if (!hasPointerLock()) outputCanvas.requestPointerLock()

  if (state === STATE_PAUSE) return setState(prevState)
  if (state === STATE_DEAD) {
    map = titleMap
    setState(STATE_TITLE)
    return
  }

  if (state === STATE_WIN) {
    map = titleMap
    return setState(STATE_TITLE)
  }

  if (state === STATE_TITLE) {
    start()
    return setState(STATE_PLAY)
  }
})

function start () {
  audioContext = new window.AudioContext()
  player.health = player.maxHealth
  player.mana = player.maxMana
  resetAchievements()
  resetStats()
  startTime = +new Date
  loadMap(generateDungeon(new RNG()))
}

function boot () {
  loadMap(titleMap)
  requestAnimationFrame(loop)
}

const hasPointerLock = () => document.pointerLockElement === outputCanvas

document.addEventListener('pointerlockchange', () => {
  if (hasPointerLock()) {
    outputCanvas.classList.add('active')
  } else {
    if (state === STATE_PLAY) {
      setState(STATE_PAUSE)
    }
    outputCanvas.classList.remove('active')
  }
})

bindInput(document)

