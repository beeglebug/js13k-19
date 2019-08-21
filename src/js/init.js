const player = {
  x: 1,
  y: 1,
  radius: 0.4,
  direction: {
    x: 0,
    y: 1
  },
  mapX: 0,
  mapY: 0
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
const [fogCanvas, fogCtx] = createCanvas(width, height)

document.getElementById('container').appendChild(canvas)

// canvas.after(lightingCanvas)
// canvas.after(fogCanvas)

let inputEnabled = false

let zBuffer = []

const handlePointerLockChange = () => {
  if (document.pointerLockElement === canvas) {
    inputEnabled = true
    canvas.classList.add('active')
  } else {
    inputEnabled = false
    canvas.classList.remove('active')
  }
}

let ready = false

canvas.addEventListener('mousedown', (e) => {
  canvas.requestPointerLock()

  if (!ready) {
    audioContext = new window.AudioContext()
    loadMap(map1, 5.36, 6.20, -0.67, -0.75)
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

const sprites = [
  { x: 9.5, y: 8.5, z: 0, scale: 1, index: 0 },
  { x: 1.5, y: 3.5, z: -0.25, scale: 0.5, index: 1 },
]
