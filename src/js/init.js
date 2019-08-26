const EMPTY_TILE = ' '
const TYPE_PROJECTILE = 'projectile'

const player = {
  x: 1,
  y: 1,
  radius: 0.4,
  velocity: {
    x: 0,
    y: 0,
  },
  speed: 4,
  direction: {
    x: 0,
    y: 1
  },
  mapX: 0,
  mapY: 0
}

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
const [outputCanvas, outputCtx] = createCanvas(width * 2, height * 2)

document.getElementById('container').appendChild(outputCanvas)

// outputCanvas.after(lightingCanvas)
// outputCanvas.after(fogCanvas)

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

outputCanvas.addEventListener('mousedown', (e) => {
  outputCanvas.requestPointerLock()

  if (!ready) {
    audioContext = new window.AudioContext()

    // starting map
    loadMap(map1, 16, 12, 0.9, -0.5)

    ready = true
    setInterval(() => {
      influenceMap = createInfluenceMap(map)
      populateInfluenceMap(influenceMap, { x: Math.floor(player.x), y: Math.floor(player.y) })
    }, 1000)
  }
})
document.addEventListener('pointerlockchange', handlePointerLockChange)

bindKeyboard(document)

const imgTextures = new Image()
imgTextures.src = 'textures.png'

const imgSprites = new Image()
imgSprites.src = 'sprites.png'

const imgFont = new Image()
imgFont.src = 'font.png'

const zPos = scale => 0 - (1 - scale) / 2

let sprites = [
  { x: 3, y: 7, z: 0, scale: 1, index: 0 },
  { x: 1.5, y: 1.5, z: zPos(0.5), scale: 0.5, index: 1 },
  { x: 4, y: 7, z: 0, scale: 1, index: 5 },
  { x: 18, y: 4, z: zPos(0.8), scale: 0.8, index: 4 },
  { x: 19, y: 4, z: zPos(0.8), scale: 0.8, index: 4 },
  { x: 20, y: 4, z: zPos(0.8), scale: 0.8, index: 4 },
  { x: 21, y: 4, z: zPos(0.8), scale: 0.8, index: 4 },
  { x: 22, y: 4, z: zPos(0.8), scale: 0.8, index: 4 },
]
