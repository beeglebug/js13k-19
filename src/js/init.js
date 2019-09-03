const EMPTY_TILE = ' '
const FLOOR_TILE = '.'

const STATE_TITLE = 'title'
const STATE_PLAY = 'play'

const imgTextures = new Image()
imgTextures.src = 'textures.png'

const imgFont = new Image()
imgFont.src = 'font.png'

const imgSprites = new Image()
imgSprites.src = 'sprites.png'

const whiteSprites = tint(imgSprites, '#FFFFFF')
const redSprites = tint(imgSprites, '#FF0000')

const player = new Player()

let state = STATE_TITLE
// entity under the cursor and close to the player
let interactionTarget = null
let influenceMap

let showMiniMap = false

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

let inputEnabled = false

let zBuffer = []

const handlePointerLockChange = () => {
  if (document.pointerLockElement === outputCanvas) {
    inputEnabled = true
    outputCanvas.classList.add('active')
  } else {
    inputEnabled = false
    outputCanvas.classList.remove('active')
  }
}

let ready = false
let textureImageData
let floorImageData = new ImageData(width, height)

imgTextures.addEventListener('load', () => {
  textureImageData = getImageData(imgTextures)
})

outputCanvas.addEventListener('mousedown', (e) => {
  outputCanvas.requestPointerLock()

  if (!ready) {
    audioContext = new window.AudioContext()

    // starting map
    const tomb = generateDungeon(new RNG(123))
    loadMap(tomb, 7.5, 12.5, 0, 1)
    // loadMap(overworld, 3, 5.5, -1, 0)

    state = STATE_PLAY

    ready = true
    // TODO do this in the loop somehow
    setInterval(() => {
      influenceMap = createInfluenceMap(map)
      populateInfluenceMap(influenceMap, { x: Math.floor(player.x), y: Math.floor(player.y) })
    }, 1000)
  }
})
document.addEventListener('pointerlockchange', handlePointerLockChange)

bindKeyboard(document)

const overworld = generateOverworld()

requestAnimationFrame(loop)

