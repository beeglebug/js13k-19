const EMPTY_TILE = ' '
const FLOOR_TILE = '.'
const TYPE_PLAYER = 'player'
const TYPE_PROJECTILE = 'projectile'

const player = {
  type: TYPE_PLAYER,
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
  mapY: 0,
  health: 100,
  mana: 100
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
    loadMap(map3, 6, 6, 0.23, -1)

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
