const player = {
  x: 1.4402922505636784,
  y: 6.104280372117127,
  radius: 0.4,
  direction: {
    x: 0.5049865020882822,
    y: -0.8631272401614042
  }
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

const handlePointerLockChange = () => {
  if (document.pointerLockElement === canvas) {
    inputEnabled = true
    canvas.classList.add('active')
  } else {
    inputEnabled = false
    canvas.classList.remove('active')
  }
}

canvas.addEventListener('click', (e) => {
  canvas.requestPointerLock()

  // TEMP FAKE FOR GIF
  if (e.which === 3) {
    if (map === map1) {
      loadMap(map2, 2.5, 2.5, 0, -1)
    } else if (map === map2) {
      loadMap(map1, 3.5, 4.5, 0, 1)
    }
  }
})
document.addEventListener('pointerlockchange', handlePointerLockChange)

bindKeyboard(document)

const imgTextures = new Image()
imgTextures.src = 'textures.png'

const imgSprites = new Image()
imgSprites.src = 'sprites.png'

const sprites = [
  // { x: 9.5, y: 8.5, index: 0 },
]
